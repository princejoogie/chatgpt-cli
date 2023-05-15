import fs from "fs";
import os from "os";
import path from "path";

const configPath = path.join(os.homedir(), ".config", "chatgpt-cli");
const configFile = path.join(configPath, "config.json");

type Config = {
  author: string;
};

const defaultConfig: Config = {
  author: "princejoogie",
};

export const readConfig = () => {
  try {
    if (!fs.existsSync(configPath)) {
      fs.mkdirSync(configPath, { recursive: true });
    }

    if (!fs.existsSync(configFile)) {
      fs.writeFileSync(configFile, JSON.stringify(defaultConfig));
    }

    return JSON.parse(fs.readFileSync(configFile, "utf-8")) as Config;
  } catch (e) {
    console.log(e);
    return defaultConfig;
  }
};

export const getConfig = <K extends keyof Config>(key: K) => {
  return readConfig()[key];
};

export const setConfig = <K extends keyof Config, V extends Config[K]>(
  key: K,
  value: V
) => {
  const config = readConfig();
  config[key] = value;
  fs.writeFileSync(configFile, JSON.stringify(config));
};
