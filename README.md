# react-code-input

Tokenisation, syntax highlighting, linting and code completion for simple code expressions.

At present, the component's understanding of code is very naive. I wrote it for a particular use-case but recognise that it could have broader use. So, if you have ideas about how it should be developed, open an issue :)

### Quick start

```ts
import { CodeInput } from 'react-code-input';

export default () => (
  <CodeInput
    placeholder="price - vat"
    operators={['+', '-', '/', '*']}
    variables={['price', 'vat']}
    customInput={MyInput}
    styles={{ width: '300px' }}
    onChange={tokens => console.log(tokens)}
  />
);
```
