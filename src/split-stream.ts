import { readableStreamWithController } from "./readable-stream-with-controller.js";

export class SplitStream {
  readable: ReadableStream<Uint8Array>;
  writable: WritableStream<Uint8Array>;
  private restMemory = new Uint8Array();

  constructor() {
    const { readable, controller } = readableStreamWithController<Uint8Array>();
    this.readable = readable;
    this.writable = new WritableStream<Uint8Array>({
      write: (chunk) => {
        this.restMemory = Uint8Array.of(...this.restMemory, ...chunk);

        while (true) {
          const newline = this.restMemory.indexOf(10);
          if (newline >= 0) {
            const chunk = this.restMemory.subarray(0, newline);
            controller.enqueue(chunk);
            this.restMemory = this.restMemory.subarray(newline + 1);
            continue;
          }
          break;
        }
      },
      close: () => {
        if (this.restMemory.length) controller.enqueue(this.restMemory);
        controller.close();
      },
    });
  }
}
