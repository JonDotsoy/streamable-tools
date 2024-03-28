import { readableStreamWithController } from "./readable-stream-with-controller.js";

type Options = {
  keepOpen?: boolean;
};

export const readableStreamWithPipeStream = <T>(options?: Options) => {
  const keepOpen = options?.keepOpen ?? false;
  const { readable, controller } = readableStreamWithController<T>();
  const canCloseOnPipe = keepOpen === false;
  let canClose = true;

  const close = () => {
    if (canClose) {
      controller.close();
      canClose = false;
    }
  };
  const closePipe = () => {
    if (canCloseOnPipe) close();
  };

  const pipeStream = () => {
    const { readable: readablePipe, controller: controllerPipe } =
      readableStreamWithController<T>();

    const writable = new WritableStream<T>({
      write: (chunk) => {
        controllerPipe.enqueue(chunk);
        controller.enqueue(chunk);
      },
      close: () => {
        controllerPipe.close();
        closePipe();
      },
    });

    return {
      writable,
      readable: readablePipe,
    };
  };

  return {
    readable,
    pipeStream,
    close,
    [Symbol.dispose]: close,
  };
};
