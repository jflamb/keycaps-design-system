import { useEffect, useState, type PropsWithChildren } from "react";
import {
  DocsContainer,
  type DocsContainerProps,
} from "@storybook/addon-docs/blocks";
import { currentTheme, subscribeToTheme } from "./globals";
import { keycapsDark, keycapsLight } from "./keycaps-theme";

/**
 * `parameters.docs.theme` is resolved once and cannot depend on a global, so on
 * its own the docs chrome — args tables, the canvas toolbar, the syntax palette,
 * the copy buttons — stays in whichever theme it was configured with while the
 * page around it switches. Feeding `DocsContainer` a theme that follows the
 * toolbar keeps Storybook's own docs layout intact and makes the whole frame
 * one surface instead of a light sheet over dark tokens.
 */
export function KeycapsDocsContainer({
  children,
  context,
}: PropsWithChildren<DocsContainerProps>) {
  const [theme, setTheme] = useState(currentTheme);
  useEffect(() => subscribeToTheme(setTheme), []);

  return (
    <DocsContainer
      context={context}
      theme={theme === "dark" ? keycapsDark : keycapsLight}
    >
      {children}
    </DocsContainer>
  );
}
