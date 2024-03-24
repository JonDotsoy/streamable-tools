import { SplitStream } from "./split-stream.js";
import { toArrayBuffer } from "./utils/to-uint8array.js";

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

/**
 * @example
 * readable // => ReadableStream<string> [ 'foo', 'biz' ]
 * await readableStreamToIterable(readable) // => AsyncGenerator<string> [ 'foo', 'biz' ]
 */
export const readableStreamToIterable = <T>(
  readable: ReadableStream<T>,
): AsyncGenerator<T> => {
  const iter = async function* () {
    for await (const chunk of readable) {
      yield chunk;
    }
  };

  return iter();
};

/**
 * @example
 * readable // => ReadableStream<string> [ 'foo', 'biz' ]
 * await readableStreamToArray(readable) // => [ 'foo','biz' ];
 */
export const readableStreamToArray = <T>(
  readable: ReadableStream<T>,
): Promise<T[]> => {
  return Array.fromAsync(readableStreamToIterable(readable));
};

type ArrayBufferLike = ArrayBuffer | Uint8Array | string | number[];

/**
 * @example
 * readable // => ReadableStream<string> [ 'foo', 'biz' ]
 * await readableStreamToArrayBuffer(readable) // => Uint8Array(6) [ 102, 111, 111, 98, 105, 122 ]
 */
export const readableStreamToArrayBuffer = async <T extends ArrayBufferLike>(
  readable: ReadableStream<T>,
): Promise<Uint8Array> => {
  const chunks = await Array.fromAsync(await readableStreamToArray(readable));
  return chunks.reduce(
    (accum, chunk) => new Uint8Array([...accum, ...toArrayBuffer(chunk)]),
    new Uint8Array(),
  );
};

/**
 * @example
 * readable // => ReadableStream<string> [ 'foo', 'biz' ]
 * await readableStreamToText(readable) // => string "foobiz"
 */
export const readableStreamToText = async <T extends ArrayBufferLike>(
  readable: ReadableStream<T>,
) => {
  const buff = await readableStreamToArrayBuffer(readable);
  return new TextDecoder().decode(buff);
};

/**
 * @example
 * readable // => ReadableStream<string> [ '{', '"biz": true }' ]
 * await readableStreamToJson(readable) // => Object { "biz": true }
 */
export const readableStreamToJson = async <T extends ArrayBufferLike>(
  readable: ReadableStream<T>,
) => {
  const text = await readableStreamToText(readable);
  return JSON.parse(text);
};

/**
 * @example
 * readable // => ReadableStream<string> [ 'foo\n', 'biz' ]
 * await readableStreamToTextList(readable) // => AsyncGenerator<string> [ 'foo', 'biz' ]
 */
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

/**
 * @example
 * readable // => ReadableStream<string> [ '{', '"biz": true }\n', '{ "ok": true }' ]
 * await readableStreamToJsonList(readable) // => AsyncGenerator<any> [ { "biz": true }, { "ok": true } ]
 */
export const readableStreamToJsonList = async function* <
  T extends ArrayBufferLike,
>(readable: ReadableStream<T>) {
  for await (const text of readableStreamToTextList(readable)) {
    yield JSON.parse(text);
  }
};
