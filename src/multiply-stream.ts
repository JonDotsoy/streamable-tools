import { readableStreamWithController } from "./readable-stream-with-controller";

export class MultiplyStream<T> implements ReadableWritablePair<T, T> {
  readable: ReadableStream<T>;
  controller: ReadableStreamDefaultController<T>;
  writable: WritableStream<T>;

  constructor(...writables: WritableStream<T>[]) {
    const writers = writables.map((writable) => ({
      writable,
      writer: writable.getWriter(),
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
