const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");

// Stub the database boundary: these checks never contact or mutate Supabase.
function scoreService() {
  const calls = [];
  const chain = {
    update(value) {
      calls.push(["update", value]);
      return this;
    },
    delete() {
      calls.push(["delete"]);
      return this;
    },
    eq(column, value) {
      calls.push(["eq", column, value]);
      return this;
    },
    then(resolve) {
      resolve({ error: null });
    },
  };
  const supabase = {
    from(table) {
      calls.push(["from", table]);
      return chain;
    },
  };
  const source = ts.transpileModule(
    fs.readFileSync("services/scoresService.ts", "utf8"),
    { compilerOptions: { module: ts.ModuleKind.CommonJS } },
  ).outputText;
  const context = { exports: {}, require: () => ({ default: supabase }) };
  vm.runInNewContext(source, context);
  return { service: context.exports, calls };
}

test("score changes target the student inside the intended group", async () => {
  const { service, calls } = scoreService();
  await service.updateScore("same name", "blue", 12);
  assert.deepEqual(
    calls.filter((x) => x[0] === "eq"),
    [
      ["eq", "name", "same name"],
      ["eq", "group", "blue"],
    ],
  );
});
test("deletion is also limited to the intended group", async () => {
  const { service, calls } = scoreService();
  await service.deleteScore("same name", "blue");
  assert.deepEqual(
    calls.filter((x) => x[0] === "eq"),
    [
      ["eq", "name", "same name"],
      ["eq", "group", "blue"],
    ],
  );
});
test("invalid scores never reach the database", async () => {
  const { service, calls } = scoreService();
  for (const value of [-1, 1.5, NaN, Infinity, 2147483648])
    assert.ok((await service.updateScore("student", "blue", value)).error);
  assert.equal(calls.length, 0);
});
test("zero and the maximum integer are valid scores", async () => {
  const { service } = scoreService();
  assert.equal((await service.updateScore("student", "blue", 0)).error, null);
  assert.equal(
    (await service.updateScore("student", "blue", 2147483647)).error,
    null,
  );
});
