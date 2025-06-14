import { expandGlob } from "@std/fs";
import { globToRegExp } from "@std/path";

const glob = Deno.args[0];
const task = Deno.args[1];

if (!glob || !task) {
  throw new Error("Glob and Script arguments are required");
}

const workspaceFiles = await Array.fromAsync(expandGlob("./**/deno.json"));

type Workspace = {
  name: string;
  path: string;
  tasks: string[];
};
const workspaces: Workspace[] = [];

for (const workspaceFile of workspaceFiles) {
  const file = await Deno.readTextFile(workspaceFile.path);
  const denofile = JSON.parse(file);

  workspaces.push({
    name: denofile.name,
    path: workspaceFile.path,
    tasks: denofile.tasks ? Object.keys(denofile.tasks) : [],
  });
}

const globRegExp = globToRegExp(glob);
const matchingWorkspaces = workspaces.filter((workspace) =>
  globRegExp.test(workspace.name)
);

const workspaceWithValidTask = matchingWorkspaces.filter((workspace) =>
  workspace.tasks.find((taskname) => taskname === task)
);

const tasks = workspaceWithValidTask.map(async (workspace) => {
  const command = new Deno.Command("deno", {
    args: [
      "task",
      "--config",
      workspace.path,
      task,
    ],
    stdin: "inherit",
    stdout: "piped",
    stderr: "piped",
  });

  const process = command.spawn();

  await Promise.all([
    pipeWithPrefix(process.stdout, console.log, workspace.name),
    pipeWithPrefix(process.stderr, console.error, workspace.name),
  ]);

  const status = await process.status;

  if (!status.success) {
    console.error(
      `[${workspace.name}] Task failed with exit code ${status.code}`,
    );
    Deno.exit(status.code);
  }
});

await Promise.all(tasks);

async function pipeWithPrefix(
  stream: ReadableStream<Uint8Array>,
  target: (line: string) => void,
  prefix: string,
) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    const output = decoder.decode(value);

    const outputs = output.split("\n");
    for (const line of outputs) {
      if (line.trim()) {
        target(`[ ${prefix} ]: ${line}`);
      }
    }
  }
}
