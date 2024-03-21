import { readableStreamWithController } from "./readable-stream-with-controller.js";

export class MultiplyStream<T> implements ReadableWritablePair<T, T> {
  readable: ReadableStream<T>;
  controller: ReadableStreamDefaultController<T>;
  writable: WritableStream<T>;

  constructor(...readableWritablePairs: { writable: WritableStream<T> }[]) {
    const writers = readableWritablePairs.map((readableWritablePair) => ({
      writable: readableWritablePair.writable,
      writer: readableWritablePair.writable.getWriter(),
    }));
    const { readable, controller } = readableStreamWithController<T>();
    this.readable = readable;
    this.controller = controller;
    this.writable = new WritableStream<T>({
      write: async (chunk) => {
        this.controller.enqueue(chunk);
        for (const { writer } of writers) {
          await writer.write(chunk);
        }
      },
      close: async () => {
        this.controller.close();
        for (const { writer } of writers) {
          await writer.close();
        }
      },
    });
  }
}
