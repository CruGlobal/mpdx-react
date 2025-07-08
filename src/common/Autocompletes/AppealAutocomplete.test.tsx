import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { GetAppealsForMassActionQuery } from 'src/components/Contacts/MassActions/AddToAppeal/GetAppealsForMassAction.generated';
import theme from '../../theme';
import { AppealAutocomplete } from './AppealAutocomplete';

const mockOnChange = jest.fn();
const accountListId = '111';
const id = '';
const value = '';

describe('AppealAutocomplete', () => {
  it('should allow search and find matching options', async () => {
    const mutationSpy = jest.fn();
    const { getByRole, findByRole } = render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider<{
            GetAppealsForMassAction: GetAppealsForMassActionQuery;
          }>
            onCall={mutationSpy}
            mocks={{
              GetAppealsForMassAction: {
                appeals: {
                  nodes: [
                    {
                      id: 'appeal-1',
                      name: 'Test appeal',
                      contactIds: ['contactIdOne', 'contactIdTwo'],
                    },
                  ],
                  pageInfo: {
                    hasNextPage: false,
                  },
                },
              },
            }}
          >
            <AppealAutocomplete
              onChange={mockOnChange}
              id={id}
              value={value}
              accountListId={accountListId}
              data-testid="appealTextInput"
            />
          </GqlMockedProvider>
        </ThemeProvider>
      </LocalizationProvider>,
    );

    userEvent.type(getByRole('combobox'), 'Test');
    userEvent.click(await findByRole('option', { name: 'Test appeal' }));

    const mockValue = mockOnChange.mock.lastCall[1];
    expect(mockValue).toBe('appeal-1');
  });
});
