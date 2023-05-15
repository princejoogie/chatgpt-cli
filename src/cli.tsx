#!/usr/bin/env node

import React from "react";
import { render } from "ink";
import meow from "meow";
import App from "./app.js";

const cli = meow(
  `
	Usage
	  $ chatgpt-cli

	Options
		--name  Your name

	Examples
	  $ chatgpt-cli --name=Jane
	  Hello, Jane
`,
  {
    importMeta: import.meta,
    flags: {},
  }
);

render(<App cli={cli} />);
