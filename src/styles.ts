import { CSSProperties } from 'react';

interface ComputedStyles {
  container: CSSProperties;
  shadowInput: CSSProperties;
  shadowInputContainer: CSSProperties;
}

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
