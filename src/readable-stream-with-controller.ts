export const readableStreamWithController = <T>(): {
  readable: ReadableStream<T>;
  controller: ReadableStreamDefaultController<T>;
} => {
  let controller: null | ReadableStreamDefaultController<T> = null;

  const readable = new ReadableStream<T>({
    start: (ctl) => (controller = ctl),
  });

  if (!controller) throw new Error(`Missing controller`);

  return { readable, controller };
};
