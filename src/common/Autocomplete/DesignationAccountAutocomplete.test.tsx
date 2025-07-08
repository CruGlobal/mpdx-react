import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { GetDesignationAccountsQuery } from 'src/components/EditDonationModal/EditDonationModal.generated';
import theme from '../../theme';
import { DesignationAccountAutocomplete } from './DesignationAccountAutocomplete';

const accountListId = '111';
const mockOnChange = jest.fn();

describe('DesignationAccountAutocomplete', () => {
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
            <DesignationAccountAutocomplete
              accountListId={accountListId}
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

    const mockValue = mockOnChange.mock.lastCall[1];
    expect(mockValue).toBe('designation-1');
  });
});
