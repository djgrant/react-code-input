import React, { InputHTMLAttributes } from "react";
import { CSSProperties } from "react";
import { Hints } from "./hints";
import { getTokens, getEditorTokens, buildAST } from "../compiler";
import { Token, EditorToken } from "../compiler/types";
import { styles, getComputedStyles, getTokenStyles } from "./styles";

export interface CodeInputProps extends InputHTMLAttributes<{}> {
  symbols?: string[];
  customInputComponent?: React.JSXElementConstructor<InputHTMLAttributes<{}>>;
  style?: CSSProperties;
  onChange?: (
    event: React.SyntheticEvent<HTMLInputElement> & { tokens: Token[] }
  ) => void;
}

export function CodeInput(props: CodeInputProps) {
  const {
    symbols = [],
    style = {},
    onChange = () => {},
    customInputComponent,
    ...inputProps
  } = props;
  const Input = customInputComponent || "input";
  const inputIsUncontrolled = typeof inputProps.value === "undefined";
  const [controlledValue, setControlledValue] = React.useState(
    (inputIsUncontrolled && props.defaultValue?.toString()) || ""
  );
  const value = inputIsUncontrolled
    ? controlledValue
    : inputProps.value?.toString() || "";
  const sourceTokens = getTokens(value);
  const tokens = getEditorTokens(sourceTokens, symbols);
  const [activeTokenIndex, setActiveTokenIndex] = React.useState<
    number | null
  >();
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
    const errors = tokens
      .filter(t => !t.valid)
      .map(t => new Error(`Cannot find identifier ${t.value}`));

    try {
      buildAST(sourceTokens);
    } catch (err) {
      errors.push(err);
    }

    if (errors.length) {
      inputRef.current?.setCustomValidity(errors[0].message);
    } else {
      inputRef.current?.setCustomValidity("");
    }
  }, [tokens, inputRef]);

  const nativeInputSet = <T extends {}>(method: string, value: T) =>
    Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      method
    )?.set?.call(inputRef.current, value);

  React.useEffect(() => {
    const inputEl = inputRef.current;
    const computedStyles = getComputedStyles(inputEl);
    setComputedStyled(computedStyles);
  }, []);

  const handleChange = (event: React.SyntheticEvent<HTMLInputElement>) => {
    if (inputIsUncontrolled) {
      setControlledValue(event.currentTarget.value);
    }
    onChange(Object.assign(event, { tokens: sourceTokens }));
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
