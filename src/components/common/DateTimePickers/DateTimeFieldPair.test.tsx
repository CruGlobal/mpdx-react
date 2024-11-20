import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateTime } from 'luxon';
import matchMediaMock from '__tests__/util/matchMediaMock';
import { UserPreferenceContext } from 'src/components/User/Preferences/UserPreferenceProvider';
import { DateTimeFieldPair } from './DateTimeFieldPair';

interface TestComponentProps {
  value?: DateTime | null;
}

const onChange = jest.fn();

const TestComponent: React.FC<TestComponentProps> = ({
  value = DateTime.local(2024, 1, 2, 3, 4, 5),
}) => (
  <UserPreferenceContext.Provider value={{ locale: 'en-US' }}>
    <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale="en-US">
      <DateTimeFieldPair
        value={value}
        onChange={onChange}
        dateLabel="Date"
        timeLabel="Time"
        render={(date, time) => (
          <div>
            {date}
            {time}
          </div>
        )}
      />
    </LocalizationProvider>
  </UserPreferenceContext.Provider>
);

describe('DateTimeFieldPair', () => {
  beforeEach(() => {
    // Make the date/time pickers render the desktop versions
    matchMediaMock({ pointer: 'fine' });
  });

  it('initializes the fields to empty when the value is null', () => {
    const { getByRole } = render(<TestComponent value={null} />);

    expect(getByRole('textbox', { name: 'Date' })).toHaveValue('');
    expect(getByRole('textbox', { name: 'Time' })).toHaveValue('');
  });

  it('initializes the fields when the value is set', () => {
    const { getByRole } = render(<TestComponent />);

    expect(getByRole('textbox', { name: 'Date' })).toHaveValue('1/2/2024');
    expect(getByRole('textbox', { name: 'Time' })).toHaveValue('3:04 AM');
  });

  it('changes the date to today when the date is cleared', () => {
    const { getByRole } = render(<TestComponent />);

    userEvent.clear(getByRole('textbox', { name: 'Date' }));
    userEvent.tab();
    expect(onChange).toHaveBeenCalledWith(DateTime.local(2020, 1, 1, 3, 4, 0));
  });

  it('changes the time to midnight when the time is cleared', () => {
    const { getByRole } = render(<TestComponent />);

    userEvent.clear(getByRole('textbox', { name: 'Time' }));
    userEvent.tab();
    expect(onChange).toHaveBeenCalledWith(DateTime.local(2024, 1, 2, 0, 0, 0));
  });

  it('changes the date to null when the date and time are cleared', () => {
    const { getByRole } = render(<TestComponent />);

    userEvent.clear(getByRole('textbox', { name: 'Date' }));
    userEvent.clear(getByRole('textbox', { name: 'Time' }));
    userEvent.tab();
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it('updates the date', () => {
    const { getByRole } = render(<TestComponent />);

    const date = getByRole('textbox', { name: 'Date' });
    userEvent.clear(date);
    userEvent.type(date, '6/7/2023');
    userEvent.tab();
    expect(onChange).toHaveBeenLastCalledWith(
      DateTime.local(2023, 6, 7, 3, 4, 0, { locale: 'en-US' }),
    );
  });

  it('makes the value invalid when the date is invalid', () => {
    const { getByRole } = render(<TestComponent />);

    const date = getByRole('textbox', { name: 'Date' });
    userEvent.clear(date);
    userEvent.type(date, 'a');
    userEvent.tab();
    expect(onChange.mock.lastCall[0].isValid).toBe(false);
  });

  it('updates the time', () => {
    const { getByRole } = render(<TestComponent />);

    const time = getByRole('textbox', { name: 'Time' });
    userEvent.clear(time);
    userEvent.type(time, '06:07 AM');
    userEvent.tab();
    expect(onChange).toHaveBeenLastCalledWith(
      DateTime.local(2024, 1, 2, 6, 7, 0),
    );
  });

  it('makes the value invalid when the time is invalid', () => {
    const { getByRole } = render(<TestComponent />);

    const date = getByRole('textbox', { name: 'Time' });
    userEvent.clear(date);
    userEvent.type(date, 'a');
    userEvent.tab();
    expect(onChange.mock.lastCall[0].isValid).toBe(false);
  });
});
