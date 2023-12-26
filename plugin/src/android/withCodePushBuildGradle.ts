import {
  AndroidConfig,
  ConfigPlugin,
  withDangerousMod,
} from "@expo/config-plugins";

const fsPromises = require("fs");

const gradleModules = `apply from: "../../node_modules/react-native-code-push/android/codepush.gradle"`;

const modifyAppBuildGradle = (contents: string): string => {
  if (contents && !contents.includes(gradleModules)) {
    contents = contents.replace(
      'apply from: new File(reactNativeRoot, "react.gradle")',
      `apply from: new File(reactNativeRoot, "react.gradle")
${gradleModules}`,
    );
  }
  return contents;
};

const withCodePushAppBuildGradle: ConfigPlugin = (config) => {
  return withDangerousMod(config, [
    "android",
    async (config) => {
      const fileInfo = await AndroidConfig.Paths.getAppBuildGradleAsync(
        config.modRequest.projectRoot,
      );
      let contents = await fsPromises.readFile(
        fileInfo.path,
        "utf-8",
        (err: any) => {
          if (err) throw err;
        },
      );
      contents = modifyAppBuildGradle(contents);
      await fsPromises.writeFile(fileInfo.path, contents, (err: any) => {
        if (err) throw err;
      });
      return config;
    },
  ]);
};

export default withCodePushAppBuildGradle;
