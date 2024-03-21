import { test, expect } from "bun:test";
import { iterableToReadableStream } from "./iterable-to-readable-stream.js";
import { readableStreamToArray, readableStreamToText } from "bun";

test("", async () => {
  const iterable = [1, 2, 3];

  const items = await readableStreamToArray(iterableToReadableStream(iterable));

  expect(items).toEqual([1, 2, 3]);
});

test("", async () => {
  const iterable = async function* () {
    yield 1;
    yield 2;
    yield 3;
  };

  const items = await readableStreamToArray(
    iterableToReadableStream(iterable()),
  );

  expect(items).toEqual([1, 2, 3]);
});

test("", async () => {
  const iterable = function* () {
    yield 1;
    yield 2;
    yield 3;
  };

  const items = await readableStreamToArray(
    iterableToReadableStream(iterable()),
  );

  expect(items).toEqual([1, 2, 3]);
});

test("", async () => {
  const iterable = function* () {
    yield "Hello ";
    yield "world!";
  };

  const text = await readableStreamToText(iterableToReadableStream(iterable()));

  expect(text).toEqual("Hello world!");
});
