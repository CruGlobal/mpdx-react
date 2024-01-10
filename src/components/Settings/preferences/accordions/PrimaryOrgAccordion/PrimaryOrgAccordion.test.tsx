import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { PrimaryOrgAccordion } from './PrimaryOrgAccordion';

jest.mock('next-auth/react');

const accountListId = 'account-list-1';
const router = {
  query: { accountListId },
  isReady: true,
};

const mockEnqueue = jest.fn();
jest.mock('notistack', () => ({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ...jest.requireActual('notistack'),
  useSnackbar: () => {
    return {
      enqueueSnackbar: mockEnqueue,
    };
  },
}));

const handleAccordionChange = jest.fn();
const mutationSpy = jest.fn();

const mockData = {
  userOrganizationAccounts: [
    {
      organization: {
        apiClass: 'OfflineOrg',
        id: '0673b517-4f4d-4c47-965e-0757a198a8a4',
        name: 'Cru - New Staff',
        oauth: false,
      },
      latestDonationDate: null,
      lastDownloadedAt: '2023-12-28T07:00:21-08:00',
      username: null,
      id: '41803e8e-fe6f-4f8e-99cd-e3fb1981d87c',
    },
    {
      organization: {
        apiClass: 'Siebel',
        id: '7ab3ec4b-7108-40bf-a998-ce813d10c821',
        name: 'Cru - United States of America',
        oauth: false,
      },
      latestDonationDate: null,
      lastDownloadedAt: '2023-12-28T07:00:22-08:00',
      username: null,
      id: 'a399a870-b4d8-4fd5-ae6a-7473cd5a9dbe',
    },
  ],
};

interface ComponentsProps {
  salaryOrganizationId: string;
  expandedPanel: string;
}

const Components: React.FC<ComponentsProps> = ({
  salaryOrganizationId,
  expandedPanel,
}) => (
  <SnackbarProvider>
    <TestRouter router={router}>
      <ThemeProvider theme={theme}>
        <GqlMockedProvider onCall={mutationSpy}>
          <PrimaryOrgAccordion
            handleAccordionChange={handleAccordionChange}
            expandedPanel={expandedPanel}
            loading={false}
            salaryOrganizationId={salaryOrganizationId}
            organizations={mockData}
            accountListId={accountListId}
          />
        </GqlMockedProvider>
      </ThemeProvider>
    </TestRouter>
  </SnackbarProvider>
);

const label = 'Primary Organization';
const inputTestId = 'input' + label.replace(/\s/g, '');

describe('PrimaryOrgAccordion', () => {
  it('should render accordion closed', () => {
    const { getByText, queryByTestId } = render(
      <Components
        salaryOrganizationId={'0673b517-4f4d-4c47-965e-0757a198a8a4'}
        expandedPanel=""
      />,
    );

    expect(getByText(label)).toBeInTheDocument();
    expect(queryByTestId(inputTestId)).not.toBeInTheDocument();
  });
  it('should render accordion open and the input should have a value', async () => {
    const { getByText, getByRole, queryByTestId } = render(
      <Components
        salaryOrganizationId={'0673b517-4f4d-4c47-965e-0757a198a8a4'}
        expandedPanel={label}
      />,
    );

    const input = getByRole('combobox');
    const button = getByRole('button', { name: 'Save' });

    expect(getByText('Cru - New Staff')).toBeInTheDocument();
    expect(queryByTestId(inputTestId)).toBeInTheDocument();

    await waitFor(() => {
      expect(input).toHaveValue('Cru - New Staff');
      expect(button).not.toBeDisabled();
    });
  });

  it('should set the save button to disabled when the form is invalid', async () => {
    const value = ''; //value is required

    const { getByRole } = render(
      <Components salaryOrganizationId={value} expandedPanel={label} />,
    );

    const button = getByRole('button', { name: 'Save' });

    await waitFor(() => {
      expect(button).toBeDisabled();
    });
  });

  it('Saves the input', async () => {
    const { getByRole } = render(
      <Components salaryOrganizationId={'123'} expandedPanel={label} />,
    );
    const button = getByRole('button', { name: 'Save' });

    userEvent.click(button);

    await waitFor(() => {
      expect(mutationSpy.mock.lastCall).toMatchObject([
        {
          operation: {
            operationName: 'UpdateAccountPreferences',
            variables: {
              input: {
                id: accountListId,
                attributes: {
                  id: accountListId,
                  salaryOrganizationId: '123',
                },
              },
            },
          },
        },
      ]);
    });
  });
});
