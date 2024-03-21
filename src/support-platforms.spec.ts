import { test } from "bun:test";
import { semver, spawnSync } from "bun";
import { workspaceSample1 } from "./tests/utils/workspaces.js";
import { usePack } from "./tests/utils/pack.js";

const subprocessNodeVersion = spawnSync({ cmd: ["node", "--version"] });
const nodeVersion = new TextDecoder().decode(subprocessNodeVersion.stdout);
const isNodeValid = semver.satisfies(nodeVersion, ">v18");

const t = test.if(isNodeValid);

t("install package", async () => {
  const workspace = await workspaceSample1();
  const packLocation = await usePack();

  await workspace.exec(["npm", "init", "-fy"]);
  await workspace.exec(["npm", "install", `${packLocation}`]);
});
