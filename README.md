# http-websocket

[![deno land](http://img.shields.io/badge/available%20on-deno.land/x-lightgrey.svg?logo=deno)](https://deno.land/x/http_websocket)
[![deno doc](https://doc.deno.land/badge.svg)](https://doc.deno.land/https/deno.land/x/http_websocket/mod.ts)
[![GitHub](https://img.shields.io/github/license/httpland/http-websocket)](https://github.com/httpland/http-websocket/blob/main/LICENSE)

HTTP request for websocket with standard `Request` and `Response`.

## HTTP handler for websocket

Create WebSocket request handler.

```ts
import {
  createHandler,
  SocketHandler,
} from "https://deno.land/x/http_websocket@$VERSION/mod.ts";
import { serve } from "https://deno.land/std@$VERSION/http/mod.ts";
const socketHandler: SocketHandler = (socket) => {
  socket.onopen = () => {
    socket.send("hello");
  };
};
const handler = createHandler(socketHandler);
await serve(handler);
```

### Spec

The `Response` includes status code and headers as follow:

| Code  | Headers |
| ----- | ------- |
| `101` |         |
| `400` |         |
| `405` | `allow` |
| `500` |         |

## WebSocket Status Code and Status Text

Helper for processing status code and status text.

```ts
import {
  Status,
  STATUS_TEXT,
} from "https://deno.land/x/http_websocket@$VERSION/mod.ts";
import { assertEquals } from "https://deno.land/std@$VERSION/testing/asserts.ts";

assertEquals(Status.NormalClosure, 1000);
assertEquals(STATUS_TEXT[Status.NormalClosure], "Normal Closure");
```

## Validate request

HTTP request validation for websocket. The validation is based on RFC 6455, 4.1.

The result of the validation is returned as a tuple. If there is an error, the
second element is [`HttpError`](https://deno.land/std/http/mod.ts?s=HttpError).

```ts
import {
  validateRequest,
} from "https://deno.land/x/http_websocket@$VERSION/mod.ts";
import {
  assertEquals,
  assertIsError,
} from "https://deno.land/std@$VERSION/testing/asserts.ts";

const req = new Request("http://localhost/");
const result = validateRequest(req);
assertEquals(result[0], false);
assertIsError(result[1]);
```

## License

Copyright © 2022-present [httpland](https://github.com/httpland).

Released under the [MIT](./LICENSE) license
