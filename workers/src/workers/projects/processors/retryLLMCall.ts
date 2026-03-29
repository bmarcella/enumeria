/* eslint-disable @typescript-eslint/no-explicit-any */

const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_BASE_DELAY_MS = 1500;

/**
 * Retries an async LLM call with exponential backoff.
 * Throws the last error after all retries are exhausted.
 */
export const retryLLMCall = async <T>(
  fn: () => Promise<T>,
  maxRetries = DEFAULT_MAX_RETRIES,
  baseDelayMs = DEFAULT_BASE_DELAY_MS,
): Promise<T> => {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;

      // Don't retry on validation/schema errors — they won't self-heal
      const msg = String(err?.message ?? '').toLowerCase();
      if (msg.includes('validation') || msg.includes('schema') || msg.includes('zod')) {
        throw err;
      }

      if (attempt < maxRetries) {
        const delay = baseDelayMs * Math.pow(2, attempt);
        console.warn(
          `[retryLLMCall] Attempt ${attempt + 1}/${maxRetries + 1} failed, retrying in ${delay}ms...`,
          err?.message ?? err,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
};
