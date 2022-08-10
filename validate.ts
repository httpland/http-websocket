import { createHttpError, HttpError, isNull, Status } from "./deps.ts";

/** HTTP request validation for websocket.
 * The validation is based on RFC 6455, 4.1.
 * ```ts
 * import {
 *   validateRequest,
 * } from "https://deno.land/x/http_websocket@$VERSION/mod.ts";
 * import {
 *   assertEquals,
 *   assertIsError,
 * } from "https://deno.land/std@$VERSION/testing/asserts.ts";
 *
 * const req = new Request("http://localhost/");
 * const result = validateRequest(req);
 * assertEquals(result[0], false);
 * assertIsError(result[1]);
 * ```
 */
export function validateRequest(req: Request): [valid: true] | [
  valid: false,
  error: HttpError,
] {
  if (req.method !== "GET") {
    return [
      false,
      createHttpError(Status.MethodNotAllowed, `Invalid HTTP Request method.`, {
        headers: {
          Allow: "GET",
        },
      }),
    ];
  }

  const upgrade = req.headers.get("upgrade");

  if (isNull(upgrade)) {
    return [
      false,
      createHttpError(
        Status.BadRequest,
        `Missing header. "Upgrade"`,
      ),
    ];
  }

  if (upgrade.toLowerCase() !== "websocket") {
    return [
      false,
      createHttpError(
        Status.BadRequest,
        `Invalid header. "Upgrade" header must be "websocket"`,
      ),
    ];
  }

  const connection = req.headers.get("connection");
  if (isNull(connection)) {
    return [
      false,
      createHttpError(Status.BadRequest, `Missing header. "Connection"`),
    ];
  }
  if (connection.toLowerCase() !== "upgrade") {
    return [
      false,
      createHttpError(
        Status.BadRequest,
        `Invalid header. "Connection" header must be "Upgrade"`,
      ),
    ];
  }
  const secWebSocketKey = req.headers.get("Sec-WebSocket-Key");
  if (isNull(secWebSocketKey)) {
    return [
      false,
      createHttpError(Status.BadRequest, `Missing header. "Sec-WebSocket-Key"`),
    ];
  }

  const secWebSocketVersion = req.headers.get("Sec-WebSocket-Version");
  if (isNull(secWebSocketVersion)) {
    return [
      false,
      createHttpError(
        Status.BadRequest,
        `Missing header. "Sec-WebSocket-Version"`,
      ),
    ];
  }
  if (secWebSocketVersion !== "13") {
    return [
      false,
      createHttpError(
        Status.BadRequest,
        `Invalid header. "Sec-WebSocket-Version" must be "13"`,
      ),
    ];
  }

  return [true];
}
