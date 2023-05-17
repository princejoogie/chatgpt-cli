#!/usr/bin/env node

import React from "react";
import { render } from "ink";
import meow from "meow";
import App from "./app.js";
import { Alert } from "@inkjs/ui";

const cli = meow(
  `
  Usage
    $ gpt

  Options
    --version View version
    --help    View help

  Examples
    $ gpt
`,
  {
    importMeta: import.meta,
    flags: {},
  }
);

console.clear();
const hasApiKey = !!process.env["OPENAI_API_KEY"];
if (!hasApiKey) {
  render(
    <Alert variant="warning">
      No `OPENAI_API_KEY` found in environment variables.
    </Alert>
  );
} else {
  render(<App cli={cli} />);
}
