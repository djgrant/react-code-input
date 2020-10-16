import { CSSProperties } from "react";

export const setStyles = (target: HTMLElement, styles: CSSProperties) => {
  for (const [key, value] of Object.entries(styles)) {
    target.style[key as any] = value;
  }
};
