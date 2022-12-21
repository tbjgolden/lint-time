import { lintTime } from ".";

test("lintTime", async () => {
  expect(await lintTime()).toBe(`Hello world!`);
});
