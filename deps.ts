export {
  createHttpError,
  HttpError,
  Status,
  STATUS_TEXT,
} from "https://deno.land/std@0.150.0/http/mod.ts";
export {
  isNull,
  isPlainObject,
} from "https://deno.land/x/isx@1.0.0-beta.19/mod.ts";

export function safeSync<R, E>(
  fn: () => R,
): [data: R] | [data: undefined, error: E] {
  try {
    return [fn()];
  } catch (er) {
    return [, er];
  }
}
