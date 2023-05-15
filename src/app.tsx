import React, { useState, useEffect } from "react";
import https from "https";
import { Spinner, TextInput } from "@inkjs/ui";
import { Text, Box } from "ink";
import { Result } from "meow";

type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

let inputIdx = 0;

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
  const [isDone, setIsDone] = useState(false);
  const [chunkedResponse, setChunkedResponse] = useState("");
  const [messages, setMessages] = useState<Array<Message>>([
    {
      role: "system",
      content: "Hey there! What can I help you with today?",
    },
  ]);

  const getStreamedResponse = (content: string, messages: Message[]) => {
    if (!process.env["OPENAI_API_KEY"]) {
      console.log("OPENAI_API_KEY key missing");
      process.exit(1);
    }

    const req = https.request(
      {
        hostname: "api.openai.com",
        port: 443,
        path: "/v1/chat/completions",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + process.env["OPENAI_API_KEY"],
        },
      },
      function (res) {
        res.on("data", (chunk) => {
          if (isDone) {
            setIsDone(false);
          }

          const raw: string = chunk.toString();
          if (raw.includes("[DONE]")) return;

          const rawArray = raw
            .replace(/data: {/gi, "{")
            .split("\n")
            .filter((e) => e !== "");

          rawArray.forEach((e) => {
            const parsed = JSON.parse(e);
            if (parsed.choices[0].delta.content) {
              setChunkedResponse((e) => e + parsed.choices[0].delta.content);
            }
          });
        });
        res.on("end", () => {
          setIsDone(true);
        });
      }
    );

    const body = JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [...messages, { role: "user", content }],
      temperature: 0.0,
      stream: true,
    });

    req.on("error", (e) => {
      console.error("problem with request:" + e.message);
    });

    req.write(body);

    req.end();
  };

  useEffect(() => {
    if (isDone && !!chunkedResponse) {
      setMessages((old) => [
        ...old,
        { role: "assistant", content: chunkedResponse },
      ]);
      setChunkedResponse("");
    }
  }, [isDone, chunkedResponse]);

  return (
    <Box flexDirection="column" padding={2}>
      <Box flexDirection="column" marginBottom={1}>
        {messages.map((msg, idx) => (
          <MessageItem key={`message-${idx}`} msg={msg} />
        ))}

        {!!chunkedResponse && (
          <Box
            borderColor="red"
            borderStyle="single"
            borderTop={false}
            borderBottom={false}
            borderLeft={true}
            borderRight={false}
          >
            <Box>
              <Text>Gpt:</Text>
              <Spinner />
              <Text> </Text>
            </Box>
            <Text>{chunkedResponse}</Text>
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
            setMessages((old) => [...old, { role: "user", content }]);
            getStreamedResponse(content, messages);
          }}
        />
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
