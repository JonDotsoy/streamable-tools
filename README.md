# streamable-tools

## Multiply output

```ts
import { MultiplyStream } from "streamable-tools/multiply-stream";

new ReadableStream().pipeThrough(
  new MultiplyStream(
    new WritableStream(),
    new WritableStream(),
    new WritableStream(),
  ),
);
```
