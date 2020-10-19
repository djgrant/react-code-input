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
  onChange: (tokens: Token[]) => any;
}

export function CodeInput({
  customInputComponent,
  style,
  operators = [],
  variables = [],
  onChange,
  ...inputProps
}: CodeInputProps) {
  const Input = customInputComponent || "input";
  const inputRef = React.createRef<HTMLInputElement>();
  const [value, setValue] = React.useState("");
  const [tokens, setTokens] = React.useState<LintedToken[]>([]);
  const [activeHint, setActiveHint] = React.useState(0);
  const [hintOffset, setHintOffset] = React.useState(0);
  const [scrollPosition, setScrollPosition] = React.useState(0);
  const [computedStyles, setComputedStyled] = React.useState(
    getComputedStyles(null)
  );

  const [currentToken, setCurrentToken] = React.useState<LintedToken>();
  const hints = currentToken?.hints || [];
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
    onChange(usefulTokens);
    setValue(target.value);
  };

  const handleSelectToken = (e: React.SyntheticEvent<HTMLInputElement>) => {
    const cursorPosition = e.currentTarget.selectionStart;
    if (!cursorPosition) {
      setCurrentToken(undefined);
      return;
    }
    let len = 0;
    for (const token of tokens) {
      len += token.value.length;
      if (cursorPosition - 1 < len) {
        setCurrentToken(token);
        const tokenIndex = tokens.indexOf(token);
        const tokenRef = tokenRefs[tokenIndex];
        const tokenRect = tokenRef.current?.getBoundingClientRect();
        setHintOffset(tokenRect?.left || 0);
        return;
      }
    }
    setCurrentToken(undefined);
  };

  const completeHint = (target: HTMLInputElement, hintIndex: number) => {
    const completedValue =
      tokens
        .slice(0, -1)
        .map((t) => t.value)
        .join("") + hints[hintIndex];

    target.value = completedValue;
    target.scrollLeft = target.scrollWidth;
    setActiveHint(0);
    setCurrentToken(undefined);
    handleChange({ target });
  };

  return (
    <div style={{ ...styles.container, ...computedStyles.container }}>
      <Input
        {...inputProps}
        ref={inputRef}
        type="text"
        value={value}
        spellCheck="false"
        style={{ ...style, ...styles.input }}
        onScroll={(e) => {
          setScrollPosition(e.currentTarget.scrollLeft);
        }}
        onClick={handleSelectToken}
        onSelect={handleSelectToken}
        onKeyDown={(e) => {
          handleSelectToken(e);
          if (!hints || !hints.length) return;
          const ctrl = e.ctrlKey;
          const enter = e.key === "Enter";
          const esc = e.key === "Escape";
          const up = e.key === "ArrowUp";
          const down = e.key === "ArrowDown";
          const a = e.key === "a";
          if (ctrl && a) {
            // show hints
          }
          if (esc) {
            // hide hints
          }
          if (enter) {
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
        }}
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
          hints={hints}
          activeIndex={activeHint}
          offset={hintOffset}
          onSelectHint={(selectedHintIndex) => {
            completeHint(
              inputRef.current as HTMLInputElement,
              selectedHintIndex
            );
          }}
        />
      </div>
    </div>
  );
}
