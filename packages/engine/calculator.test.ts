import { describe, expect, test } from 'vitest';
import { calculator } from './calculator';

describe('calculator', () => {
  const calc = calculator();

  test('add should return the correct sum of two positive numbers', () => {
    expect(calc.add(2, 3)).toBe(5);
  });

  test('add should return the correct sum of positive and negative numbers', () => {
    expect(calc.add(5, -3)).toBe(2);
  });

  test('subtract should return the correct difference of two numbers', () => {
    expect(calc.subtract(10, 4)).toBe(6);
  });

  test('subtract should return a negative number when subtracting a larger number', () => {
    expect(calc.subtract(4, 10)).toBe(-6);
  });

  test('multiply should return the correct product of two numbers', () => {
    expect(calc.multiply(5, 5)).toBe(25);
  });

  test('multiply should handle multiplication with zero', () => {
    expect(calc.multiply(10, 0)).toBe(0);
  });

  test('divide should return the correct quotient of two numbers', () => {
    expect(calc.divide(10, 2)).toBe(5);
  });

  test('divide should return a decimal for non-integer results', () => {
    expect(calc.divide(7, 2)).toBe(3.5);
  });

  test('divide should throw an error when dividing by zero', () => {
    expect(() => calc.divide(10, 0)).toThrow('Cannot divide by zero.');
  });
});
