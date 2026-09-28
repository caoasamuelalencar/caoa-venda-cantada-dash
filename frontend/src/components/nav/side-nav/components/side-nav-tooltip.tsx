"use client";

import {
  type FocusEvent,
  type MouseEvent,
  type ReactElement,
  cloneElement,
  useEffect,
  useId,
  useState,
} from "react";
import { createPortal } from "react-dom";

type TooltipPosition = {
  left: number;
  top: number;
};

type SideNavTooltipProps = {
  children: ReactElement<{ "aria-describedby"?: string }>;
  enabled: boolean;
  label: string;
};

/**
 * Keeps the compact-navigation labels outside the scrollable sidebar so they
 * are not clipped while still being available on hover and keyboard focus.
 */
export default function SideNavTooltip({
  children,
  enabled,
  label,
}: SideNavTooltipProps) {
  const tooltipId = useId();
  const [position, setPosition] = useState<TooltipPosition | null>(null);

  useEffect(() => {
    if (!enabled) setPosition(null);
  }, [enabled]);

  function showTooltip(
    event: MouseEvent<HTMLSpanElement> | FocusEvent<HTMLSpanElement>,
  ) {
    if (!enabled || !window.matchMedia("(min-width: 750px)").matches) return;

    const anchor = event.currentTarget.getBoundingClientRect();
    setPosition({
      left: anchor.right + 12,
      top: anchor.top + anchor.height / 2,
    });
  }

  function hideTooltip() {
    setPosition(null);
  }

  return (
    <>
      <span
        className="block"
        onBlur={hideTooltip}
        onFocus={showTooltip}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
      >
        {cloneElement(children, {
          "aria-describedby": position ? tooltipId : undefined,
        })}
      </span>
      {position
        ? createPortal(
            <span
              id={tooltipId}
              role="tooltip"
              className="pointer-events-none fixed z-[60] -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs font-normal text-white shadow-lg dark:bg-slate-100 dark:text-slate-900"
              style={position}
            >
              {label}
            </span>,
            document.body,
          )
        : null}
    </>
  );
}
