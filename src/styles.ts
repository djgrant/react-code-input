import { CSSProperties } from "react";

export const getContainerStyles = (inputEl: HTMLElement) => {
  const s = getComputedStyle(inputEl);
  return {
    display: s.display,
  } as CSSProperties;
};

export const getShadowInputStyles = (inputEl: HTMLElement) => {
  const s = getComputedStyle(inputEl);
  return {
    width: s.width,
    height: s.height,
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
  } as CSSProperties;
};

export const getShadowInputContainerStyles = (inputEl: HTMLElement) => {
  const s = getComputedStyle(inputEl);
  return {
    paddingLeft: s.paddingLeft,
    paddingRight: s.paddingRight,
    paddingTop: s.paddingTop,
    paddingBottom: s.paddingBottom,
  } as CSSProperties;
};
