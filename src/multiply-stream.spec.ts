import { readableStreamToArray, readableStreamToText } from "bun";
import { test, spyOn, expect } from "bun:test";
import { MultiplyStream } from "./multiply-stream.js";

test("", async () => {
  const obj1 = { call: (...args: any[]): any => {} };
  const mock = spyOn(obj1, "call");

  const readable = new ReadableStream<number>({
    start: (ctl) => {
      ctl.enqueue(1);
      ctl.enqueue(2);
      ctl.enqueue(3);
      ctl.close();
    },
  }).pipeThrough(
    new MultiplyStream(
      {
        writable: new WritableStream({
          write: (chunk) => obj1.call(chunk),
        }),
      },
      {
        writable: new WritableStream({
          write: (chunk) => obj1.call(chunk),
        }),
      },
    ),
  );

  const out = await readableStreamToArray(readable);
  expect(out).toEqual([1, 2, 3]);

  expect(mock.mock.calls).toEqual([[1], [1], [2], [2], [3], [3]]);
});
