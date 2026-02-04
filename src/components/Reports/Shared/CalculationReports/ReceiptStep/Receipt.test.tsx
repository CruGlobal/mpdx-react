import React, { Dispatch, SetStateAction } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { MinisterHousingAllowanceProvider } from '../../../MinisterHousingAllowance/Shared/Context/MinisterHousingAllowanceContext';
import { PageEnum } from '../Shared/sharedTypes';
import { Receipt } from './Receipt';

const formTitle = 'Test Title';
const buttonText = 'View Dashboard';
const alertText = 'Override text';
const linkOneText = 'Edit your MHA Request';
const editLink = '/test/edit-link';
const viewLink = '/test/view-link';
const buttonLink = '/test/button-link';

const setIsComplete = jest.fn();

interface TestComponentProps {
  pageType?: PageEnum;
  alertText?: string;
  linkOne?: string;
  linkOneText?: string;
  viewLink?: string;
  isEdit?: boolean;
  availableDate?: string | null;
  setIsComplete?: Dispatch<SetStateAction<boolean>>;
}

const TestComponent: React.FC<TestComponentProps> = ({
  pageType,
  alertText,
  linkOne,
  linkOneText,
  viewLink,
  isEdit,
  availableDate = '2024-06-15',
  setIsComplete,
}) => (
  <ThemeProvider theme={theme}>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <TestRouter>
        <SnackbarProvider>
          <GqlMockedProvider>
            <MinisterHousingAllowanceProvider type={pageType}>
              <Receipt
                formTitle={formTitle}
                buttonText={buttonText}
                alertText={alertText}
                linkOne={linkOne}
                linkOneText={linkOneText}
                viewLink={viewLink}
                buttonLink={buttonLink}
                isEdit={isEdit}
                availableDate={availableDate}
                setIsComplete={setIsComplete}
              />
            </MinisterHousingAllowanceProvider>
          </GqlMockedProvider>
        </SnackbarProvider>
      </TestRouter>
    </LocalizationProvider>
  </ThemeProvider>
);

describe('Receipt', () => {
  it('renders the component in new page', async () => {
    const { getByRole, findByRole } = render(
      <TestComponent pageType={PageEnum.New} />,
    );

    expect(
      await findByRole('heading', {
        name: 'Thank you for Submitting your Test Title!',
      }),
    ).toBeInTheDocument();

    expect(getByRole('alert')).toBeInTheDocument();
    expect(
      within(getByRole('alert')).getByText(
        /you've successfully submitted your test title!/i,
      ),
    ).toBeInTheDocument();

    expect(getByRole('link', { name: /view dashboard/i })).toBeInTheDocument();
  });

  it('renders the component in edit page', async () => {
    const { getByRole, findByRole } = render(
      <TestComponent pageType={PageEnum.Edit} isEdit={true} />,
    );

    expect(
      await findByRole('heading', {
        name: 'Thank you for updating your Test Title!',
      }),
    ).toBeInTheDocument();

    expect(getByRole('alert')).toBeInTheDocument();
    expect(
      within(getByRole('alert')).getByText(
        /you've successfully updated your test title!/i,
      ),
    ).toBeInTheDocument();

    expect(getByRole('link', { name: /view dashboard/i })).toBeInTheDocument();
  });

  it('should change text when dates are null', async () => {
    const { findByText } = render(
      <TestComponent pageType={PageEnum.New} availableDate={null} />,
    );

    expect(
      await findByText(
        /we will review your information and you will receive notice for your approval soon./i,
      ),
    ).toBeInTheDocument();
  });

  it('should go to edit link when clicked', async () => {
    const { findByRole } = render(
      <TestComponent
        pageType={PageEnum.New}
        linkOne={editLink}
        linkOneText={linkOneText}
      />,
    );

    const editButton = await findByRole('link', {
      name: /edit your mha request/i,
    });

    expect(editButton).toHaveAttribute(
      'href',
      expect.stringContaining('/test/edit-link'),
    );
  });

  it('should render custom alert text when provided', async () => {
    const { findByText } = render(
      <TestComponent pageType={PageEnum.New} alertText={alertText} />,
    );

    expect(await findByText(alertText)).toBeInTheDocument();
  });

  it('should not render edit link when not provided', () => {
    const { queryByRole } = render(<TestComponent pageType={PageEnum.New} />);

    const editButton = queryByRole('link', {
      name: /edit your mha request/i,
    });

    expect(editButton).not.toBeInTheDocument();
  });

  it('should render edit link when provided', async () => {
    const { findByRole } = render(
      <TestComponent
        pageType={PageEnum.New}
        linkOne={editLink}
        linkOneText={linkOneText}
      />,
    );

    const editButton = await findByRole('link', {
      name: /edit your mha request/i,
    });

    expect(editButton).toBeInTheDocument();
    expect(editButton).toHaveAttribute('href', editLink);
  });

  it('should go to button link when Button clicked', async () => {
    const { findByRole } = render(<TestComponent />);

    const button = await findByRole('link', {
      name: /view dashboard/i,
    });

    expect(button).toHaveAttribute(
      'href',
      expect.stringContaining('/test/button-link'),
    );

    await userEvent.click(button);
  });

  it('should go to view link when view/print clicked', async () => {
    const { findByText } = render(
      <TestComponent viewLink={viewLink} setIsComplete={setIsComplete} />,
    );

    const printLink = await findByText(/view or print a copy/i);

    await userEvent.click(printLink);
    expect(setIsComplete).toHaveBeenCalledWith(true);
  });
});
