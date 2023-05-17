import fetch from "node-fetch";
import React, { useState, useEffect } from "react";
import { Spinner, TextInput } from "@inkjs/ui";
import { Text, Box, useStdin } from "ink";
import { type Result } from "meow";
import {
  createParser,
  type ParsedEvent,
  type ReconnectInterval,
} from "eventsource-parser";

type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

let inputIdx = 0;

const MessageItem = ({ msg }: { msg: Message }) => {
  const isUser = msg.role === "user";
  return (
    <Box
      alignSelf={isUser ? "flex-end" : "flex-start"}
      borderColor={msg.role === "user" ? "green" : "blue"}
      borderStyle="single"
      marginLeft={isUser ? 5 : 0}
      marginRight={isUser ? 0 : 5}
    >
      <Text>{msg.content}</Text>
    </Box>
  );
};

const getStreamedResponse = async (
  content: string,
  messages: Message[],
  setChunkedResponse: React.Dispatch<React.SetStateAction<string>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  if (!process.env["OPENAI_API_KEY"]) {
    console.log("OPENAI_API_KEY key missing");
    process.exit(1);
  }

  const body = JSON.stringify({
    model: "gpt-3.5-turbo",
    messages: [...messages, { role: "user", content }],
    temperature: 0.0,
    stream: true,
  });

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + process.env["OPENAI_API_KEY"],
    },
    method: "POST",
    body,
  });

  const stream = new ReadableStream({
    async start(controller) {
      function onParse(event: ParsedEvent | ReconnectInterval) {
        if (event.type === "event") {
          const data = event.data;
          if (data === "[DONE]") {
            setIsLoading(false);
            controller.close();
            return;
          }
          try {
            const json = JSON.parse(data);
            const text = json.choices[0].delta.content;

            if (!text) return;

            setChunkedResponse((e) => `${e}${text}`);
            const queue = encoder.encode(text);
            controller.enqueue(queue);
          } catch (e) {
            controller.error(e);
          }
        }
      }

      const parser = createParser(onParse);

      for await (const chunk of res.body as any) {
        parser.feed(decoder.decode(chunk));
      }
    },
  });

  return stream;
};

export default function App({ cli }: { cli: Result<any> }) {
  const { stdin, isRawModeSupported } = useStdin();

  const [isLoading, setIsLoading] = useState(false);
  const [chunkedResponse, setChunkedResponse] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content: "Hey there! What can I help you with today?",
    },
  ]);

  const onSubmit = async (content: string) => {
    inputIdx++;
    setIsLoading(true);
    setMessages((old) => [...old, { role: "user", content }]);
    await getStreamedResponse(
      content,
      messages,
      setChunkedResponse,
      setIsLoading
    );
  };

  useEffect(() => {
    const readStdin = async () => {
      if (!stdin.isTTY) {
        const result = [];
        let length = 0;

        for await (const chunk of stdin) {
          result.push(chunk);
          length += chunk.length;
        }

        const buffer = Buffer.concat(result, length);
        const content = buffer.toString();
        await onSubmit(content);
      }
    };

    readStdin();
  }, []);

  useEffect(() => {
    if (!isLoading && !!chunkedResponse) {
      setMessages((old) => [
        ...old,
        { role: "assistant", content: chunkedResponse },
      ]);
      setChunkedResponse("");
    }
  }, [isLoading, chunkedResponse]);

  return (
    <Box flexDirection="column" padding={2}>
      <Box flexDirection="column" marginBottom={1}>
        {messages.map((msg, idx) => (
          <MessageItem key={`message-${idx}`} msg={msg} />
        ))}

        {isLoading && (
          <Box
            alignSelf="flex-start"
            borderColor="red"
            borderStyle="single"
            marginRight={5}
          >
            {!chunkedResponse ? <Spinner /> : <Text>{chunkedResponse}</Text>}
          </Box>
        )}
      </Box>

      <Box borderStyle="single" borderColor="grey">
        {isRawModeSupported ? (
          <TextInput
            key={`input-state-${inputIdx}`}
            suggestions={messages
              .filter((msg) => msg.role === "user")
              .map((msg) => msg.content)}
            placeholder="Send a message."
            onSubmit={onSubmit}
          />
        ) : (
          <Text>
            To use this input, please run the application without piping
          </Text>
        )}
      </Box>

      <Box paddingX={1}>
        <Text color="grey">
          chatgpt-cli v{cli.pkg.version} • by Prince Carlo Juguilon • ©{" "}
          {new Date().getFullYear()}
        </Text>
      </Box>
    </Box>
  );
}
