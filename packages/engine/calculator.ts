export const calculator = () => {
  const add = (a: number, b: number): number => {
    return a + b;
  };

  const subtract = (a: number, b: number): number => {
    return a - b;
  };

  const multiply = (a: number, b: number): number => {
    return a * b;
  };

  const divide = (a: number, b: number): number => {
    if (b === 0) {
      throw new Error('Cannot divide by zero.');
    }
    return a / b;
  };

  return {
    add,
    subtract,
    multiply,
    divide,
  };
};
