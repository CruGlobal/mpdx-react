import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from '../../../../theme';
import { AccountListAutocomplete } from './AccountListAutocomplete';

const setFieldValue = jest.fn();

describe('AccountListAutocomplete', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('changes the selected account', async () => {
    const { getByRole, findByRole } = render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <GqlMockedProvider
          mocks={{
            AccountListOptions: {
              accountLists: {
                nodes: [
                  {
                    id: 'account-1',
                    name: 'John Doe Ministry Account',
                  },
                  {
                    id: 'account-2',
                    name: 'Jane Smith Support Account',
                  },
                  {
                    id: 'account-3',
                    name: 'Global Missions Fund',
                  },
                  {
                    id: 'account-4',
                    name: 'Local Church Partnership',
                  },
                  {
                    id: 'account-5',
                    name: 'Student Ministry Account',
                  },
                ],
              },
            },
          }}
        >
          <ThemeProvider theme={theme}>
            <AccountListAutocomplete
              value="account-1"
              onChange={(_, value) => {
                setFieldValue(value);
              }}
            />
          </ThemeProvider>
        </GqlMockedProvider>
      </LocalizationProvider>,
    );

    userEvent.click(getByRole('combobox'));
    userEvent.click(
      await findByRole('option', {
        name: 'Jane Smith Support Account',
      }),
    );
    expect(setFieldValue).toHaveBeenCalledWith('account-2');
  });

  it('filters accounts based on input', async () => {
    const { getByRole, findByRole, findAllByRole, queryByRole } = render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <GqlMockedProvider
          mocks={{
            AccountListOptions: {
              accountLists: {
                nodes: [
                  {
                    id: 'account-1',
                    name: 'John Doe Ministry Account',
                  },
                  {
                    id: 'account-2',
                    name: 'Jane Smith Support Account',
                  },
                  {
                    id: 'account-3',
                    name: 'Global Missions Fund',
                  },
                  {
                    id: 'account-4',
                    name: 'Local Church Partnership',
                  },
                  {
                    id: 'account-5',
                    name: 'Student Ministry Account',
                  },
                ],
              },
            },
          }}
        >
          <ThemeProvider theme={theme}>
            <AccountListAutocomplete value={null} onChange={setFieldValue} />
          </ThemeProvider>
        </GqlMockedProvider>
      </LocalizationProvider>,
    );

    const combobox = getByRole('combobox');
    userEvent.type(combobox, 'Ministry');

    await waitFor(async () => {
      const options = await findAllByRole('option');
      expect(options).toHaveLength(2); // "John Doe Ministry Account" and "Student Ministry Account"
    });

    expect(
      await findByRole('option', { name: 'John Doe Ministry Account' }),
    ).toBeInTheDocument();

    expect(
      await findByRole('option', { name: 'Student Ministry Account' }),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(
        queryByRole('option', { name: 'Global Missions Fund' }),
      ).not.toBeInTheDocument();
    });
  });

  it('handles empty account list', () => {
    const { getByRole } = render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <GqlMockedProvider
          mocks={{
            AccountListOptions: {
              accountLists: {
                nodes: [],
              },
            },
          }}
        >
          <ThemeProvider theme={theme}>
            <AccountListAutocomplete value={null} onChange={setFieldValue} />
          </ThemeProvider>
        </GqlMockedProvider>
      </LocalizationProvider>,
    );

    expect(getByRole('combobox')).toHaveValue('');
  });

  it('handles invalid account ID', () => {
    const { getByRole } = render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <GqlMockedProvider
          mocks={{
            AccountListOptions: {
              accountLists: {
                nodes: [
                  {
                    id: 'account-1',
                    name: 'John Doe Ministry Account',
                  },
                  {
                    id: 'account-2',
                    name: 'Jane Smith Support Account',
                  },
                  {
                    id: 'account-3',
                    name: 'Global Missions Fund',
                  },
                  {
                    id: 'account-4',
                    name: 'Local Church Partnership',
                  },
                  {
                    id: 'account-5',
                    name: 'Student Ministry Account',
                  },
                ],
              },
            },
          }}
        >
          <ThemeProvider theme={theme}>
            <AccountListAutocomplete
              value="invalid-id"
              onChange={setFieldValue}
            />
          </ThemeProvider>
        </GqlMockedProvider>
      </LocalizationProvider>,
    );

    expect(getByRole('combobox')).toHaveValue('');
  });
});
