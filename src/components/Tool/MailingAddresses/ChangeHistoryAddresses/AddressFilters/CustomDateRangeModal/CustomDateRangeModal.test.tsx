import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateTime } from 'luxon';
import matchMediaMock from '__tests__/util/matchMediaMock';
import { UserPreferenceContext } from 'src/components/User/Preferences/UserPreferenceProvider';
import theme from 'src/theme';
import { DateRange } from '../../helpers';
import { CustomDateRangeModal } from './CustomDateRangeModal';

const handleApply = jest.fn();
const handleClose = jest.fn();

const TestComponent: React.FC<{ initialRange?: DateRange | null }> = ({
  initialRange = null,
}) => (
  <ThemeProvider theme={theme}>
    <UserPreferenceContext.Provider value={{ locale: 'en-US' }}>
      <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale="en-US">
        <CustomDateRangeModal
          initialRange={initialRange}
          handleApply={handleApply}
          handleClose={handleClose}
        />
      </LocalizationProvider>
    </UserPreferenceContext.Provider>
  </ThemeProvider>
);

describe('CustomDateRangeModal', () => {
  beforeEach(() => {
    matchMediaMock({ pointer: 'fine' });
  });

  it('disables Apply until a date is entered', () => {
    const { getByRole } = render(<TestComponent />);

    expect(getByRole('button', { name: 'Apply' })).toBeDisabled();

    userEvent.type(getByRole('textbox', { name: 'Start Date' }), '1/15/2026');
    userEvent.tab();

    expect(getByRole('button', { name: 'Apply' })).toBeEnabled();
  });

  it.each([
    ['Start Date', { startDate: '2026-01-15', endDate: null }],
    ['End Date', { startDate: null, endDate: '2026-01-15' }],
  ])('applies a range with only the %s', async (field, expectedRange) => {
    const { getByRole } = render(<TestComponent />);

    userEvent.type(getByRole('textbox', { name: field }), '1/15/2026');
    userEvent.tab();
    userEvent.click(getByRole('button', { name: 'Apply' }));

    await waitFor(() => expect(handleApply).toHaveBeenCalled());
    const [{ startDate, endDate }] = handleApply.mock.calls[0];
    expect({
      startDate: startDate?.toISODate() ?? null,
      endDate: endDate?.toISODate() ?? null,
    }).toEqual(expectedRange);
  });

  it('shows an error instead of applying when the end date is before the start date', async () => {
    const { getByRole, findByText } = render(
      <TestComponent
        initialRange={{
          startDate: DateTime.local(2026, 3, 1),
          endDate: DateTime.local(2026, 1, 1),
        }}
      />,
    );

    userEvent.click(getByRole('button', { name: 'Apply' }));

    expect(
      await findByText('End date cannot be before the start date'),
    ).toBeInTheDocument();
    expect(handleApply).not.toHaveBeenCalled();
  });

  it('shows the applied range when reopened', () => {
    const { getByRole } = render(
      <TestComponent
        initialRange={{
          startDate: DateTime.local(2026, 1, 1),
          endDate: DateTime.local(2026, 3, 1),
        }}
      />,
    );

    expect(getByRole('textbox', { name: 'Start Date' })).toHaveValue(
      '1/1/2026',
    );
    expect(getByRole('textbox', { name: 'End Date' })).toHaveValue('3/1/2026');
  });

  it.each(['Cancel', 'Close'])(
    'closes without applying when %s is clicked',
    (button) => {
      const { getByRole } = render(
        <TestComponent
          initialRange={{
            startDate: DateTime.local(2026, 1, 1),
            endDate: null,
          }}
        />,
      );

      userEvent.click(getByRole('button', { name: button }));

      expect(handleClose).toHaveBeenCalled();
      expect(handleApply).not.toHaveBeenCalled();
    },
  );
});
