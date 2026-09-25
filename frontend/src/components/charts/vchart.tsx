"use client";

import "@visactor/vchart/esm/vchart-all";
import { VChart as VisActorChart } from "@visactor/react-vchart";
import { ThemeManager, type ITheme } from "@visactor/vchart";
import { useTheme } from "next-themes";
import { useEffect, type ComponentProps } from "react";
import { customDarkTheme, customLightTheme } from "@/config/chart-theme";

type VChartProps = ComponentProps<typeof VisActorChart>;

let themesRegistered = false;

function registerThemes() {
  if (themesRegistered) return;

  const fontFamily = window
    .getComputedStyle(document.body)
    .getPropertyValue("--font-gabarito")
    .trim();
  const withFont = (theme: ITheme): Partial<ITheme> => ({ ...theme, fontFamily });

  ThemeManager.registerTheme("light", withFont(customLightTheme));
  ThemeManager.registerTheme("dark", withFont(customDarkTheme));
  themesRegistered = true;
}

function resolveTheme(theme: string | undefined) {
  if (theme === "light" || theme === "dark") return theme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function VChart(props: VChartProps) {
  const { theme } = useTheme();

  useEffect(() => {
    registerThemes();

    const updateTheme = () => ThemeManager.setCurrentTheme(resolveTheme(theme));
    updateTheme();

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system" || !theme) updateTheme();
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  return <VisActorChart {...props} />;
}
