import React, { InputHTMLAttributes } from 'react';
import { CSSProperties } from 'react';
import { Hints } from './hints';
import { getTokens, getLintedTokens } from './lexer';
import { Token, LintedToken } from './types';
import { getComputedStyles } from './styles';

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
  const Input = customInputComponent || 'input';
  const inputRef = React.createRef<HTMLInputElement>();
  const [value, setValue] = React.useState('');
  const [tokens, setTokens] = React.useState<LintedToken[]>([]);
  const [activeHint, setActiveHint] = React.useState(0);
  const [selectedTokenPosition, setSelectedTokenPosition] = React.useState(0);
  const [scrollPosition, setScrollPosition] = React.useState(0);
  const [computedStyles, setComputedStyled] = React.useState(
    getComputedStyles(null)
  );

  const currentToken = tokens[tokens.length - 1];
  const hints = currentToken?.hints || [];

  React.useEffect(() => {
    const inputEl = inputRef.current;
    const computedStyles = getComputedStyles(inputEl);
    setComputedStyled(computedStyles);
  }, []);

  const handleChange = ({ target }: { target: HTMLInputElement }) => {
    const rawTokens = getTokens(target.value, operators);
    const lintedTokens = getLintedTokens(rawTokens, operators, variables);
    const usefulTokens = rawTokens.filter(t => t.type !== 'whitespace');
    setTokens(lintedTokens);
    onChange(usefulTokens);
    setValue(target.value);
  };

  const completeHint = (target: HTMLInputElement, hintIndex: number) => {
    const completedValue =
      tokens
        .slice(0, -1)
        .map(t => t.value)
        .join('') + hints[hintIndex];

    target.value = completedValue;
    target.scrollLeft = target.scrollWidth;
    setActiveHint(0);
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
        onScroll={e => {
          setScrollPosition(e.currentTarget.scrollLeft);
        }}
        }}
        onKeyDown={e => {
          if (!hints || !hints.length) return;
          const ctrl = e.ctrlKey;
          const enter = e.key === 'Enter';
          const esc = e.key === 'Escape';
          const up = e.key === 'ArrowUp';
          const down = e.key === 'ArrowDown';
          const a = e.key === 'a';
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
        <div style={{ overflow: 'hidden' }}>
          <div
            style={{
              ...styles.shadowInput,
              ...computedStyles.shadowInput,
              marginLeft: `-${scrollPosition}px`,
            }}
          >
            {tokens.map((token, i) => (
              <div key={`${i}.${token.value}`} style={getTokenStyles(token)}>
                {token.value === ' ' ? '\u00A0' : token.value}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={styles.hints}>
        <Hints
          hints={hints}
          activeIndex={activeHint}
          onSelectHint={selectedHintIndex => {
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

const styles: Record<string, CSSProperties> = {
  container: {
    position: 'relative',
    textAlign: 'left',
  },
  shadowInputContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    pointerEvents: 'none',
  },
  input: {
    color: 'transparent',
    caretColor: 'black',
  },
  shadowInput: {
    borderColor: 'transparent',
  },
  hints: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
};

const getTokenStyles = ({ type, valid }: LintedToken) => {
  const style: CSSProperties = {
    position: 'relative',
    display: 'inline',
    borderBottom: valid ? undefined : '2px dotted red',
  };
  if (type === 'variable' && valid) {
    style.color = 'rgb(0, 112, 230)';
  } else if (type === 'number') {
    style.color = 'rgb(0, 170, 123)';
  } else {
    style.color = 'rgb(11, 13, 14)';
  }
  return style;
};
