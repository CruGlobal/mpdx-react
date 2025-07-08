import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { GetDesignationAccountsQuery } from 'src/components/EditDonationModal/EditDonationModal.generated';
import theme from '../../theme';
import { DesignationAccountAutoselect } from './DesignationAccountAutoselect';

const accountListId = '111';
const mockOnChange = jest.fn();

describe('DesignationAccountAutoselect', () => {
  it('should select an option', async () => {
    const mutationSpy = jest.fn();
    const { getByRole, findByRole } = render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider<{
            GetDesignationAccounts: GetDesignationAccountsQuery;
          }>
            onCall={mutationSpy}
            mocks={{
              GetDesignationAccounts: {
                designationAccounts: [
                  {
                    designationAccounts: [
                      {
                        id: 'designation-1',
                        name: 'test account',
                        active: true,
                        designationNumber: 'designation-number-1',
                      },
                    ],
                  },
                ],
              },
            }}
          >
            <DesignationAccountAutoselect
              accountListId={accountListId}
              componentType="select"
              onChange={mockOnChange}
            />
          </GqlMockedProvider>
        </ThemeProvider>
      </LocalizationProvider>,
    );

    userEvent.click(getByRole('combobox'));
    userEvent.click(await findByRole('option', { name: 'test account' }));

    const mockValue = mockOnChange.mock.calls[0][0];
    expect(mockValue.target.value).toEqual('designation-1');
  });

  it('should filter matching options', async () => {
    const mutationSpy = jest.fn();
    const { getByRole, findByRole } = render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider<{
            GetDesignationAccounts: GetDesignationAccountsQuery;
          }>
            onCall={mutationSpy}
            mocks={{
              GetDesignationAccounts: {
                designationAccounts: [
                  {
                    designationAccounts: [
                      {
                        id: 'designation-1',
                        name: 'test account',
                        active: true,
                        designationNumber: 'designation-number-1',
                      },
                    ],
                  },
                ],
              },
            }}
          >
            <DesignationAccountAutoselect
              accountListId={accountListId}
              componentType="autocomplete"
              onChange={mockOnChange}
            />
          </GqlMockedProvider>
        </ThemeProvider>
      </LocalizationProvider>,
    );

    userEvent.type(getByRole('combobox'), 'test');
    userEvent.click(
      await findByRole('option', {
        name: 'test account (designation-1)',
      }),
    );

    const mockValue = mockOnChange.mock.calls[0][1];
    expect(mockValue).toBe('designation-1');
  });
});
