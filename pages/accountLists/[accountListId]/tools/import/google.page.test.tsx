import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import TestWrapper from '__tests__/util/TestWrapper';
import { useAccountListId } from 'src/hooks/useAccountListId';
import theme from 'src/theme';
import GoogleImportPage from './google.page';

jest.mock('src/hooks/useAccountListId');
jest.mock('src/components/Constants/UseApiConstants');

const accountListId = 'accountListId';

const RenderGoogleImportPage = () => (
  <TestWrapper>
    <ThemeProvider theme={theme}>
      <GoogleImportPage />
    </ThemeProvider>
  </TestWrapper>
);
describe('render', () => {
  beforeEach(() => {
    (useAccountListId as jest.Mock).mockReturnValue(accountListId);
  });

  it('google import page', async () => {
    const { findByText } = render(<RenderGoogleImportPage />);

    expect(await findByText('Import from Google')).toBeVisible();
  });
});
