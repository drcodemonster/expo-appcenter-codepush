import {
  ConfigPlugin,
  IOSConfig,
  withDangerousMod,
} from "@expo/config-plugins";

const fsPromises = require("node:fs/promises");

const methodInvocationBlock = `return [CodePush bundleURL]`;

export function modifyObjcAppDelegate(contents: string): string {
  // Add import
  if (contents && !contents.includes("#import <CodePush/CodePush.h>")) {
    contents = contents.replace(
      /#import "AppDelegate.h"/g,
      `#import "AppDelegate.h"
#import <CodePush/CodePush.h>`,
    );
  }

  // Set url for bridge
  if (contents && !contents.includes(methodInvocationBlock)) {
    contents = contents.replace(
      /return \[\[NSBundle mainBundle\] URLForResource\:\@\"main\" withExtension\:\@\"jsbundle\"\]/g,
      `${methodInvocationBlock}`,
    );
  }

  return contents;
}

export const withCodePushAppDelegate: ConfigPlugin = (config) => {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const fileInfo = IOSConfig.Paths.getAppDelegate(
        config.modRequest.projectRoot,
      );
      let contents = await fsPromises.readFile(fileInfo.path, "utf-8");
      if (fileInfo.language === "objc" || fileInfo.language === "objcpp") {
        contents = modifyObjcAppDelegate(contents);
      } else {
        // TODO: Support Swift
        throw new Error(
          `Cannot add CodePush code to AppDelegate of language "${fileInfo.language}"`,
        );
      }
      await fsPromises.writeFile(fileInfo.path, contents);

      return config;
    },
  ]);
};
