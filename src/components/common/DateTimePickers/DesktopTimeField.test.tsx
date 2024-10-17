import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateTime } from 'luxon';
import { UserPreferenceContext } from 'src/components/User/Preferences/UserPreferenceProvider';
import { DesktopTimeField } from './DesktopTimeField';

interface TestComponentProps {
  value?: DateTime | null;
  locale?: string;
}

const onChange = jest.fn();

const TestComponent: React.FC<TestComponentProps> = ({
  value = DateTime.local(2024, 1, 2, 3, 4, 5),
  locale = 'en-US',
}) => (
  <UserPreferenceContext.Provider value={{ locale }}>
    <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale={locale}>
      <DesktopTimeField value={value} onChange={onChange} label="Time" />
    </LocalizationProvider>
  </UserPreferenceContext.Provider>
);

describe('DesktopTimeField', () => {
  describe('field value', () => {
    it('is empty when the value is null', () => {
      const { getByRole } = render(<TestComponent value={null} />);

      expect(getByRole('textbox')).toHaveValue('');
    });

    it('is empty when the value is invalid', () => {
      const { getByRole } = render(
        <TestComponent value={DateTime.invalid('Invalid')} />,
      );

      expect(getByRole('textbox')).toHaveValue('');
    });

    it('the formatted value', () => {
      const { getByRole } = render(<TestComponent />);

      expect(getByRole('textbox')).toHaveValue('3:04\u202fAM');
    });

    it('clears when the new value is null', () => {
      const { getByRole, rerender } = render(<TestComponent />);
      rerender(<TestComponent value={null} />);

      expect(getByRole('textbox')).toHaveValue('');
    });

    it('does not update when the new value is invalid', () => {
      const { getByRole, rerender } = render(<TestComponent />);
      rerender(<TestComponent value={DateTime.invalid('Invalid')} />);

      expect(getByRole('textbox')).toHaveValue('3:04\u202fAM');
    });

    it('updates to the formatted new value', () => {
      const { getByRole, rerender } = render(<TestComponent />);
      rerender(<TestComponent value={DateTime.local(2024, 1, 2, 12, 4, 5)} />);

      expect(getByRole('textbox')).toHaveValue('12:04\u202fPM');
    });
  });

  it('clearing the field value calls onChange with null', () => {
    const { getByRole } = render(<TestComponent />);
    userEvent.clear(getByRole('textbox'));
    userEvent.tab();

    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it('an invalid field value calls onChange with an invalid time', () => {
    const { getByRole } = render(<TestComponent value={null} />);
    userEvent.type(getByRole('textbox'), 'a');
    userEvent.tab();

    expect(onChange.mock.lastCall[0].isValid).toBe(false);
  });

  it('a full time value calls onChange with the time', () => {
    const { getByRole } = render(<TestComponent value={null} />);
    userEvent.type(getByRole('textbox'), '6:07 AM');
    userEvent.tab();

    expect(onChange.mock.lastCall[0].toObject()).toMatchObject({
      hour: 6,
      minute: 7,
      second: 0,
      millisecond: 0,
    });
  });

  describe('with the locale en-US', () => {
    const locale = 'en-US';
    it('a time without minutes calls onChange with the time', () => {
      const { getByRole } = render(
        <TestComponent value={null} locale={locale} />,
      );
      userEvent.type(getByRole('textbox'), '1am');
      userEvent.tab();

      expect(onChange.mock.lastCall[0].toObject()).toMatchObject({
        hour: 1,
        minute: 0,
        second: 0,
        millisecond: 0,
      });
    });

    it('has a placeholder', () => {
      const { getByRole } = render(<TestComponent locale={locale} />);

      expect(getByRole('textbox')).toHaveAttribute('placeholder', 'H:MM AA');
    });
  });

  describe('with the locale es', () => {
    const locale = 'es';
    it('a time without minutes calls onChange an invalid time', () => {
      const { getByRole } = render(
        <TestComponent value={null} locale={locale} />,
      );
      userEvent.type(getByRole('textbox'), '1am');
      userEvent.tab();

      expect(onChange.mock.lastCall[0].isValid).toBe(false);
    });

    it('has a placeholder', () => {
      const { getByRole } = render(<TestComponent locale={locale} />);

      expect(getByRole('textbox')).toHaveAttribute('placeholder', 'H:MM');
    });
  });

  it('opens the calendar picker', () => {
    const { getByRole } = render(<TestComponent />);
    userEvent.click(getByRole('button'));

    expect(getByRole('dialog')).toBeInTheDocument();
  });
});
