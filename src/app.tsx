import React, { useState } from "react";
import { Spinner, TextInput } from "@inkjs/ui";
import { Text, Box } from "ink";
import { openai } from "./config.js";
import { Result } from "meow";

type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

let inputIdx = 0;

const getResponse = async (content: string, messages: Message[]) => {
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [...messages, { role: "user", content }],
    temperature: 0,
  });

  if (response.data.choices.length <= 0) {
    console.error("Error: No choices returned");
    process.exit(1);
  }

  if (!response.data.choices[0]?.message?.content) {
    console.error("Error: No output returned");
    process.exit(1);
  }

  return response.data.choices[0].message.content;
};

const MessageItem = ({ msg }: { msg: Message }) => {
  return (
    <Box
      borderColor={msg.role === "user" ? "green" : "blue"}
      borderStyle="single"
      borderTop={false}
      borderBottom={false}
      borderLeft={true}
      borderRight={false}
    >
      <Text color={msg.role === "user" ? "green" : "blue"}>
        {msg.role === "user" ? "User: " : "Gpt:  "}
      </Text>
      <Text>{msg.content}</Text>
    </Box>
  );
};

export default function App({ cli }: { cli: Result<{}> }) {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Array<Message>>([
    {
      role: "system",
      content: "Hey there! What can I help you with today?",
    },
  ]);

  const onSubmit = async (content: string) => {
    setIsLoading(true);
    setMessages((old) => [...old, { role: "user", content }]);
    const res = await getResponse(content, messages);
    setIsLoading(false);
    setMessages((old) => [...old, { role: "assistant", content: res }]);
  };

  return (
    <Box flexDirection="column" padding={2}>
      <Box flexDirection="column" marginBottom={1}>
        {messages.map((msg, idx) => (
          <MessageItem key={`message-${idx}`} msg={msg} />
        ))}

        {isLoading && (
          <Box
            borderColor="blue"
            borderStyle="single"
            borderTop={false}
            borderBottom={false}
            borderLeft={true}
            borderRight={false}
          >
            <Text color="blue">{"Gpt:  "}</Text>
            <Spinner label="Loading..." />
          </Box>
        )}
      </Box>

      <Box borderStyle="single" borderColor="grey">
        <TextInput
          key={`input-state-${inputIdx}`}
          suggestions={messages
            .filter((msg) => msg.role === "user")
            .map((msg) => msg.content)}
          placeholder="Send a message."
          onSubmit={async (content) => {
            inputIdx++;
            onSubmit(content);
          }}
        />
      </Box>

      <Box paddingX={1}>
        <Text color="grey">
          chatgpt-cli v{cli.pkg.version} • by Prince Carlo Juguilon •{" "}
          © {new Date().getFullYear()}
        </Text>
      </Box>
    </Box>
  );
}
