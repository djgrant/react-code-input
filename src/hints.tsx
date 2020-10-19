import React, { CSSProperties } from 'react';

interface HintsProps {
  hints: string[];
  activeIndex: number;
  offset: number;
  onSelectHint: (index: number) => any;
}

export function Hints({
  hints,
  activeIndex,
  offset,
  onSelectHint,
}: HintsProps) {
  if (!hints.length) return null;
  return (
    <div style={styles.hints(offset)}>
      {hints.map((hint, i) => (
        <div
          key={i}
          style={{
            ...styles.hint,
            ...(activeIndex === i ? styles.hintActive : {}),
          }}
          onMouseDown={e => {
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

const styles = {
  hints: (offset: number): CSSProperties => ({
    background: 'white',
    color: 'black',
    display: 'inline-block',
    fontSize: 12,
    fontFamily: 'monospace',
    minWidth: '150px',
    position: 'fixed',
    left: `${offset}px`,
  }),
  hint: {
    padding: '10px 8px',
    border: '1px solid #ddd',
    borderTop: 'none',
    cursor: 'pointer',
  },
  hintActive: {
    background: '#4299E1',
    color: 'white',
  },
};
