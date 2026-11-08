import { NextResponse } from "next/server";
import { Webhooks } from "@polar-sh/nextjs";
import {
  POLAR_WEBHOOK_SECRET,
  POLAR_DONATION_PRODUCT_ID,
  POLAR_DONATION_SUBSCRIPTION_PRODUCT_ID,
} from "@/constants/env";
import { db } from "@/lib/db";

/**
 * Polar webhook payloads arrive as raw snake_case JSON (no camelCase
 * transformation by the Webhooks helper). The SDK's TS types are camelCase,
 * so ordering fields are accessed via snake_case keys on `any`.
 */

/**
 * Only persist events that belong to our donation products — anything else on
 * this Polar account (other products, subscriptions, etc.) is ignored.
 */
const isDonationProduct = (productId?: string | null) => {
  if (!productId) return false;
  return (
    productId === POLAR_DONATION_PRODUCT_ID ||
    productId === POLAR_DONATION_SUBSCRIPTION_PRODUCT_ID
  );
};

/**
 * Pull message/socialUrl/name from order.custom_field_data first, falling back
 * to the customer-level metadata (Polar also mirrors custom field values there).
 */
const extractCustomFields = (order: any) => {
  const data = order.custom_field_data || {};
  const meta = order.customer?.metadata || {};

  const message =
    typeof data.message === "string"
      ? data.message
      : typeof meta.message === "string"
        ? meta.message
        : null;

  const socialUrl =
    typeof data.socialUrl === "string"
      ? data.socialUrl
      : typeof meta.socialUrl === "string"
        ? meta.socialUrl
        : null;

  const name =
    typeof data.name === "string"
      ? data.name
      : typeof meta.name === "string"
        ? meta.name
        : null;

  return { message, socialUrl, name };
};

/**
 * Upsert the Subscription row from a Polar subscription payload.
 *
 * `customer` is a fallback: a nested order.subscription has no customer
 * object — the order itself carries it (order.customer).
 */
const upsertSubscription = async (sub: any, customer?: any) => {
  if (!sub?.id) return null;

  const email = sub.customer?.email || customer?.email || null;
  if (!email) return null;

  // Ensure the donor row exists (FK targets email)
  await db.donor.upsert({
    where: { email },
    update: {},
    create: { email },
  });

  const data = {
    donorEmail: email,
    productId: sub.product_id || null,
    amount: sub.amount || 0,
    currency: sub.currency || "usd",
    interval: sub.recurring_interval || "month",
    status: sub.status || "active",
    currentPeriodStart: sub.current_period_start
      ? new Date(sub.current_period_start)
      : null,
    currentPeriodEnd: sub.current_period_end
      ? new Date(sub.current_period_end)
      : null,
    cancelAtPeriodEnd: Boolean(sub.cancel_at_period_end),
    endsAt: sub.ends_at ? new Date(sub.ends_at) : null,
  };

  await db.subscription.upsert({
    where: { id: sub.id },
    update: data,
    create: { id: sub.id, ...data },
  });

  return email;
};

export const POST = POLAR_WEBHOOK_SECRET
  ? Webhooks({
      webhookSecret: POLAR_WEBHOOK_SECRET,

      // Main event: order.updated (paid orders) — covers one-time purchases
      // AND every subscription charge (create + renewals).
      onOrderUpdated: async ({ data: order }) => {
        if (!isDonationProduct(order.product_id)) return;

        const status = String(order.status || "").toLowerCase();
        if (!order.paid && status !== "paid") return;

        const checkoutId = order.checkout_id || `order-${order.id}`;
        const amount = order.total_amount || 0;
        const currency = order.currency || "usd";
        const email = order.customer?.email || null;

        // Email is required to associate a donor — skip otherwise
        if (!email) {
          console.warn("Skipping donation without customer email:", checkoutId);
          return;
        }

        const { message, socialUrl, name } = extractCustomFields(order);
        const donorName = name || order.customer?.name || null;
        const subscriptionId = order.subscription_id || null;
        const frequency = subscriptionId ? "month" : "once";

        // Upsert the donor (email is the identity)
        await db.donor.upsert({
          where: { email },
          update: {
            ...(donorName ? { name: donorName } : {}),
            ...(socialUrl ? { socialUrl } : {}),
            metadata: { lastCheckoutAt: new Date().toISOString() },
          },
          create: {
            email,
            name: donorName,
            socialUrl,
            metadata: { firstCheckoutAt: new Date().toISOString() },
          },
        });

        // Keep the Subscription row in sync (create + renewals)
        if (subscriptionId && order.subscription) {
          await upsertSubscription(order.subscription, order.customer);
        }

        // Cycle transition: a subscription order represents the CURRENT cycle
        // while it's live — flip any older "active" cycle to completed before
        // recording this one (one "active" row per subscription at a time).
        if (subscriptionId) {
          await db.donation.updateMany({
            where: {
              subscriptionId,
              status: "active",
            },
            data: { status: "completed" },
          });
        }

        // Record the payment. If a pending row exists for this subscription
        // (created by subscription.cycled), confirm it — this keeps one row
        // per cycle even when the events arrive in either order. Otherwise
        // create the row fresh. Subscription rows are "active" (current
        // cycle); one-time purchases are immediately "completed".
        const pending = subscriptionId
          ? await db.donation.findFirst({
              where: { subscriptionId, status: "pending" },
              orderBy: { createdAt: "desc" },
            })
          : null;

        if (pending) {
          await db.donation.update({
            where: { id: pending.id },
            data: {
              donorEmail: email,
              checkoutId,
              amount,
              currency,
              frequency,
              message,
              status: "active",
            },
          });
        } else {
          await db.donation.upsert({
            where: { checkoutId },
            update: {
              amount,
              currency,
              frequency,
              subscriptionId,
              message,
              status: subscriptionId ? "active" : "completed",
            },
            create: {
              donorEmail: email,
              checkoutId,
              amount,
              currency,
              frequency,
              subscriptionId,
              message,
              status: subscriptionId ? "active" : "completed",
            },
          });
        }
      },

      // Refunds: mark the matching donation row(s) with the order's status
      // (e.g. "refunded"). If the refund hits the subscription's CURRENT
      // billed period, also cancel the subscription.
      onOrderRefunded: async ({ data: order }) => {
        if (!isDonationProduct(order.product_id)) return;

        const checkoutId = order.checkout_id || `order-${order.id}`;
        const refundStatus = String(order.status || "refunded").toLowerCase();

        await db.donation.updateMany({
          where: { checkoutId },
          data: { status: refundStatus },
        });

        // Only relevant for subscription orders — skip one-time purchases.
        const subscription = order.subscription;
        if (!subscription?.id) return;
        if (!isDonationProduct(subscription.product_id)) return;

        // Is any line item still covering an ongoing period? If the refunded
        // order's period has already ended (past month), the subscription
        // itself is untouched.
        const now = Date.now();
        const coversActivePeriod = (order.items ?? []).some(
          (item) =>
            item.end_timestamp &&
            new Date(item.end_timestamp).getTime() > now,
        );

        if (coversActivePeriod) {
          const email = order.customer?.email || null;
          if (email) {
            await db.subscription.upsert({
              where: { id: subscription.id },
              update: { status: "canceled" },
              create: {
                id: subscription.id,
                donorEmail: email,
                amount: subscription.amount ?? 0,
                currency: subscription.currency ?? "usd",
                status: "canceled",
              },
            });
          } else {
            await db.subscription.update({
              where: { id: subscription.id },
              data: { status: "canceled" },
            });
          }
        }
      },

      // Cancellation: sync the Subscription row. cancel_at_period_end=true
      // means it stil
      // l runs until period end, but we mark it canceled so
      // renewals/status are known to be stopping; immediate cancels carry
      // their own status ("canceled").
      onSubscriptionCanceled: async ({ data: subscription }) => {
        if (!subscription?.id) return;
        if (!isDonationProduct(subscription.product_id)) return;

        const cancelAtPeriodEnd = Boolean(subscription.cancel_at_period_end);

        await upsertSubscription({
          ...subscription,
          status: cancelAtPeriodEnd ? "canceled" : subscription.status,
        });
      },

      // A new billing period started. Not a payment confirmation — the charge
      // may still fail. Create the cycle row as "pending"; order.updated
      // confirms it as "active" when paid, and past_due/revoked mark it
      // "failed" if the charge never succeeds.
      onSubscriptionCycled: async ({ data: subscription }) => {
        if (!subscription?.id) return;
        if (!isDonationProduct(subscription.product_id)) return;

        const email = subscription.customer?.email || null;
        if (!email) {
          console.warn("Skipping cycled without customer email:", subscription.id);
          return;
        }

        await upsertSubscription(subscription);

        await db.donation.create({
          data: {
            donorEmail: email,
            checkoutId: `cycled-${subscription.id}-${subscription.current_period_start}`,
            amount: subscription.amount,
            currency: subscription.currency,
            frequency: "month",
            subscriptionId: subscription.id,
            status: "pending",
          },
        });
      },

      // Subscription lifecycle: keep the Subscription row in sync. These are
      // recoverable (past_due -> active on payment recovery; revoked after
      // retries are exhausted).
      onPayload: async ({ data: subscription, type }) => {
        if (
          type === "subscription.past_due" ||
          type === "subscription.active" ||
          type === "subscription.revoked"
        ) {
          if (!subscription?.id) return;
          if (!isDonationProduct(subscription.product_id)) return;

          await upsertSubscription(subscription);

          // Payment failed / gave up: terminate any unconfirmed cycle rows so
          // they don't linger as pending (and never look like revenue).
          if (
            type === "subscription.past_due" ||
            type === "subscription.revoked"
          ) {
            await db.donation.updateMany({
              where: {
                subscriptionId: subscription.id,
                status: "pending",
              },
              data: { status: "failed" },
            });
          }
        }
      },
    })
  : async () =>
      NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 },
      );
