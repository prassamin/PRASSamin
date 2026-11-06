import { NODE_ENV, POLAR_ACCESS_TOKEN } from "@/constants/env";
import { Polar } from "@polar-sh/sdk";

export const polar = new Polar({
  accessToken: POLAR_ACCESS_TOKEN,
  server: NODE_ENV === "production" ? "production" : "sandbox",
});
