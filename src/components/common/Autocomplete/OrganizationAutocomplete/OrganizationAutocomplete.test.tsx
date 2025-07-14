import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import theme from '../../../../theme';
import { OrganizationAutocomplete } from './OrganizationAutocomplete';

const organizations = [
  {
    id: '12345',
    name: 'Agape Bulgaria',
  },
  {
    id: '67890',
    name: 'Testalapogus',
  },
  {
    id: '24580',
    name: 'Testington',
  },
];

const setSelectedOrganization = jest.fn();

describe('OrganizationAutocomplete', () => {
  it('shows the selected organization', () => {
    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <OrganizationAutocomplete
          organizations={organizations}
          value={organizations[0]}
          onChange={(_, organization): void => {
            setSelectedOrganization(organization);
          }}
        />
      </ThemeProvider>,
    );

    expect(getByRole('combobox')).toHaveValue('Agape Bulgaria');
  });

  it('changes the selected organization', () => {
    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <OrganizationAutocomplete
          organizations={organizations}
          value={organizations[1]}
          onChange={(_, organization): void => {
            setSelectedOrganization(organization);
          }}
        />
      </ThemeProvider>,
    );

    expect(getByRole('combobox')).toHaveValue('Testalapogus');
    userEvent.type(getByRole('combobox'), 'Agape Bulg');
    userEvent.click(getByRole('option', { name: 'Agape Bulgaria' }));
    expect(setSelectedOrganization).toHaveBeenCalled();
    expect(getByRole('combobox')).toHaveValue('Agape Bulgaria');
  });

  it('filters organizations based on input', async () => {
    const { getByRole, findByRole, findAllByRole, queryByRole } = render(
      <ThemeProvider theme={theme}>
        <OrganizationAutocomplete
          organizations={organizations}
          value={null}
          onChange={setSelectedOrganization}
        />
      </ThemeProvider>,
    );

    const combobox = getByRole('combobox');
    userEvent.type(combobox, 'Testing');
    expect(await findAllByRole('option')).toHaveLength(1);
    expect(
      await findByRole('option', { name: 'Testington' }),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(
        queryByRole('option', { name: 'Agape Bulgaria' }),
      ).not.toBeInTheDocument();
    });
  });

  it('passes the correct props to mui autocomplete', () => {
    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <OrganizationAutocomplete
          style={{
            width: '250px',
          }}
          autoSelect
          autoHighlight
          organizations={organizations}
          value={organizations[2]}
          onChange={(_, organization): void => {
            setSelectedOrganization(organization);
          }}
        />
      </ThemeProvider>,
    );

    const combobox = getByRole('combobox');
    const autocompleteRoot = combobox.closest('div[style]');
    expect(autocompleteRoot).toHaveStyle('width: 250px');
    expect(getByRole('combobox')).toHaveValue('Testington');
    userEvent.type(getByRole('combobox'), 'Agape Bulgar');
    expect(getByRole('option', { name: 'Agape Bulgaria' })).toHaveStyle(
      'background-color: rgba(0, 0, 0, 0.04);',
    );
  });
});
