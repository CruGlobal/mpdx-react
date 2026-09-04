import React from 'react';
import { ThemeProvider } from '@mui/material';
import { render } from '@testing-library/react';
import theme from 'src/theme';
import { GoalSettingsReadOnlyField } from './GoalSettingsReadOnlyField';

const renderField = (
  props: Partial<React.ComponentProps<typeof GoalSettingsReadOnlyField>> = {},
) =>
  render(
    <ThemeProvider theme={theme}>
      <GoalSettingsReadOnlyField label="Coach" value="Amy Wilson" {...props} />
    </ThemeProvider>,
  );

describe('GoalSettingsReadOnlyField', () => {
  it('renders the hard-coded value', () => {
    const { getByRole } = renderField();

    expect(getByRole('textbox', { name: 'Coach' })).toHaveValue('Amy Wilson');
  });

  it('is disabled so it never participates in the form', () => {
    const { getByRole } = renderField();

    expect(getByRole('textbox', { name: 'Coach' })).toBeDisabled();
  });

  it('exposes the label as the accessible name via aria-label by default', () => {
    const { getByRole } = renderField({ label: 'Training', value: 'Fall NSO' });

    expect(getByRole('textbox', { name: 'Training' })).toBeInTheDocument();
  });

  it('renders a visible label when showLabel is set', () => {
    const { getByLabelText } = renderField({ showLabel: true });

    expect(getByLabelText('Coach')).toBeInTheDocument();
  });
});
