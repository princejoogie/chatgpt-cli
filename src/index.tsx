#!/usr/bin/env node

import React from "react";
import { render } from "ink";
import meow from "meow";
import App from "./app.js";

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
render(<App cli={cli} />);
