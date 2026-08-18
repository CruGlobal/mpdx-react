import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeferredClearAutocomplete } from './DeferredClearAutocomplete';

const onSave = jest.fn();

const options = ['None', 'Orlando, FL', 'Miami, FL'];

interface TestComponentProps {
  value?: string | null;
}

const TestComponent: React.FC<TestComponentProps> = ({ value = 'None' }) => (
  <DeferredClearAutocomplete
    options={options}
    value={value}
    onSave={onSave}
    label="Geographic Location"
  />
);

describe('DeferredClearAutocomplete', () => {
  beforeEach(() => {
    onSave.mockClear();
  });

  it('saves immediately when an option is selected', async () => {
    const { getByRole, findByRole } = render(<TestComponent />);

    const input = getByRole('combobox', { name: 'Geographic Location' });
    userEvent.type(input, 'Orlando');
    userEvent.click(await findByRole('option', { name: 'Orlando, FL' }));

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith('Orlando, FL');
  });

  it('does not save while the value is cleared by typing', () => {
    const { getByRole } = render(<TestComponent value="Orlando, FL" />);

    const input = getByRole('combobox', { name: 'Geographic Location' });
    userEvent.clear(input);

    expect(onSave).not.toHaveBeenCalled();
    // The field stays empty instead of resetting mid-edit
    expect(input).toHaveValue('');
  });

  it('saves null when the cleared input loses focus', () => {
    const { getByRole } = render(<TestComponent value="Orlando, FL" />);

    const input = getByRole('combobox', { name: 'Geographic Location' });
    userEvent.clear(input);
    userEvent.tab();

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith(null);
  });
});
