import type { ChangeEvent } from 'react';

type NumberInputField = {
  value: string | number | null | undefined;
  onChange: (value: string | number) => void;
  onBlur: () => void;
  name: string;
  ref: React.Ref<HTMLInputElement>;
};

export function bindOptionalNumberInput(field: NumberInputField, min = 0) {
  return {
    ...nonNegativeNumberInputProps,
    name: field.name,
    ref: field.ref,
    onBlur: field.onBlur,
    value: field.value ?? '',
    onChange: (event: ChangeEvent<HTMLInputElement>) =>
      handleNonNegativeNumberChange(field.onChange, event, min),
  };
}

export function bindPositiveOptionalNumberInput(field: NumberInputField) {
  return {
    ...positiveNumberInputProps,
    name: field.name,
    ref: field.ref,
    onBlur: field.onBlur,
    value: field.value ?? '',
    onChange: (event: ChangeEvent<HTMLInputElement>) =>
      handleNonNegativeNumberChange(field.onChange, event, 1),
  };
}

export function handleNonNegativeNumberChange(
  onChange: (value: string | number) => void,
  event: ChangeEvent<HTMLInputElement>,
  min = 0,
) {
  const val = event.target.value;
  if (val === '') {
    onChange(val);
    return;
  }
  const num = Number(val);
  if (Number.isNaN(num)) {
    onChange(val);
    return;
  }
  if (num < min) {
    onChange(min);
    return;
  }
  onChange(val);
}

export const nonNegativeNumberInputProps = {
  type: 'number' as const,
  min: 0,
  step: 1,
};

export const positiveNumberInputProps = {
  type: 'number' as const,
  min: 1,
  step: 1,
};
