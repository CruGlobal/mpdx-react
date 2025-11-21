import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, within } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';
import { MinisterHousingAllowanceProvider } from '../../../MinisterHousingAllowance/Shared/Context/MinisterHousingAllowanceContext';
import { PageEnum } from '../Shared/sharedTypes';
import { Receipt } from './Receipt';

const formTitle = 'Test Title';
const buttonText = 'View Form';
const alertText = 'Override text';
const editLink = '/test/edit-link';
const viewLink = '/test/view-link';

interface TestComponentProps {
  pageType?: PageEnum;
  alertText?: string;
  editLink?: string;
  viewLink?: string;
  isEdit?: boolean;
  availableDate?: string | null;
  deadlineDate?: string | null;
}

const TestComponent: React.FC<TestComponentProps> = ({
  pageType,
  alertText,
  editLink,
  viewLink,
  isEdit,
  availableDate = '2024-06-15',
  deadlineDate = '2024-07-01',
}) => (
  <ThemeProvider theme={theme}>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <TestRouter>
        <MinisterHousingAllowanceProvider type={pageType}>
          <Receipt
            formTitle={formTitle}
            buttonText={buttonText}
            alertText={alertText}
            editLink={editLink}
            viewLink={viewLink}
            isEdit={isEdit}
            availableDate={availableDate}
            deadlineDate={deadlineDate}
          />
        </MinisterHousingAllowanceProvider>
      </TestRouter>
    </LocalizationProvider>
  </ThemeProvider>
);

describe('Receipt', () => {
  it('renders the component in new page', () => {
    const { getByRole } = render(<TestComponent pageType={PageEnum.New} />);

    expect(
      getByRole('heading', {
        name: 'Thank you for Submitting your Test Title!',
      }),
    ).toBeInTheDocument();

    expect(getByRole('alert')).toBeInTheDocument();
    expect(
      within(getByRole('alert')).getByText(
        /you've successfully submitted your test title!/i,
      ),
    ).toBeInTheDocument();

    expect(getByRole('button', { name: /view form/i })).toBeInTheDocument();
  });

  it('renders the component in edit page', () => {
    const { getByRole } = render(
      <TestComponent pageType={PageEnum.Edit} isEdit={true} />,
    );

    expect(
      getByRole('heading', {
        name: 'Thank you for updating your Test Title!',
      }),
    ).toBeInTheDocument();

    expect(getByRole('alert')).toBeInTheDocument();
    expect(
      within(getByRole('alert')).getByText(
        /you've successfully updated your test title!/i,
      ),
    ).toBeInTheDocument();

    expect(getByRole('button', { name: /view form/i })).toBeInTheDocument();
  });

  it('should change text when dates are null', () => {
    const { getByText } = render(
      <TestComponent
        pageType={PageEnum.New}
        availableDate={null}
        deadlineDate={null}
      />,
    );

    expect(
      getByText(
        /we will review your information and you will receive notice for your approval soon./i,
      ),
    ).toBeInTheDocument();
  });

  it('should go to edit link when clicked', () => {
    const { getByRole } = render(
      <TestComponent pageType={PageEnum.New} editLink={editLink} />,
    );

    const editButton = getByRole('link', {
      name: /edit your mha request \(not available after/i,
    });

    expect(editButton).toHaveAttribute(
      'href',
      expect.stringContaining('/test/edit-link'),
    );
  });

  it('should render custom alert text when provided', () => {
    const { getByText } = render(
      <TestComponent pageType={PageEnum.New} alertText={alertText} />,
    );

    expect(getByText(alertText)).toBeInTheDocument();
  });

  it('should not render edit link when not provided', () => {
    const { queryByRole } = render(<TestComponent pageType={PageEnum.New} />);

    const editButton = queryByRole('link', {
      name: /edit your mha request \(not available after/i,
    });

    expect(editButton).not.toBeInTheDocument();
  });

  it('should render edit link when provided', () => {
    const { getByRole } = render(
      <TestComponent pageType={PageEnum.New} editLink={editLink} />,
    );

    const editButton = getByRole('link', {
      name: /edit your mha request \(not available after/i,
    });

    expect(editButton).toBeInTheDocument();
    expect(editButton).toHaveAttribute('href', editLink);
  });

  it('should go to view link when View clicked', () => {
    const { getByRole } = render(<TestComponent viewLink={viewLink} />);

    const viewButton = getByRole('link', { name: /view form/i });

    expect(viewButton).toHaveAttribute(
      'href',
      expect.stringContaining('/test/view-link'),
    );
  });

  it('should go to view link when Print clicked', () => {
    const { getByRole } = render(<TestComponent viewLink={viewLink} />);

    const viewButton = getByRole('link', { name: /print a copy/i });

    expect(viewButton).toHaveAttribute(
      'href',
      expect.stringContaining('/test/view-link'),
    );
  });
});
