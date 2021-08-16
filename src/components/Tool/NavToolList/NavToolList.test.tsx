import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@material-ui/core';
import TestRouter from '../../../../__tests__/util/TestRouter';
import theme from '../../../theme';
import NavToolList from './NavToolList';

const accountListId = 'account-list-1';

const router = {
  query: { accountListId },
  isReady: true,
};

describe('NavToolList', () => {
  it('default', async () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <TestRouter router={router}>
          <NavToolList />
        </TestRouter>
      </ThemeProvider>,
    );

    expect(getByText('Appeals')).toBeInTheDocument();
    expect(getByText('Appeal')).toBeInTheDocument();
    expect(getByText('Contacts')).toBeInTheDocument();
    expect(getByText('Fix Commitment Info')).toBeInTheDocument();
    expect(getByText('Fix Mailing Addresses')).toBeInTheDocument();
    expect(getByText('Fix Send Newsletter')).toBeInTheDocument();
    expect(getByText('Merge Contacts')).toBeInTheDocument();
    expect(getByText('People')).toBeInTheDocument();
    expect(getByText('Fix Email Addresses')).toBeInTheDocument();
    expect(getByText('Fix Phone Numbers')).toBeInTheDocument();
    expect(getByText('Merge People')).toBeInTheDocument();
    expect(getByText('Imports')).toBeInTheDocument();
    expect(getByText('Import from Google')).toBeInTheDocument();
    expect(getByText('Import from TntConnect')).toBeInTheDocument();
    expect(getByText('Import from CSV')).toBeInTheDocument();
  });
});
