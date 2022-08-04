import { safeSync, Status } from "./deps.ts";
import { validateRequest } from "./validate.ts";

/** WebSocket handler options. */
export type Options = Pick<Deno.UpgradeWebSocketOptions, "idleTimeout">;

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
 * } from "https://deno.land/x/ws_handler@$VERSION/mod.ts";
 * const socketHandler: SocketHandler = (socket) => {
 *   socket.onopen = () => {
 *     socket.send("hello");
 *   };
 * };
 * const handler = createHandler(socketHandler);
 * ```
 */
export function createHandler(
  socketHandler: SocketHandler,
  { idleTimeout }: Readonly<Partial<Options>>,
): (req: Request) => Promise<Response> {
  const responseOnError = new Response(null, {
    status: Status.InternalServerError,
  });

  return async (req) => {
    const [result, error] = validateRequest(req);
    if (!result) {
      const headers = error.status === Status.MethodNotAllowed
        ? new Headers({ "Allow": "GET" })
        : undefined;
      return new Response(error.message, {
        status: error.status,
        headers,
      });
    }

    const protocol = req.headers.get("sec-websocket-protocol") ?? undefined;
    const [data] = safeSync(() =>
      Deno.upgradeWebSocket(req, { protocol, idleTimeout })
    );

    if (!data) return responseOnError;
    const { socket, response } = data;

    try {
      await socketHandler(socket, {
        request: req,
        response,
      });
      return response;
    } catch {
      return responseOnError;
    }
  };
}
