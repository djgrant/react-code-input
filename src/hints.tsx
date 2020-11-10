import React, { CSSProperties } from "react";

interface HintsProps {
  hints: string[];
  activeIndex: number;
  offset: number;
  onSelectHint: (index: number) => any;
  style: CSSProperties;
}

export function Hints({
  hints,
  activeIndex,
  offset,
  onSelectHint,
  style,
}: HintsProps) {
  if (!hints.length) return null;
  return (
    <div style={{ ...styles.hints, ...style, ...getOffsetStyles(offset) }}>
      {hints.map((hint, i) => (
        <div
          key={i}
          style={{
            ...styles.hint,
            ...(activeIndex === i ? styles.hintActive : {}),
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            onSelectHint(i);
          }}
        >
          {hint}
        </div>
      ))}
    </div>
  );
}

const getOffsetStyles = (offset: number): CSSProperties => {
  if (!offset) return {};
  return { left: offset };
};

const styles: Record<string, CSSProperties> = {
  hints: {
    display: "inline-block",
    position: "absolute",
    top: -1,
    zIndex: 999,
    minWidth: 300,
    maxWidth: 400,
    overflowX: "hidden",
    background: "#f9f9f9",
    border: "1px solid #dcdcdc",
    color: "black",
    boxShadow: "0 -3px 2px rgba(255,255,255,0.5)",
  },
  hint: {
    padding: "4px 6px",
    cursor: "pointer",
  },
  hintActive: {
    background: "#4299E1",
    color: "white",
  },
};
