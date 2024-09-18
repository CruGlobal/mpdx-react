import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import TestWrapper from '__tests__/util/TestWrapper';
import theme from 'src/theme';
import TntConnectPage from './tnt.page';

const accountListId = 'accountListId';
const router = {
  query: { accountListId },
  isReady: true,
};

const RenderGoogleImportPage = () => (
  <TestWrapper>
    <TestRouter router={router}>
      <ThemeProvider theme={theme}>
        <TntConnectPage />
      </ThemeProvider>
    </TestRouter>
  </TestWrapper>
);
describe('render', () => {
  it('google import page', async () => {
    const { findByText } = render(<RenderGoogleImportPage />);
    const title = await findByText('Import from TntConnect');
    expect(title).toBeInTheDocument();
  });
});
