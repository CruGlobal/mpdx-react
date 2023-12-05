import React from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import theme from 'src/theme';
import { getTopBarMultipleMock } from '../../TopBar/TopBar.mock';
import { NavTools } from './NavTools';

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
