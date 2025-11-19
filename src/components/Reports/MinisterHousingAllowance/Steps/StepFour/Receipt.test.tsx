import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';
import {
  MinisterHousingAllowanceProvider,
  useMinisterHousingAllowance,
} from '../../Shared/Context/MinisterHousingAllowanceContext';
import { PageEnum } from '../../Shared/sharedTypes';
import { Receipt } from './Receipt';

const setPreviousPage = jest.fn();

interface TestComponentProps {
  availableDate?: string | null;
  deadlineDate?: string | null;
}

const TestComponent: React.FC<TestComponentProps> = ({
  availableDate = '2024-06-15',
  deadlineDate = '2024-07-01',
}) => (
  <ThemeProvider theme={theme}>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <TestRouter>
        <MinisterHousingAllowanceProvider>
          <Receipt availableDate={availableDate} deadlineDate={deadlineDate} />
        </MinisterHousingAllowanceProvider>
      </TestRouter>
    </LocalizationProvider>
  </ThemeProvider>
);

jest.mock('../../Shared/Context/MinisterHousingAllowanceContext', () => ({
  ...jest.requireActual('../../Shared/Context/MinisterHousingAllowanceContext'),
  useMinisterHousingAllowance: jest.fn(),
}));
const useMock = useMinisterHousingAllowance as jest.Mock;

describe('Receipt', () => {
  beforeEach(() => {
    useMock.mockReturnValue({
      pageType: PageEnum.New,
      setPreviousPage,
    });
  });

  it('renders the component in new page', () => {
    const { getByRole } = render(<TestComponent />);

    expect(
      getByRole('heading', {
        name: 'Thank you for Submitting your MHA Request!',
      }),
    ).toBeInTheDocument();

    expect(getByRole('alert')).toBeInTheDocument();
    expect(
      within(getByRole('alert')).getByText(
        /you've successfully submitted your mha request!/i,
      ),
    ).toBeInTheDocument();

    expect(getByRole('link', { name: /view your mha/i })).toBeInTheDocument();
  });

  it('should change text when dates are null', () => {
    const { getByText } = render(
      <TestComponent availableDate={null} deadlineDate={null} />,
    );

    expect(
      getByText(
        /we will review your information and you will receive notice for your approval soon./i,
      ),
    ).toBeInTheDocument();
  });

  it('should go to edit link when clicked', () => {
    const { getByRole } = render(<TestComponent />);

    const editButton = getByRole('link', {
      name: /edit your mha request \(not available after/i,
    });

    expect(editButton).toHaveAttribute(
      'href',
      expect.stringContaining('/reports/housingAllowance/edit'),
    );
  });

  it('should go to view link when View clicked', () => {
    const { getByRole } = render(<TestComponent />);

    const viewButton = getByRole('link', { name: /view your mha/i });

    expect(viewButton).toHaveAttribute(
      'href',
      expect.stringContaining('/reports/housingAllowance/view'),
    );
  });

  it('should go to view link when Print clicked', () => {
    const { getByRole } = render(<TestComponent />);

    const viewButton = getByRole('link', { name: /print a copy/i });

    expect(viewButton).toHaveAttribute(
      'href',
      expect.stringContaining('/reports/housingAllowance/view'),
    );

    userEvent.click(viewButton);
    expect(setPreviousPage).toHaveBeenCalled();
  });

  describe('Edit page type', () => {
    beforeEach(() => {
      useMock.mockReturnValue({
        pageType: PageEnum.Edit,
        setPreviousPage,
      });
    });

    it('renders the component in edit page', () => {
      const { getByRole } = render(<TestComponent />);

      expect(
        getByRole('heading', {
          name: 'Thank you for updating your MHA Request!',
        }),
      ).toBeInTheDocument();

      expect(getByRole('alert')).toBeInTheDocument();
      expect(
        within(getByRole('alert')).getByText(
          /you've successfully updated your mha request!/i,
        ),
      ).toBeInTheDocument();

      expect(getByRole('link', { name: /view your mha/i })).toBeInTheDocument();
    });
  });
});
