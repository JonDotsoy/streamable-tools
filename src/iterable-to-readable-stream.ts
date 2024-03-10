const isAsyncIterable = <T>(
  value: AsyncIterable<T> | Iterable<T>,
): value is AsyncIterableIterator<T> => Symbol.asyncIterator in value;
const isIterable = <T>(
  value: AsyncIterable<T> | Iterable<T>,
): value is IterableIterator<T> => Symbol.iterator in value;

export const iterableToReadableStream = <T>(
  iterableOrAsyncIterable: AsyncIterable<T> | Iterable<T>,
): ReadableStream<T> => {
  const e = [][Symbol.iterator];

  const iterator = isAsyncIterable(iterableOrAsyncIterable)
    ? iterableOrAsyncIterable[Symbol.asyncIterator]()
    : isIterable(iterableOrAsyncIterable)
      ? iterableOrAsyncIterable[Symbol.iterator]()
      : null;

  return new ReadableStream({
    pull: async (controller) => {
      if (!iterator) return controller.close();
      const { done, value } = await iterator.next();
      if (done) return controller.close();
      return controller.enqueue(value);
    },
  });
};
