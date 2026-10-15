import { z } from "zod";

const schema = z.object({
  VITE_API_BASE_URL: z.url(),
});

const result = schema.safeParse(import.meta.env);

if (!result.success) {
  throw new Error(
    `Invalid frontend configuration: ${z.prettifyError(result.error)}`,
  );
}

export const env = Object.freeze({
  apiBaseUrl: result.data.VITE_API_BASE_URL,
});
