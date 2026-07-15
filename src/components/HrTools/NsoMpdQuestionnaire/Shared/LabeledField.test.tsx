import React from 'react';
import { render } from '@testing-library/react';
import { LabeledField } from './LabeledField';

interface RenderOptions {
  required?: boolean;
  error?: boolean;
  helperText?: React.ReactNode;
}

const renderField = ({ required, error, helperText }: RenderOptions = {}) =>
  render(
    <LabeledField
      label="Question text"
      required={required}
      error={error}
      helperText={helperText}
    >
      {(aria) => <input type="text" {...aria} />}
    </LabeledField>,
  );

describe('LabeledField', () => {
  it('labels the control with the question text via aria-labelledby', () => {
    const { getByRole } = renderField();

    expect(getByRole('textbox', { name: 'Question text' })).toBeInTheDocument();
  });

  it('renders the label above the field as a span, not a floating input label', () => {
    const { getByText } = renderField();

    // FormLabel component="span" renders a <span>; a floating MUI label is a <label>.
    expect(getByText('Question text').tagName).toBe('SPAN');
  });

  it('wires the helper text to the control via aria-describedby', () => {
    const { getByRole, getByText } = renderField({ helperText: 'Some help' });

    const describedBy = getByRole('textbox', {
      name: 'Question text',
    }).getAttribute('aria-describedby');

    expect(describedBy).toBeTruthy();
    expect(getByText('Some help')).toHaveAttribute('id', describedBy);
  });

  it('omits aria-describedby when there is no helper text', () => {
    const { getByRole } = renderField();

    expect(getByRole('textbox', { name: 'Question text' })).not.toHaveAttribute(
      'aria-describedby',
    );
  });

  it('marks the label required', () => {
    const { getByText } = renderField({ required: true });

    expect(getByText('Question text')).toHaveClass('Mui-required');
  });

  it('reflects the error state on the label', () => {
    const { getByText } = renderField({ error: true, helperText: 'Bad' });

    expect(getByText('Question text')).toHaveClass('Mui-error');
  });
});
