import React, { InputHTMLAttributes } from "react";
import { CSSProperties } from "react";
import { Hints } from "./hints";
import { getTokens, getLintedTokens } from "./lexer";
import { Token, LintedToken } from "./types";
import { styles, getComputedStyles, getTokenStyles } from "./styles";

export interface CodeInputProps {
  customInputComponent?: React.JSXElementConstructor<InputHTMLAttributes<{}>>;
  style: CSSProperties;
  operators: string[];
  variables: string[];
  onChange: (params: { tokens: Token[]; value: string }) => any;
}

const initialTokens: LintedToken[] = [
  { type: "unknown", value: "", valid: false },
];

export function CodeInput({
  customInputComponent,
  style,
  operators = [],
  variables = [],
  onChange,
  ...inputProps
}: CodeInputProps) {
  const Input = customInputComponent || "input";
  const [tokens, setTokens] = React.useState(initialTokens);
  const [activeToken, setActiveToken] = React.useState<LintedToken | null>();
  const [hints, setHints] = React.useState<string[]>([]);
  const [activeHint, setActiveHint] = React.useState(0);
  const [hintOffset, setHintOffset] = React.useState(0);
  const [scrollPosition, setScrollPosition] = React.useState(0);
  const [computedStyles, setComputedStyled] = React.useState(
    getComputedStyles(null)
  );

  const inputRef = React.createRef<HTMLInputElement>();
  const tokenRefs = tokens.map(() => React.createRef<HTMLDivElement>());

  React.useEffect(() => {
    const inputEl = inputRef.current;
    const computedStyles = getComputedStyles(inputEl);
    setComputedStyled(computedStyles);
  }, []);

  const handleChange = ({ target }: { target: HTMLInputElement }) => {
    const rawTokens = getTokens(target.value, operators);
    const lintedTokens = getLintedTokens(rawTokens, operators, variables);
    const usefulTokens = rawTokens.filter((t) => t.type !== "whitespace");
    setTokens(lintedTokens);
    onChange({ tokens: usefulTokens, value: target.value });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const ctrl = e.ctrlKey;
    const enter = e.key === "Enter";
    const space = e.key === " ";
    const esc = e.key === "Escape";
    const up = e.key === "ArrowUp";
    const down = e.key === "ArrowDown";
    const scrollingHints = up || down;

    if (ctrl && space && !hints.length) {
      handleSelectToken(e);
      setHints(variables);
    }
    if (!hints.length) {
      return;
    }
    if (esc) {
      setHints([]);
    }
    if (enter && hints) {
      e.preventDefault();
      completeHint(e.currentTarget, activeHint);
    }
    if (up) {
      e.preventDefault();
      const nextIndex = activeHint - 1;
      const min = 0;
      const max = hints.length - 1;
      setActiveHint(nextIndex < min ? max : nextIndex);
    }
    if (down) {
      e.preventDefault();
      const nextIndex = activeHint + 1;
      const max = hints.length - 1;
      setActiveHint(nextIndex > max ? 0 : nextIndex);
    }
    if (!scrollingHints) {
      handleSelectToken(e);
    }
  };

  const handleSelectToken = (e: React.SyntheticEvent<HTMLInputElement>) => {
    const cursorPosition = e.currentTarget.selectionStart || 0;

    let newActiveToken: LintedToken | null = null;
    let len = 0;
    for (const token of tokens) {
      len += token.value.length;
      if (cursorPosition - 1 < len) {
        newActiveToken = token;
        break;
      }
    }
    if (!newActiveToken) return;
    const tokenIndex = tokens.indexOf(newActiveToken);
    const tokenRef = tokenRefs[tokenIndex];
    const tokenRect = tokenRef.current?.getBoundingClientRect();
    setActiveToken(newActiveToken);
    setHintOffset(tokenRect?.left || 0);
    if (newActiveToken.hints) {
      setHints(newActiveToken.hints);
    } else {
      setHints([]);
    }
  };

  const completeHint = (target: HTMLInputElement, hintIndex: number) => {
    const emptyInput = target.value.length === 0;

    let newCursorPosition = 0;
    let completedValue = "";
    let foundActiveToken = false;
    for (const token of tokens) {
      let newToken;
      if (token !== activeToken) {
        newToken = token.value;
      } else if (token.type !== "variable") {
        newToken = token.value + hints[hintIndex];
      } else {
        newToken = hints[hintIndex];
      }
      if (!foundActiveToken) {
        newCursorPosition += newToken.length;
      }
      if (token === activeToken) {
        foundActiveToken = true;
      }
      completedValue += newToken;
    }

    if (emptyInput) {
      completedValue = hints[hintIndex];
      newCursorPosition = completedValue.length;
    }

    // @todo: enable undo/redo state
    target.value = completedValue;
    target.scrollLeft = target.scrollWidth;
    target.selectionStart = newCursorPosition;
    target.selectionEnd = newCursorPosition;

    setActiveHint(0);
    setHints([]);
    handleChange({ target });
  };

  return (
    <div style={{ ...styles.container, ...computedStyles.container }}>
      <Input
        {...inputProps}
        ref={inputRef}
        type="text"
        spellCheck="false"
        style={{ ...style, ...styles.input }}
        onScroll={(e) => setScrollPosition(e.currentTarget.scrollLeft)}
        onBlur={() => setHints([])}
        onFocus={handleSelectToken}
        onClick={handleSelectToken}
        onSelect={handleSelectToken}
        onKeyDown={handleKeyDown}
        onChange={handleChange}
      />
      <div
        style={{
          ...styles.shadowInputContainer,
          ...computedStyles.shadowInputContainer,
        }}
      >
        <div style={{ overflow: "hidden" }}>
          <div
            style={{
              ...styles.shadowInput,
              ...computedStyles.shadowInput,
              marginLeft: `-${scrollPosition}px`,
            }}
          >
            {tokens.map((token, i) => (
              <div
                key={`${i}.${token.value}`}
                ref={tokenRefs[i]}
                style={getTokenStyles(token)}
              >
                {token.value === " " ? "\u00A0" : token.value}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={styles.hints}>
        <Hints
          style={computedStyles.hints}
          hints={hints}
          activeIndex={activeHint}
          offset={hintOffset}
          onSelectHint={(activeHintIndex) => {
            completeHint(inputRef.current as HTMLInputElement, activeHintIndex);
          }}
        />
      </div>
    </div>
  );
}
