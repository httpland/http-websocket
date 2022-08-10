import { safeSync, Status, STATUS_TEXT } from "./deps.ts";
import { validateRequest } from "./validate.ts";

/** WebSocket handler options. */
export type Options = Pick<Deno.UpgradeWebSocketOptions, "idleTimeout"> & {
  /** Select sub-protocol.  */
  protocol: (protocols: string[]) => string | undefined;

  /** Whether to do as a debug mode.
   * When this is `true`, if an error occurs in the server, the
   * Include detailed error messages in the response.
   * @remarks For production use, this feature is not recommended.
   */
  debug: boolean;
};

/** Socket handler. */
export type SocketHandler = (
  socket: WebSocket,
  ctx: Readonly<SocketHandlerContext>,
) => void | Promise<void>;

/** Socket handler context. */
export type SocketHandlerContext = { request: Request; response: Response };

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
  { idleTimeout, protocol, debug }: Readonly<Partial<Options>> = {},
): (req: Request) => Promise<Response> {
  return async (req) => {
    const [result, error] = validateRequest(req);
    if (!result) {
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
      const _protocol = protocol?.(protocols);

      return Deno.upgradeWebSocket(req, { protocol: _protocol, idleTimeout });
    });

    if (!data) {
      const body = debug ? resolveErrorMsg(e) : null;
      const res = new Response(body, ERROR_RESPONSE_INIT);
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
      return new Response(body, ERROR_RESPONSE_INIT);
    }
  };
}

function trim(value: string): string {
  return value.trim();
}

function resolveErrorMsg(
  value: unknown,
  fallbackMessage = "Unknown error has occurred",
): string {
  return value instanceof Error ? value.message : fallbackMessage;
}

const ERROR_RESPONSE_INIT: ResponseInit = {
  status: Status.InternalServerError,
  statusText: STATUS_TEXT[Status.InternalServerError],
};

function headerList(header: string | null): string[] {
  const headerList = header?.split(",") ?? [];

  return headerList.map(trim);
}
