import _ from "lodash";
import repl from "repl";

async function run() {
  const server = repl.start();
  server.setupHistory("console.history", () => {});

  server.context._ = _;
}

run();
