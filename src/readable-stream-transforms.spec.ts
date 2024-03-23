import { test, expect } from "bun:test";
import {
  readableStreamToArray,
  readableStreamToArrayBuffer,
  readableStreamToText,
  readableStreamToJson,
  readableStreamToJsonList,
} from "./readable-stream-transforms";
import {} from "bun";
import { readableStreamWithController } from "./readable-stream-with-controller";

namespace Samples {
  export const readableSample1 = () => {
    const { readable, controller } = readableStreamWithController<string>();

    controller.enqueue("tick 1");
    controller.enqueue("tick 2");
    controller.enqueue("tick 3");
    controller.close();

    return readable;
  };

  export const readableSample2 = () => {
    const { readable, controller } = readableStreamWithController<Uint8Array>();

    controller.enqueue(new TextEncoder().encode("tick 1"));
    controller.enqueue(new TextEncoder().encode("tick 2"));
    controller.enqueue(new TextEncoder().encode("tick 3"));
    controller.close();

    return readable;
  };

  export const readableSample3 = () => {
    const { readable, controller } = readableStreamWithController<number[]>();

    controller.enqueue([...new TextEncoder().encode("tick 1")]);
    controller.enqueue([...new TextEncoder().encode("tick 2")]);
    controller.enqueue([...new TextEncoder().encode("tick 3")]);
    controller.close();

    return readable;
  };

  export const readableSample4 = () => {
    const { readable, controller } = readableStreamWithController<string>();

    controller.enqueue(`{"ok":true,`);
    controller.enqueue(`"b":[]`);
    controller.enqueue(`}`);
    controller.close();

    return readable;
  };

  export const readableSample5 = () => {
    const { readable, controller } = readableStreamWithController<string>();

    controller.enqueue(`{"ok":true,`);
    controller.enqueue(`"b":[]`);
    controller.enqueue(`}\n`);
    controller.enqueue(`{"ok":false`);
    controller.enqueue(`}`);
    controller.close();

    return readable;
  };

  export const readableSample6 = (timeout: number) => {
    const { readable, controller } = readableStreamWithController<string>();

    controller.enqueue(`{"ok":true,`);
    controller.enqueue(`"b":[]`);
    controller.enqueue(`}\n`);

    setTimeout(() => {
      controller.enqueue(`{"ok":false`);
      controller.enqueue(`}`);
      controller.enqueue(`\n`);
    }, timeout);
    setTimeout(() => {
      controller.enqueue(`{"ok":true,"c":1`);
      controller.enqueue(`}`);
      controller.close();
    }, timeout * 2);

    return readable;
  };
}

test("readable stream to array", async () => {
  const readable = Samples.readableSample1();

  const items = await readableStreamToArray(readable);

  expect(items).toEqual(["tick 1", "tick 2", "tick 3"]);
});

test("readable stream to Uint8Array", async () => {
  const readable = Samples.readableSample1();

  const buff = await readableStreamToArrayBuffer(readable);

  expect(buff).toBeInstanceOf(Uint8Array);
  expect([...buff]).toEqual([
    ...new TextEncoder().encode("tick 1"),
    ...new TextEncoder().encode("tick 2"),
    ...new TextEncoder().encode("tick 3"),
  ]);
});

test("readable stream to Uint8Array", async () => {
  const readable = Samples.readableSample2();

  const buff = await readableStreamToArrayBuffer(readable);

  expect(buff).toBeInstanceOf(Uint8Array);
  expect([...buff]).toEqual([
    ...new TextEncoder().encode("tick 1"),
    ...new TextEncoder().encode("tick 2"),
    ...new TextEncoder().encode("tick 3"),
  ]);
});

test("readable stream to Uint8Array", async () => {
  const readable = Samples.readableSample3();

  const buff = await readableStreamToArrayBuffer(readable);

  expect(buff).toBeInstanceOf(Uint8Array);
  expect([...buff]).toEqual([
    ...new TextEncoder().encode("tick 1"),
    ...new TextEncoder().encode("tick 2"),
    ...new TextEncoder().encode("tick 3"),
  ]);
});

test("readable stream to json", async () => {
  const readable = Samples.readableSample4();

  const text = await readableStreamToJson(readable);

  expect(text).toEqual({
    ok: true,
    b: [],
  });
});

test("readable stream to jsonl", async () => {
  const readable = Samples.readableSample5();

  const items = await Array.fromAsync(readableStreamToJsonList(readable));

  expect(items).toEqual([{ ok: true, b: [] }, { ok: false }]);
});

test("readable stream to jsonl", async () => {
  const readable = Samples.readableSample6(500);
  const times: { time: number; value: unknown }[] = [];
  const startOf = Date.now();

  for await (const item of readableStreamToJsonList(readable)) {
    times.push({ time: Date.now() - startOf, value: item });
  }

  expect(times.at(0)?.time).toBeGreaterThanOrEqual(0);
  expect(times.at(1)?.time).toBeGreaterThanOrEqual(500);
  expect(times.at(2)?.time).toBeGreaterThanOrEqual(100);

  expect(times.at(0)?.value).toEqual({ ok: true, b: [] });
  expect(times.at(1)?.value).toEqual({ ok: false });
  expect(times.at(2)?.value).toEqual({ ok: true, c: 1 });
});
