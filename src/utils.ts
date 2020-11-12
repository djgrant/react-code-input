export const makeSetInputElementProperty = (
  inputRef: React.RefObject<HTMLInputElement>
) => <T extends {}>(method: string, value: T) => {
  Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    method
  )?.set?.call(inputRef.current, value);
};
