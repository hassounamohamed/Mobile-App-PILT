import { Linking, Pressable } from "react-native";
import {
    openBrowserAsync,
    WebBrowserPresentationStyle,
} from "expo-web-browser";
import { type ComponentProps } from "react";

type Props = Omit<ComponentProps<typeof Pressable>, "onPress"> & {
  href: string;
};

export function ExternalLink({ href, ...rest }: Props) {
  return (
    <Pressable
      {...rest}
      onPress={async () => {
        if (process.env.EXPO_OS !== "web") {
          await openBrowserAsync(href, {
            presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
          });
          return;
        }
        await Linking.openURL(href);
      }}
    />
  );
}
