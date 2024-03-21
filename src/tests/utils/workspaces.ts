import fs from "fs/promises";
import { spawn } from "bun";

const workspaceLocation = new URL("__workspaces__/", import.meta.url);
const prepareWorkspaces = async () => {
  await fs.mkdir(new URL("./", workspaceLocation), { recursive: true });
  await fs.writeFile(new URL(".gitignore", workspaceLocation), "*");
};

const prepareWorkspacesPromise = prepareWorkspaces();

export const workspaceSample1 = async () => {
  await prepareWorkspacesPromise;

  const location = new URL("sample1/", workspaceLocation);

  await fs.rm(new URL("./", location), { recursive: true });
  await fs.mkdir(new URL("./", location), { recursive: true });

  const exec = async (cmd: string[]) => {
    const subprocess = spawn({
      cmd,
      cwd: location.pathname,
      stdio: ["inherit", "inherit", "inherit"],
    });
    const exitCode = await subprocess.exited;
    if (exitCode !== 0) throw new Error(`Failed exec: exitCode ${exitCode}`);
  };

  return {
    location,
    exec,
  };
};
