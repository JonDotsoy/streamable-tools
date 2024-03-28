import { test, expect } from "bun:test";
import { readableStreamWithPipeStream } from "./readable-stream-with-pipe-stream.js";
import { iterableToReadableStream } from "./iterable-to-readable-stream.js";

test("", async () => {
  const p = readableStreamWithPipeStream();
  const b = readableStreamWithPipeStream();

  const readable = iterableToReadableStream([1, 2, 3])
    .pipeThrough(p.pipeStream())
    .pipeThrough(b.pipeStream());

  const reader1 = readable.getReader();
  const reader2 = p.readable.getReader();
  const reader3 = b.readable.getReader();

  expect(await reader1.read()).toEqual({ done: false, value: 1 });
  expect(await reader1.read()).toEqual({ done: false, value: 2 });
  expect(await reader1.read()).toEqual({ done: false, value: 3 });

  expect(await reader2.read()).toEqual({ done: false, value: 1 });
  expect(await reader2.read()).toEqual({ done: false, value: 2 });
  expect(await reader2.read()).toEqual({ done: false, value: 3 });

  expect(await reader3.read()).toEqual({ done: false, value: 1 });
  expect(await reader3.read()).toEqual({ done: false, value: 2 });
  expect(await reader3.read()).toEqual({ done: false, value: 3 });
});

test("", async () => {
  const { readable, pipeStream } = readableStreamWithPipeStream({
    keepOpen: false,
  });

  await iterableToReadableStream([1, 2, 3]).pipeThrough(pipeStream());
  await iterableToReadableStream([4, 5, 6]).pipeThrough(pipeStream());

  const reader = readable.getReader();

  const data = [
    await reader.read(),
    await reader.read(),
    await reader.read(),
    await reader.read(),
    await reader.read(),
    await reader.read(),
  ];

  expect(data).toEqual([
    { done: false, value: 1 },
    { done: false, value: 4 },
    { done: false, value: 2 },
    { done: false, value: 5 },
    { done: false, value: 3 },
    { done: false, value: 6 },
  ]);
});
