import { test, expect } from "bun:test";
import { SplitStream } from "./split-stream.js";
import { readableStreamToArray } from "bun";
import { MultiplyStream } from "./multiply-stream.js";

test("", async () => {
  const readable = new ReadableStream({
    start: (ctl) => {
      ctl.enqueue(new TextEncoder().encode("foo\nbiz"));
      ctl.enqueue(new TextEncoder().encode("\n"));
      ctl.close();
    },
  }).pipeThrough(new SplitStream());

  const arr = await readableStreamToArray(readable);

  expect(arr).toEqual([
    new TextEncoder().encode("foo"),
    new TextEncoder().encode("biz"),
  ]);
});

test("", async () => {
  const lines1 = new SplitStream();
  const lines2 = new SplitStream();

  const readable = new ReadableStream({
    start: (ctl) => {
      ctl.enqueue(new TextEncoder().encode("foo\nbiz"));
      ctl.enqueue(new TextEncoder().encode("\n"));
      ctl.close();
    },
  }).pipeThrough(new MultiplyStream(lines1, lines2));

  const arr = await readableStreamToArray(readable);

  expect(arr).toEqual([
    new TextEncoder().encode("foo\nbiz"),
    new TextEncoder().encode("\n"),
  ]);

  const arrLines1 = await readableStreamToArray(lines1.readable);

  expect(arrLines1).toEqual([
    new TextEncoder().encode("foo"),
    new TextEncoder().encode("biz"),
  ]);

  const arrLines2 = await readableStreamToArray(lines2.readable);

  expect(arrLines2).toEqual([
    new TextEncoder().encode("foo"),
    new TextEncoder().encode("biz"),
  ]);
});
