# websocket-handler

WebSocket handler implementation and other utilities for working with status
codes.

## What

This is the WebSocket **handler** framework. It handles HTTP Request validation
and error handling, which you must do when you create a WebSocket Server.

You can concentrate only on WebSocket behavior.

## Features

- Validation for HTTP request what upgrade to WebSocket.
- Tiny, minimum interface.

## Quick View

```ts
import {
  createHandler,
  SocketHandler,
} from "https://deno.land/x/ws_handler@$VERSION/mod.ts";
import { serve } from "https://deno.land/std@$VERSION/http/mod.ts";
const socketHandler: SocketHandler = (socket) => {
  socket.onopen = () => {
    socket.send("hello");
  };
};
const handler = createHandler(socketHandler);
serve(handler);
```

## API

### createHandler

Create WebSocket request handler.

#### Example

```ts
import {
  createHandler,
  SocketHandler,
} from "https://deno.land/x/ws_handler@$VERSION/mod.ts";
const socketHandler: SocketHandler = (socket) => {
  socket.onopen = () => {
    socket.send("hello");
  };
};
const handler = createHandler(socketHandler);
```

## License

Copyright © 2022-present [TomokiMiyauci](https://github.com/TomokiMiyauci).

Released under the [MIT](./LICENSE) license
