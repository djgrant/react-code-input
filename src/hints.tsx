import React, { CSSProperties } from 'react';

interface HintsProps {
  hints: string[];
  activeIndex: number;
  offsetLeft: number;
  onSelectHint: (index: number) => any;
  style: CSSProperties;
}

export function Hints({
  hints,
  activeIndex,
  offsetLeft,
  onSelectHint,
  style,
}: HintsProps) {
  if (!hints.length) return null;
  const containerRef = React.createRef<HTMLDivElement>();
  const hintRefs = hints.map(() => React.createRef<HTMLDivElement>());

  React.useEffect(() => {
    const activeHintRef = hintRefs[activeIndex];
    const containerEl = containerRef.current;
    const targetEl = activeHintRef.current;
    if (!containerEl || !targetEl) return;
    containerEl.scrollTop =
      targetEl.offsetTop +
      targetEl.getBoundingClientRect().height -
      containerEl.getBoundingClientRect().height;
  }, [activeIndex]);

  return (
    <div style={{ position: 'relative' }}>
      <div
        ref={containerRef}
        style={{
          ...styles.hints,
          ...style,
          ...computedStyles.hints(offsetLeft),
        }}
      >
        {hints.map((hint, i) => (
          <div
            ref={hintRefs[i]}
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
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  hints: {
    display: 'inline-block',
    position: 'absolute',
    top: -1,
    zIndex: 999,
    minWidth: 300,
    maxWidth: 400,
    maxHeight: 200,
    marginLeft: -1,
    overflowX: 'hidden',
    overflowY: 'scroll',
    background: '#f9f9f9',
    border: '1px solid #dcdcdc',
    color: 'black',
    boxShadow: '0 -3px 2px rgba(255,255,255,0.5)',
  },
  hint: {
    padding: '4px 6px',
    cursor: 'pointer',
  },
  hintActive: {
    background: '#4299E1',
    color: 'white',
  },
};

const computedStyles = {
  hints: (offsetLeft: number): CSSProperties => {
    if (!offsetLeft) return {};
    return { left: offsetLeft };
  },
};
