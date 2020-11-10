import React, { CSSProperties } from 'react';

interface HintsProps {
  hints: string[];
  activeIndex: number;
  offsetLeft: number;
  onSelectHint: (index: number) => any;
  inputRef: React.RefObject<HTMLInputElement>;
}

export function Hints({
  hints,
  activeIndex,
  offsetLeft,
  onSelectHint,
  inputRef,
}: HintsProps) {
  if (!hints.length) return null;
  const containerRef = React.createRef<HTMLDivElement>();
  const hintRefs = hints.map(() => React.createRef<HTMLDivElement>());
  const [styles, setStyles] = React.useState(getComputedStyles(null, 0));

  React.useLayoutEffect(() => {
    const activeHintRef = hintRefs[activeIndex];
    const containerEl = containerRef.current;
    const targetEl = activeHintRef.current;

    if (!containerEl || !targetEl) return;

    const targetOffsetTop = targetEl.offsetTop;
    const targetOffsetTopFromBottom =
      targetEl.offsetTop + targetEl.getBoundingClientRect().height;
    const containerHeight = containerEl.getBoundingClientRect().height;
    const targetAtBottomOffsetTop = targetOffsetTopFromBottom - containerHeight;

    if (targetAtBottomOffsetTop > containerEl.scrollTop) {
      containerEl.scrollTop = targetAtBottomOffsetTop;
    } else if (targetOffsetTop < containerEl.scrollTop) {
      containerEl.scrollTop = targetOffsetTop;
    }
  }, [activeIndex]);

  React.useEffect(() => {
    setStyles(getComputedStyles(inputRef.current, offsetLeft));
  }, []);

  return (
    <div style={styles.positioningContainer}>
      <div style={styles.stackingContainer}>
        <div ref={containerRef} style={styles.hints}>
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
    </div>
  );
}

const getComputedStyles = (inputEl: HTMLElement | null, offsetLeft: number) => {
  if (!inputEl) return { hints: {}, hint: {}, hintActive: {} };
  const s = getComputedStyle(inputEl);
  const hintPaddingY = 4;
  const hintHeight = Number(s.lineHeight.replace('px', '')) + hintPaddingY;
  const hintTop =
    Number(s.lineHeight.replace('px', '')) +
    Number(s.paddingTop.replace('px', '')) +
    4;
  return {
    positioningContainer: {
      position: 'absolute',
      top: hintTop,
    } as CSSProperties,
    stackingContainer: {
      position: 'fixed',
      zIndex: 999,
    } as CSSProperties,
    hints: {
      display: 'inline-block',
      position: 'absolute',
      left: offsetLeft || s.paddingLeft,
      minWidth: 300,
      maxWidth: 400,
      maxHeight: hintHeight * 7,
      marginLeft: -1,
      overflowX: 'hidden',
      overflowY: 'scroll',
      background: '#f9f9f9',
      border: '1px solid #dcdcdc',
      color: '#111',
      fontFamily: s.fontFamily,
      fontWeight: s.fontWeight,
      fontSize: s.fontSize,
    } as CSSProperties,
    hint: {
      boxSizing: 'content-box',
      height: s.lineHeight,
      padding: `${hintPaddingY}px 6px`,
      cursor: 'pointer',
    } as CSSProperties,
    hintActive: {
      background: '#4299E1',
      color: 'white',
    } as CSSProperties,
  };
};
