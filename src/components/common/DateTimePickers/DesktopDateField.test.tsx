import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateTime } from 'luxon';
import { UserPreferenceContext } from 'src/components/User/Preferences/UserPreferenceProvider';
import { DesktopDateField } from './DesktopDateField';

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
      <DesktopDateField value={value} onChange={onChange} label="Date" />
    </LocalizationProvider>
  </UserPreferenceContext.Provider>
);

describe('DesktopDateField', () => {
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

      expect(getByRole('textbox')).toHaveValue('1/2/2024');
    });

    it('clears when the new value is null', () => {
      const { getByRole, rerender } = render(<TestComponent />);
      rerender(<TestComponent value={null} />);

      expect(getByRole('textbox')).toHaveValue('');
    });

    it('does not update when the new value is invalid', () => {
      const { getByRole, rerender } = render(<TestComponent />);
      rerender(<TestComponent value={DateTime.invalid('Invalid')} />);

      expect(getByRole('textbox')).toHaveValue('1/2/2024');
    });

    it('updates to the formatted new value', () => {
      const { getByRole, rerender } = render(<TestComponent />);
      rerender(<TestComponent value={DateTime.local(2024, 12, 2, 3, 4, 5)} />);

      expect(getByRole('textbox')).toHaveValue('12/2/2024');
    });
  });

  it('clearing the field value calls onChange with null', () => {
    const { getByRole } = render(<TestComponent />);
    userEvent.clear(getByRole('textbox'));
    userEvent.tab();

    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it('an invalid field value calls onChange with an invalid date', () => {
    const { getByRole } = render(<TestComponent value={null} />);
    userEvent.type(getByRole('textbox'), 'a');
    userEvent.tab();

    expect(onChange.mock.lastCall[0].isValid).toBe(false);
  });

  it('a 4-digit year value calls onChange with the date', () => {
    const { getByRole } = render(<TestComponent value={null} />);
    userEvent.type(getByRole('textbox'), '6/7/2023');
    userEvent.tab();

    expect(onChange.mock.lastCall[0].toObject()).toMatchObject({
      year: 2023,
      month: 6,
      day: 7,
    });
  });

  it('a 3-digit year value calls onChange with an invalid date', () => {
    const { getByRole } = render(<TestComponent value={null} />);
    userEvent.type(getByRole('textbox'), '6/7/202');
    userEvent.tab();

    expect(onChange.mock.lastCall[0].isValid).toBe(false);
  });

  describe.each([
    { locale: 'en-US', input: '6/7/23', placeholder: 'M/D/YYYY' },
    { locale: 'es', input: '7/6/23', placeholder: 'D/M/YYYY' },
    { locale: 'zh-CN', input: '23/6/7', placeholder: 'YYYY/M/D' },
  ])('with the locale $locale', ({ locale, input, placeholder }) => {
    it('a 2-digit year value calls onChange with the date', () => {
      const { getByRole } = render(
        <TestComponent value={null} locale={locale} />,
      );
      userEvent.type(getByRole('textbox'), input);
      userEvent.tab();

      expect(onChange.mock.lastCall[0].toObject()).toMatchObject({
        year: 2023,
        month: 6,
        day: 7,
      });
    });

    it('has a 4-digit year placeholder', () => {
      const { getByRole } = render(<TestComponent locale={locale} />);

      expect(getByRole('textbox')).toHaveAttribute('placeholder', placeholder);
    });
  });

  it('opens the calendar picker', () => {
    const { getByRole } = render(<TestComponent />);
    userEvent.click(getByRole('button'));

    expect(getByRole('dialog')).toBeInTheDocument();
  });

  describe('start of the week', () => {
    it('is Sunday for en-US locale', () => {
      const { getByRole, getAllByRole } = render(
        <TestComponent value={null} locale={'en-US'} />,
      );

      userEvent.click(getByRole('button'));
      expect(
        getAllByRole('columnheader')
          .map((item) => item.textContent)
          .join(''),
      ).toEqual('SMTWTFS');
    });

    it('is Monday for en-NZ locale', () => {
      const { getByRole, getAllByRole } = render(
        <TestComponent value={null} locale={'en-NZ'} />,
      );

      userEvent.click(getByRole('button'));
      expect(
        getAllByRole('columnheader')
          .map((item) => item.textContent)
          .join(''),
      ).toEqual('MTWTFSS');
    });
  });
});
