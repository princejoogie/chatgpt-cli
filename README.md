# chatgpt-cli

ChatGpt in your terminal

![pwsh_dVWwkFR8TQ](https://github.com/princejoogie/chatgpt-cli/assets/47204120/8f986d38-33e6-4064-bb10-6cb5ef6af87c)

## Usage

> Generate an API key -> https://platform.openai.com/account/api-keys
```bash
# .bashrc or .zshrc
export OPENAI_API_KEY=your-api-key
# this environment variable is used as authentication in openai's api endpoints
```

```bash
$ npm install -g @princejoogie/chatgpt-cli
$ gpt # this is the bin when installing the package globally
```

## Todo

- [x] Response streaming
- [ ] Conversation history
- [ ] Model change (default gpt-3.5-turbo)

## Develop

```bash
$ pnpm install
$ pnpm dev   # terminal 1
$ pnpm start # terminal 2
```

---

Made with ☕ by Prince Carlo Juguilon
