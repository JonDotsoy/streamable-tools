# streamable-tools

## MultiplyStream

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

## SplitStream

```ts
import { SplitStream } from "streamable-tools/split-stream.ts";

const readable = new ReadableStream({
  start: (controller) => {
    controller.enqueue(new TextEncoder().encode("foo\nbiz"));
    controller.enqueue(new TextEncoder().encode("\n"));
    controller.close();
  },
}).pipeThrough(new SplitStream());

const arr = await readableStreamToArray(readable);

expect(arr).toEqual([
  new TextEncoder().encode("foo"),
  new TextEncoder().encode("biz"),
]);
```
