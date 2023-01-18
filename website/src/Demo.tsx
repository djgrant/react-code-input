import React from "react";
import { CodeInput, AST } from "@djgrant/react-code-input";

export const Demo = () => {
  const initialValue = "sum(accruedInterest, costs) / (commission * 10.5)";
  const [value, setValue] = React.useState(initialValue);
  const [ast, setAST] = React.useState<AST | null | void>();
  const [errors, setErrors] = React.useState<Error[]>([]);
  return (
    <div className="container">
      <CodeInput
        value={value}
        onParse={({ ast, errors }) => {
          setAST(ast);
          setErrors(errors);
        }}
        onChange={e => {
          setValue(e.currentTarget.value);
        }}
        className="input"
        symbols={[
          "accruedInterest",
          "adjustedDiscountPrice",
          "all",
          "any",
          "commission",
          "costs",
          "cpa",
          "cvr",
          "price",
          "profit",
          "salePrice",
          "sum",
          "vat",
        ]}
        style={{
          display: "block",
          width: "100%",
          marginBottom: "10px",
        }}
      />
      <small>
        Tip: press <strong>ctrl + space</strong> to trigger autocomplete
      </small>
      <pre className="parser-results">
        <>
          {errors.length > 0 &&
            errors.map(e => (
              <div style={{ marginBottom: 20 }}>{e.message}</div>
            ))}
          {ast && JSON.stringify(ast, null, 4)}
        </>
      </pre>
    </div>
  );
};
