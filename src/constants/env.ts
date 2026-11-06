import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().min(1),
  NEXT_PRIVATE_CLOUDINARY_API_KEY: z.string().min(1),
  NEXT_PRIVATE_CLOUDINARY_API_SECRET: z.string().min(1),
  NEXT_PUBLIC_CLOUDINARY_PRESET: z.string().min(1),
  NEXT_AUTH_PRIVATE_KEY: z.string().min(1),
  NEXT_AUTH_PUBLIC_KEY: z.string().min(1),
  NEXT_GITHUB_AUTH_CLIENT_ID: z.string().min(1),
  NEXT_GITHUB_AUTH_CLIENT_SECRET: z.string().min(1),
  NEXT_GITHUB_API_KEY: z.string().min(1),
  POLAR_ACCESS_TOKEN: z.string().min(1),
  NEXT_PUBLIC_POLAR_DONATION_PRODUCT_ID: z.string().min(1),
  NODE_ENV: z.string().min(1),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success && typeof window === "undefined") {
  throw new Error(
    `❌ Invalid env: ${JSON.parse(parsed.error.message)[0].message}`,
  );
}

// CLOUDINARY
export const CLOUDINARY_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
export const CLOUDINARY_API_KEY = process.env.NEXT_PRIVATE_CLOUDINARY_API_KEY!;
export const CLOUDINARY_API_SECRET =
  process.env.NEXT_PRIVATE_CLOUDINARY_API_SECRET!;
export const CLOUDINARY_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET!;

// AUTH
export const AUTH_PRIVATE_KEY = process.env.NEXT_AUTH_PRIVATE_KEY!;
export const AUTH_PUBLIC_KEY = process.env.NEXT_AUTH_PUBLIC_KEY!;

// Github
export const GITHUB_AUTH_CLIENT_ID = process.env.NEXT_GITHUB_AUTH_CLIENT_ID!;
export const GITHUB_AUTH_CLIENT_SECRET =
  process.env.NEXT_GITHUB_AUTH_CLIENT_SECRET!;
export const GITHUB_API_KEY = process.env.NEXT_GITHUB_API_KEY!;

// Polar
export const POLAR_ACCESS_TOKEN = process.env.POLAR_ACCESS_TOKEN!;
export const POLAR_DONATION_PRODUCT_ID =
  process.env.NEXT_PUBLIC_POLAR_DONATION_PRODUCT_ID!;

export const NODE_ENV = process.env.NODE_ENV!;
