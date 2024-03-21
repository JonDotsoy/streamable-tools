import { readableStreamToJSON, spawn } from "bun";

const packageDir = new URL("../../../", import.meta.url);

let packLocation: { current: null | string } = { current: null };

export const usePack = async () => {
  if (packLocation.current) return new URL(packLocation.current);

  const subProcess = spawn({
    cmd: ["npm", "pack", "--json"],
    cwd: packageDir.pathname,
  });
  const exitCode = await subProcess.exited;

  if (exitCode !== 0) throw new Error(`Failed pack. Exit code ${exitCode}`);

  for (const b of await readableStreamToJSON(subProcess.stdout)) {
    if (b.filename) {
      const packFile = new URL(b.filename, packageDir);
      packLocation.current = `${packFile}`;
      return packFile;
    }
  }

  throw new Error(`Missing pack`);
};
