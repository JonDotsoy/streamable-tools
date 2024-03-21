import { test, expect } from "bun:test";
import { readableStreamWithController } from "./readable-stream-with-controller.js";
import { readableStreamToText } from "bun";

test("", async () => {
  const { readable, controller } = readableStreamWithController<Uint8Array>();

  controller.enqueue(new TextEncoder().encode("f"));
  controller.enqueue(new TextEncoder().encode("o"));
  controller.enqueue(new TextEncoder().encode("o"));
  controller.close();

  const output = await readableStreamToText(readable);

  expect(output).toEqual("foo");
});
