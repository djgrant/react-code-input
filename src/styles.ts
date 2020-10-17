import { CSSProperties } from "react";
import { LintedToken } from "./types";

interface ComputedStyles {
  container: CSSProperties;
  shadowInput: CSSProperties;
  shadowInputContainer: CSSProperties;
}

export const styles: Record<string, CSSProperties> = {
  container: {
    position: "relative",
    textAlign: "left",
  },
  shadowInputContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    pointerEvents: "none",
  },
  input: {
    color: "transparent",
    caretColor: "black",
  },
  shadowInput: {
    borderColor: "transparent",
  },
  hints: {
    position: "absolute",
    left: 0,
    right: 0,
  },
};

export const getComputedStyles = (
  inputEl: HTMLElement | null
): ComputedStyles => {
  if (!inputEl) {
    return { container: {}, shadowInput: {}, shadowInputContainer: {} };
  }
  const s = getComputedStyle(inputEl);
  return {
    container: {
      display: s.display,
    },
    shadowInput: {
      width: s.width,
      fontFamily: s.fontFamily,
      fontWeight: s.fontWeight,
      fontSize: s.fontSize,
      lineHeight: s.lineHeight,
      borderTopStyle: s.borderTopStyle,
      borderBottomStyle: s.borderBottomStyle,
      borderLeftStyle: s.borderLeftStyle,
      borderRightStyle: s.borderRightStyle,
      borderTopWidth: s.borderTopWidth,
      borderBottomWidth: s.borderBottomWidth,
      borderLeftWidth: s.borderLeftWidth,
      borderRightWidth: s.borderRightWidth,
    },
    shadowInputContainer: {
      paddingLeft: s.paddingLeft,
      paddingRight: s.paddingRight,
      paddingTop: s.paddingTop,
      paddingBottom: s.paddingBottom,
    },
  } as ComputedStyles;
};

export const getTokenStyles = ({ type, valid }: LintedToken) => {
  const style: CSSProperties = {
    position: "relative",
    display: "inline",
    borderBottom: valid ? undefined : "2px dotted red",
  };
  if (type === "variable" && valid) {
    style.color = "rgb(0, 112, 230)";
  } else if (type === "number") {
    style.color = "rgb(0, 170, 123)";
  } else {
    style.color = "rgb(11, 13, 14)";
  }
  return style;
};
