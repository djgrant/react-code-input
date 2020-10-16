import React from "react";

interface HintsProps {
  hints: string[];
  activeIndex: number;
  onSelectHint: (index: number) => any;
}

export function Hints({ hints, activeIndex, onSelectHint }: HintsProps) {
  if (!hints.length) return null;
  return (
    <div style={styles.hints}>
      {hints.map((hint, i) => (
        <div
          key={i}
          style={{
            ...styles.hint,
            ...(activeIndex === i ? styles.hintActive : {}),
          }}
          onClick={() => onSelectHint(i)}
        >
          {hint}
        </div>
      ))}
    </div>
  );
}

const styles = {
  hints: {
    background: "white",
    color: "black",
    display: "inline-block",
    fontSize: 12,
    fontFamily: "monospace",
    minWidth: "100%",
  },
  hint: {
    padding: "10px 8px",
    border: "1px solid #ddd",
    borderTop: "none",
    cursor: "pointer",
  },
  hintActive: {
    background: "#4299E1",
    color: "white",
  },
};
