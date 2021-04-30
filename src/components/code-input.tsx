import React, { useEffect, useMemo, useState } from "react";
import { CSSProperties } from "react";
import { Hints } from "./hints";
import { getTokens, getEditorTokens, buildAST } from "../compiler";
import { AST, Token, EditorToken } from "../compiler/types";
import { styles, getComputedStyles, getTokenStyles } from "./styles";

export interface CodeInputProps extends React.InputHTMLAttributes<{}> {
  symbols?: string[];
  customInputComponent?: React.JSXElementConstructor<
    React.InputHTMLAttributes<{}>
  >;
  style?: CSSProperties;
  onChange?: (event: React.SyntheticEvent<HTMLInputElement>) => void;
  onParse?: (params: {
    tokens: Token[];
    ast: AST | null | void;
    errors: Error[];
  }) => void;
}

export function CodeInput(props: CodeInputProps) {
  const {
    symbols = [],
    style = {},
    onChange = () => {},
    onParse,
    customInputComponent,
    ...inputProps
  } = props;
  const Input = customInputComponent || "input";
  const inputIsUncontrolled = typeof inputProps.value === "undefined";

  const [controlledValue, setControlledValue] = useState(
    (inputIsUncontrolled && props.defaultValue?.toString()) || ""
  );

  const value = inputIsUncontrolled
    ? controlledValue
    : inputProps.value?.toString() || "";

  const sourceTokens = useMemo(() => getTokens(value), [value]);
  const tokens = useMemo(() => getEditorTokens(sourceTokens, symbols), [value]);

  const [activeTokenIndex, setActiveTokenIndex] = useState<number | null>();
  const [hints, setHints] = useState<string[]>([]);
  const [activeHint, setActiveHint] = useState(0);
  const [hintOffset, setHintOffset] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [computedStyles, setComputedStyled] = useState(getComputedStyles(null));

  const inputRef = React.createRef<HTMLInputElement>();
  const tokenRefs = tokens.map(() => React.createRef<HTMLDivElement>());

  useEffect(() => {
    let ast;
    const errors = tokens
      .filter(t => !t.valid)
      .map(t => new Error(`Cannot find identifier ${t.value}`));

    try {
      ast = buildAST(sourceTokens);
    } catch (err) {
      errors.push(err);
    }

    inputRef.current?.setCustomValidity(errors.length ? errors[0].message : "");

    if (typeof onParse === "function") {
      onParse({ tokens: sourceTokens, ast, errors });
    }
  }, [tokens, sourceTokens]);

  useEffect(() => {
    const inputEl = inputRef.current;
    const computedStyles = getComputedStyles(inputEl);
    setComputedStyled(computedStyles);
  }, []);

  const nativeInputSet = <T extends {}>(method: string, value: T) =>
    Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      method
    )?.set?.call(inputRef.current, value);

  const handleChange = (event: React.SyntheticEvent<HTMLInputElement>) => {
    if (inputIsUncontrolled) {
      setControlledValue(event.currentTarget.value);
    }
    onChange(event);
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
      setHints(symbols);
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

    let newActiveToken: EditorToken | null = null;
    let len = 0;
    for (const token of tokens) {
      len += token.value.length;
      if (cursorPosition - 1 < len) {
        newActiveToken = token;
        break;
      }
    }
    if (!newActiveToken) return;
    const activeTokenIndex = tokens.indexOf(newActiveToken);

    setActiveTokenIndex(activeTokenIndex);
    if (newActiveToken.hints) {
      setHints(newActiveToken.hints);
    } else {
      setHints([]);
    }

    const activeToken = tokens[activeTokenIndex];
    const activeTokenRef = tokenRefs[activeTokenIndex];
    const activeTokenEl = activeTokenRef.current;
    let offset;

    if (!activeTokenEl) return;

    if (["whitespace", "operator"].includes(activeToken.type)) {
      offset =
        activeTokenEl.offsetLeft + activeTokenEl.getBoundingClientRect().width;
    } else {
      offset = activeTokenEl.offsetLeft;
    }

    setHintOffset(offset);
  };

  const completeHint = (target: HTMLInputElement, hintIndex: number) => {
    const inputIsEmtpy = target.value.length === 0;

    let newCursorPosition = 0;
    let completedValue = "";

    if (inputIsEmtpy) {
      completedValue = hints[hintIndex];
      newCursorPosition = completedValue.length;
    } else {
      tokens.forEach((token, index) => {
        if (index === activeTokenIndex) {
          if (token.type === "identifier") {
            completedValue += hints[hintIndex];
          } else {
            completedValue += (token.raw || token.value) + hints[hintIndex];
          }
          newCursorPosition = completedValue.length;
        } else {
          completedValue += token.raw || token.value;
        }
      });
    }

    setHints([]);
    setActiveHint(0);
    nativeInputSet("value", completedValue);
    nativeInputSet("scrollLeft", target.scrollWidth);
    nativeInputSet("selectionStart", newCursorPosition);
    nativeInputSet("selectionEnd", newCursorPosition);
    inputRef.current?.dispatchEvent(new Event("change", { bubbles: true }));
  };

  return (
    <div style={{ ...styles.container, ...computedStyles.container }}>
      <Input
        {...inputProps}
        ref={inputRef}
        type="text"
        spellCheck="false"
        style={{ ...style, ...styles.input }}
        value={inputProps.value || value}
        onScroll={e => setScrollPosition(e.currentTarget.scrollLeft)}
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
                {token.raw || token.value}
              </div>
            ))}
          </div>
        </div>
      </div>
      <Hints
        inputRef={inputRef}
        hints={hints}
        activeIndex={activeHint}
        offsetLeft={hintOffset}
        onSelectHint={activeHintIndex => {
          completeHint(inputRef.current as HTMLInputElement, activeHintIndex);
        }}
      />
    </div>
  );
}
