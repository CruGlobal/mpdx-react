import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { MockedProvider } from '@apollo/client/testing';
import { getTopBarMultipleMock } from '../../TopBar/TopBar.mock';
import { NavTools } from './NavTools';
import theme from 'src/theme';

jest.mock('next/router', () => ({
  useRouter: () => {
    return {
      query: { accountListId: 'abc' },
      isReady: true,
    };
  },
}));

const mocks = [getTopBarMultipleMock()];

describe('AddMenuPanel', () => {
  it('default', async () => {
    const { getByTestId } = render(
      <ThemeProvider theme={theme}>
        <MockedProvider mocks={mocks} addTypename={false}>
          <NavTools />
        </MockedProvider>
      </ThemeProvider>,
    );

    expect(getByTestId('NavTools')).toBeInTheDocument();
  });
});
