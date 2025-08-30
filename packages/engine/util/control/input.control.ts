import { createButtonState, type IBtnState } from './button-state';

const inputEventArr = ['up', 'right', 'down', 'left', 'run', 'shoot', 'walk', 'start', 'select', 'option'] as const;

type inputType = (typeof inputEventArr)[number];

export type InputData = (input: inputType) => IBtnState;
export type IInput = Record<inputType, IBtnState>;

export const createInputController = (): IInput => {
  const data: Record<inputType, IBtnState> = Object.fromEntries(
    inputEventArr.map((e) => [e, createButtonState()]),
  ) as Record<inputType, IBtnState>;

  return data;
};
