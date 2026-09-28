"use client";

// This application only renders cartesian line and bar charts. The "simple"
// build registers those charts and their required axes, tooltip and animation
// plugins without shipping every VisActor chart type (maps, 3D, word clouds,
// etc.) to the browser.
import VChartCore from "@visactor/vchart/esm/vchart-simple";
import { VChartSimple as VisActorChart } from "@visactor/react-vchart";
import { ThemeManager } from "@visactor/vchart/esm/theme/theme-manager";
import type { ITheme } from "@visactor/vchart/esm/theme";
import { useTheme } from "next-themes";
import { useEffect, type ComponentProps } from "react";
import { customDarkTheme, customLightTheme } from "@/config/chart-theme";

type VChartProps = Omit<ComponentProps<typeof VisActorChart>, "vchartConstrouctor">;

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

  return <VisActorChart {...props} vchartConstrouctor={VChartCore} />;
}
