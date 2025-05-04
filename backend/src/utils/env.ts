import { z } from "zod";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const createEnv = (env: NodeJS.ProcessEnv) => {
  const envSchema = z.object({
    PORT: z.coerce.number().default(5000),
    MONGODB_URI: z.string().nonempty(),
    CLIENT_URL: z.string().nonempty(),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

    ACCESS_TOKEN_SECRET: z.string().nonempty(),
    ACCESS_TOKEN_EXPIRY: z.string().default("30m"),
    REFRESH_TOKEN_SECRET: z.string().nonempty(),
    REFRESH_TOKEN_EXPIRY: z.string().default("7d"),

    ENCRYPTION_KEY: z.string().nonempty(),

    MAIL_HOST: z.string().nonempty(),
    MAIL_PORT: z.coerce.number().default(2525),
    MAIL_USERNAME: z.string().nonempty(),
    MAIL_PASSWORD: z.string().nonempty(),

    CLOUD_NAME: z.string().nonempty(),
    API_KEY: z.string().nonempty(),
    API_SECRET: z.string().nonempty(),
  });

  const parsedEnv = envSchema.safeParse(env);

  if (!parsedEnv.success) {
    throw new Error(
      `⚠️  Invalid environment variables:\n ${parsedEnv.error.issues
        .map((issue) => issue.message + ":" + issue.path)
        .join("\n ")}`
    );
  }

  return parsedEnv.data;
};

/**
 * holds all the environment variables
 */
export const env = createEnv(process.env);
