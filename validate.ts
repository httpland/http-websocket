import { createHttpError, HttpError, isNull, Status } from "./deps.ts";

/** Validate HTTP request is WebSocket request. */
export function validateRequest(req: Request): [valid: true] | [
  valid: false,
  error: HttpError,
] {
  if (req.method !== "GET") {
    return [
      false,
      createHttpError(Status.MethodNotAllowed, `Invalid HTTP Request method.`),
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
