# streamable-tools

`streamable-tools` is a JavaScript/TypeScript library providing a set of utilities designed to simplify working with Streams in web applications. It introduces convenient wrappers and functions to perform common operations on readable and writable streams, such as transforming, splitting, and managing stream data more efficiently. Below are some of the highlights of this library:

## MultiplyStream

Allows you to propagate the data from a single `ReadableStream` to multiple `WritableStream` instances. This is useful when you need to send the same stream data to different destinations or processes.

```ts
import { MultiplyStream } from "streamable-tools/multiply-stream";

new ReadableStream().pipeThrough(
  new MultiplyStream(
    { writable: new WritableStream() },
    { writable: new WritableStream() },
    { writable: new WritableStream() },
  ),
);
```

## SplitStream

Facilitates the splitting of stream data based on a delimiter, such as a newline character. It can be particularly handy when working with text streams that need to be read line by line or split into chunks.

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

Provides a simpler interface to create a `ReadableStream` along with its `ReadableStreamDefaultController`, allowing for direct manipulation of the stream's data flow. This helps in scenarios where dynamic stream content generation or modification is required.

```ts
import { readableStreamWithController } from "streamable-tools/readable-stream-with-controller";

const { readable, controller } = readableStreamWithController<Uint8Array>();

controller.enqueue(new TextEncoder().encode("f"));
controller.enqueue(new TextEncoder().encode("o"));
controller.enqueue(new TextEncoder().encode("o"));
controller.close();

const output = await readableStreamToText(readable);

expect(output).toEqual("foo");
```

## iterableToReadableStream

Converts a JavaScript iterable object into a `ReadableStream`, allowing for the efficient streaming of iterable data as chunks through the Streams API. This is particularly useful for streaming large datasets or dynamic content that is generated on-the-fly, without having to allocate and hold the entire data in memory at once.

```ts
const iterable = function* () {
  yield "Hello ";
  yield "world!";
};

const text = await readableStreamToText(iterableToReadableStream(iterable()));

expect(text).toEqual("Hello world!");
```
