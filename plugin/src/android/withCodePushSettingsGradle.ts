import {
  AndroidConfig,
  ConfigPlugin,
  withDangerousMod,
} from "@expo/config-plugins";

const fsPromises = require("node:fs/promises");

const settingsString = `include ':app', ':react-native-code-push'
project(':react-native-code-push').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-code-push/android/app')`;

const modifySettingsGradle = (contents: string): string => {
  if (contents && !contents.includes(settingsString)) {
    contents = `${contents}
${settingsString}`;
  }
  return contents;
};

const withCodePushSettingsGradle: ConfigPlugin = (config) => {
  return withDangerousMod(config, [
    "android",
    async (config) => {
      const fileInfo = await AndroidConfig.Paths.getSettingsGradleAsync(
        config.modRequest.projectRoot,
      );
      let contents = await fsPromises.readFile(fileInfo.path, "utf-8");
      contents = modifySettingsGradle(contents);
      await fsPromises.writeFile(fileInfo.path, contents);
      return config;
    },
  ]);
};

export default withCodePushSettingsGradle;
