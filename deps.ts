export {
  createHttpError,
  HttpError,
  Status,
  STATUS_TEXT,
} from "https://deno.land/std@0.151.0/http/mod.ts";
export {
  isNull,
  isPlainObject,
} from "https://deno.land/x/isx@1.0.0-beta.19/mod.ts";
export { type Handler } from "https://deno.land/x/http_utils@1.0.0-beta.1/mod.ts";

export function safeSync<R, E>(
  fn: () => R,
): [data: R] | [data: undefined, error: E] {
  try {
    return [fn()];
  } catch (er) {
    return [, er];
  }
}

export function trim(value: string): string {
  return value.trim();
}
