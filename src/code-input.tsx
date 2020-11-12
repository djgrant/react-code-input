import React, { createRef, useState, useEffect } from 'react';
import { CSSProperties } from 'react';
import { Hints } from './hints';
import { makeSetInputElementProperty } from './utils';
import { getTokens, getLintedTokens } from './lexer';
import { Token, LintedToken } from './types';
import { styles, getComputedStyles, getTokenStyles } from './styles';

const QUOTE_MARK = /['"]/;
const WHITESPACE = / +/;

export interface CodeInputProps extends React.InputHTMLAttributes<{}> {
  operators?: string[];
  variables?: string[];
  customInputComponent?: React.JSXElementConstructor<
    React.InputHTMLAttributes<{}>
  >;
  style?: CSSProperties;
  onChange?: (
    event: React.SyntheticEvent<HTMLInputElement> & { tokens: Token[] }
  ) => void;
}

export function CodeInput(props: CodeInputProps) {
  const {
    operators = [],
    variables = [],
    style = {},
    onChange = () => {},
    customInputComponent,
    ...inputProps
  } = props;
  const Input = customInputComponent || 'input';
  const inputIsUncontrolled = typeof inputProps.value === 'undefined';
  const defaultValue = props.defaultValue?.toString() || '';
  const initialValue = inputProps.value?.toString() || '';

  const [activeTokenIndex, setActiveTokenIndex] = useState<number | null>(null);
  const [hints, setHints] = useState<string[]>([]);
  const [activeHint, setActiveHint] = useState(0);
  const [hintOffset, setHintOffset] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [computedStyles, setComputedStyled] = useState(getComputedStyles(null));
  const [controlledValue, setControlledValue] = useState(defaultValue);

  const value = inputIsUncontrolled ? controlledValue : initialValue;
  const rawTokens = getTokens(value, operators);
  const tokens = getLintedTokens(rawTokens, operators, variables);

  const inputRef = createRef<HTMLInputElement>();
  const tokenRefs = tokens.map(() => createRef<HTMLDivElement>());

  const setInputProperty = makeSetInputElementProperty(inputRef);

  useEffect(() => {
    const inputEl = inputRef.current;
    const computedStyles = getComputedStyles(inputEl);
    setComputedStyled(computedStyles);
  }, []);

  const handleChange = (event: React.SyntheticEvent<HTMLInputElement>) => {
    const nextValue = event.currentTarget.value;
    if (inputIsUncontrolled) {
      setControlledValue(nextValue);
    }
    onChange(Object.assign(event, { tokens: getTokens(nextValue, operators) }));
  };

  const handleEditingKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const selectionStart = e.currentTarget.selectionStart || 0;
    const currentToken =
      activeTokenIndex !== null ? tokens[activeTokenIndex] : null;
    const prevToken =
      activeTokenIndex !== null ? tokens[activeTokenIndex - 1] || null : null;

    e.persist();

    /* 
      Insert quote pair
      @transform: *| *  ->  *"| *  =>  *"|" *
      @skip:      "|*  
      @skip:      *|*  
      @skip:      "*|
    */
    if (
      QUOTE_MARK.test(e.key) &&
      !QUOTE_MARK.test(value[selectionStart - 1]) &&
      !(currentToken && currentToken.type === 'unterminatedString') &&
      !(prevToken && prevToken.type === 'unterminatedString') &&
      (typeof value[selectionStart] === 'undefined' ||
        WHITESPACE.test(value[selectionStart]))
    ) {
      const newValue =
        (value.slice(0, selectionStart) || '') +
        e.key +
        (value.slice(selectionStart) || '');

      setInputProperty('value', newValue);
      setInputProperty('selectionStart', selectionStart);
      setInputProperty('selectionEnd', selectionStart);
      if (!inputIsUncontrolled) {
        handleChange(e);
      }
    }

    /*
      Overwrite closing quote
      @transform: *|"  ->  *"|
      @transform: *|'  ->  *'| 
    */
    if (
      QUOTE_MARK.test(e.key) &&
      QUOTE_MARK.test(value[selectionStart]) &&
      e.key === value[selectionStart] &&
      currentToken &&
      currentToken.type === 'string' &&
      currentToken.value.startsWith(e.key)
    ) {
      e.preventDefault();
      setInputProperty('selectionStart', selectionStart + 1);
      setInputProperty('selectionEnd', selectionStart + 1);
    }

    /*
      Delete quote pair
      @transform: "|"  ->  | 
    */
    if (
      e.key === 'Backspace' &&
      QUOTE_MARK.test(value[selectionStart - 1]) &&
      QUOTE_MARK.test(value[selectionStart])
    ) {
      const newValue =
        (value.slice(0, selectionStart - 1) || '') +
        (value.slice(selectionStart + 1) || '');

      e.preventDefault();
      setInputProperty('value', newValue);
      setInputProperty('selectionStart', selectionStart - 1);
      setInputProperty('selectionEnd', selectionStart - 1);
      handleChange(e);
    }
  };

  const handleNavigatingKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    const ctrl = e.ctrlKey;
    const enter = e.key === 'Enter';
    const space = e.key === ' ';
    const esc = e.key === 'Escape';
    const up = e.key === 'ArrowUp';
    const down = e.key === 'ArrowDown';

    // <Hints /> closed
    if (ctrl && space && !hints.length) {
      handleSelectToken(e);
      setHints(variables);
    }

    if (!hints.length) {
      return;
    }

    // <Hints /> open
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
    if (!(up || down)) {
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

    if (['whitespace', 'operator'].includes(activeToken.type)) {
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
    let completedValue = '';

    if (inputIsEmtpy) {
      completedValue = hints[hintIndex];
      newCursorPosition = completedValue.length;
    } else {
      tokens.forEach((token, index) => {
        if (index === activeTokenIndex) {
          if (token.type === 'variable') {
            completedValue += hints[hintIndex];
          } else {
            completedValue += token.value + hints[hintIndex];
          }
          newCursorPosition = completedValue.length;
        } else {
          completedValue += token.value;
        }
      });
    }

    setHints([]);
    setActiveHint(0);
    setInputProperty('value', completedValue);
    setInputProperty('scrollLeft', target.scrollWidth);
    setInputProperty('selectionStart', newCursorPosition);
    setInputProperty('selectionEnd', newCursorPosition);
    inputRef.current?.dispatchEvent(new Event('change', { bubbles: true }));
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
        onKeyDown={e => {
          handleEditingKeyDown(e);
          handleNavigatingKeyDown(e);
        }}
        onChange={handleChange}
      />
      <div
        style={{
          ...styles.shadowInputContainer,
          ...computedStyles.shadowInputContainer,
        }}
      >
        <div style={{ overflow: 'hidden' }}>
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
                {token.value === ' ' ? '\u00A0' : token.value}
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
