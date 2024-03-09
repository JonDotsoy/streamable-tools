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
import { SplitStream } from "streamable-tools/split-stream";

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

## readableStreamWithController

```ts
import { readableStreamWithController } from "streamable-tools//readable-stream-with-controller";

const { readable, controller } = readableStreamWithController<Uint8Array>();

controller.enqueue(new TextEncoder().encode("f"));
controller.enqueue(new TextEncoder().encode("o"));
controller.enqueue(new TextEncoder().encode("o"));
controller.close();

const output = await readableStreamToText(readable);

expect(output).toEqual("foo");
```
