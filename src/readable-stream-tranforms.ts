import { SplitStream } from ".";
import { toArrayBuffer } from "./utils/to-uint8array";

export const readableStreamTransformChunk = <T, O>(
  readable: ReadableStream<T>,
  transform: (value: T) => O,
): ReadableStream<O> => {
  return readable.pipeThrough(
    new (class {
      controller!: ReadableStreamDefaultController<O>;
      writable = new WritableStream<T>({
        write: (c) => {
          this.controller.enqueue(transform(c));
        },
        close: () => {
          this.controller.close();
        },
      });
      readable = new ReadableStream<O>({
        start: (ctl) => {
          this.controller = ctl;
        },
      });
    })(),
  );
};

export const readableStreamToIterable = <T>(readable: ReadableStream<T>) => {
  const iter = async function* () {
    for await (const chunk of readable) {
      yield chunk;
    }
  };

  return iter();
};

export const readableStreamToArray = <T>(readable: ReadableStream<T>) => {
  return Array.fromAsync(readableStreamToIterable(readable));
};

type ArrayBufferLike = ArrayBuffer | Uint8Array | string | number[];

export const readableStreamToArrayBuffer = async <T extends ArrayBufferLike>(
  readable: ReadableStream<T>,
) => {
  const chunks = await Array.fromAsync(await readableStreamToArray(readable));
  return chunks.reduce(
    (accum, chunk) => new Uint8Array([...accum, ...toArrayBuffer(chunk)]),
    new Uint8Array(),
  );
};

export const readableStreamToText = async <T extends ArrayBufferLike>(
  readable: ReadableStream<T>,
) => {
  const buff = await readableStreamToArrayBuffer(readable);
  return new TextDecoder().decode(buff);
};

export const readableStreamToJson = async <T extends ArrayBufferLike>(
  readable: ReadableStream<T>,
) => {
  const text = await readableStreamToText(readable);
  return JSON.parse(text);
};

export const readableStreamToTextList = async function* <
  T extends ArrayBufferLike,
>(readable: ReadableStream<T>) {
  for await (const line of readableStreamToIterable(
    readableStreamTransformChunk(readable, toArrayBuffer).pipeThrough(
      new SplitStream(),
    ),
  )) {
    yield new TextDecoder().decode(line);
  }
};

export const readableStreamToJsonList = async function* <
  T extends ArrayBufferLike,
>(readable: ReadableStream<T>) {
  for await (const text of readableStreamToTextList(readable)) {
    yield JSON.parse(text);
  }
};
