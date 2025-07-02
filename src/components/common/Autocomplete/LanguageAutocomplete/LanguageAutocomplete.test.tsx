import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageAutocomplete } from './LanguageAutocomplete';

const setSelectedLanguage = jest.fn();

describe('LanguageAutocomplete', () => {
  it('shows the selected language', () => {
    const { getByRole } = render(
      <LanguageAutocomplete
        value={'en-us'}
        onChange={(_, currency): void => {
          setSelectedLanguage(currency);
        }}
      />,
    );
    expect(getByRole('combobox')).toHaveValue('American English');
  });

  it('changes the selected language', async () => {
    const { getByRole, findByRole } = render(
      <LanguageAutocomplete
        value={'en-us'}
        onChange={(_, currency): void => {
          setSelectedLanguage(currency);
        }}
      />,
    );

    expect(getByRole('combobox')).toHaveValue('American English');
    userEvent.type(getByRole('combobox'), 'dut');
    userEvent.click(
      await findByRole('option', {
        name: 'Dutch (Nederlands)',
      }),
    );
    expect(setSelectedLanguage).toHaveBeenCalledWith('nl-nl');
    expect(getByRole('combobox')).toHaveValue('Dutch (Nederlands)');
  });

  it('filters language based on input', async () => {
    const { getByRole, findByRole, findAllByRole, queryByRole } = render(
      <LanguageAutocomplete value={'en-us'} onChange={setSelectedLanguage} />,
    );

    const combobox = getByRole('combobox');
    userEvent.type(combobox, 'ger');
    expect(await findAllByRole('option')).toHaveLength(2);
    expect(
      await findByRole('option', { name: 'German (Deutsch)' }),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(
        queryByRole('option', { name: 'American English' }),
      ).not.toBeInTheDocument();
    });
  });
});
