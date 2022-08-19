import { Handler, safeSync, Status, STATUS_TEXT, trim } from "./deps.ts";
import { validateRequest } from "./validate.ts";

/** WebSocket handler options. */
export interface HandlerOptions {
  /** Select sub-protocol.  */
  readonly protocol?: (protocols: ReadonlyArray<string>) => string | undefined;

  /** Whether to do as a debug mode.
   * When this is `true`, if an error occurs in the server, the
   * Include detailed error messages in the response.
   * @remarks For production use, this feature is not recommended.
   */
  readonly debug?: boolean;

  /**
   * If the client does not respond to this frame with a
   * `pong` within the timeout specified, the connection is deemed
   * unhealthy and is closed. The `close` and `error` event will be emitted.
   *
   * The default is 120 seconds. Set to 0 to disable timeouts.
   */
  readonly idleTimeout?: number;
}

/** Socket handler. */
export type SocketHandler = (
  socket: WebSocket,
  ctx: SocketHandlerContext,
) => Promise<void> | void;

/** Socket handler context. */
export interface SocketHandlerContext {
  /** HTTP `Request` Object */
  readonly request: Request;

  /** HTTP `Response` Object that upgrade to websocket. */
  readonly response: Response;
}

/** Create WebSocket request handler.
 * ```ts
 * import {
 *   createHandler,
 *   SocketHandler,
 * } from "https://deno.land/x/http_websocket@$VERSION/mod.ts";
 * import { serve } from "https://deno.land/std@$VERSION/http/mod.ts";
 * const socketHandler: SocketHandler = (socket) => {
 *   socket.onopen = () => {
 *     socket.send("hello");
 *   };
 * };
 * const handler = createHandler(socketHandler);
 * await serve(handler);
 * ```
 */
export function createHandler(
  socketHandler: SocketHandler,
  { idleTimeout, protocol: _protocol, debug }: HandlerOptions = {},
): Handler {
  return async (req) => {
    const [valid, error] = validateRequest(req);
    if (!valid) {
      const body = debug ? error.message : null;
      const headers = error.headers;
      return new Response(body, {
        status: error.status,
        statusText: STATUS_TEXT[error.status],
        headers,
      });
    }

    const secWebsocketProtocol = req.headers.get("sec-websocket-protocol");
    const protocols = headerList(secWebsocketProtocol);

    const [data, e] = safeSync(() => {
      const protocol = _protocol?.(protocols);

      return Deno.upgradeWebSocket(req, { protocol, idleTimeout });
    });

    if (!data) {
      const body = debug ? resolveErrorMsg(e) : null;
      const res = new Response(body, ErrorResponseInit);
      return res;
    }
    const { socket, response } = data;

    try {
      await socketHandler(socket, {
        request: req.clone(),
        response: response.clone(),
      });
      return response;
    } catch (error) {
      const body = debug ? resolveErrorMsg(error) : null;
      return new Response(body, ErrorResponseInit);
    }
  };
}

function resolveErrorMsg(
  value: unknown,
  fallbackMessage = "Unknown error has occurred",
): string {
  return value instanceof Error ? value.message : fallbackMessage;
}

const ErrorResponseInit: ResponseInit = {
  status: Status.InternalServerError,
  statusText: STATUS_TEXT[Status.InternalServerError],
};

function headerList(header: string | null): string[] {
  const headerList = header?.split(",") ?? [];

  return headerList.map(trim).filter((value) => !!value);
}
