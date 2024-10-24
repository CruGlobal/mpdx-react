import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import TestWrapper from '__tests__/util/TestWrapper';
import { CsvImportViewStepEnum } from 'src/components/Tool/Import/Csv/CsvImportContext';
import { get } from 'src/components/Tool/Import/Csv/csvImportService';
import { useAccountListId } from 'src/hooks/useAccountListId';
import theme from 'src/theme';
import CsvHome from './csv.page';

jest.mock('src/hooks/useAccountListId');
jest.mock('src/components/Tool/Import/Csv/csvImportService');

const accountListId = 'accountListId';
const csvFileId = 'csvFileId';

const buildRouter = (tab) => {
  return {
    isReady: true,
    query: {
      tab: tab,
      id: csvFileId,
    },
    replace: jest.fn(),
  };
};

const renderCsvHome = (router) =>
  render(
    <TestWrapper>
      <ThemeProvider theme={theme}>
        <TestRouter router={router}>
          <CsvHome />
        </TestRouter>
      </ThemeProvider>
    </TestWrapper>,
  );

describe('CSV wrapper page', () => {
  beforeEach(() => {
    (useAccountListId as jest.Mock).mockReturnValue(accountListId);
    (get as jest.Mock).mockReturnValue(Promise.resolve({ id: 'from-get' }));
  });

  describe('render', () => {
    it('should show the upload tab if none specified in the URL', async () => {
      const router = {
        isReady: true,
        query: {},
      };

      const { findByTestId } = renderCsvHome(router);

      expect(await findByTestId('MaxFileSize')).toBeVisible();
    });

    it('should show the upload tab if specified in the URL', async () => {
      const router = buildRouter(CsvImportViewStepEnum.Upload);
      const { findByTestId } = renderCsvHome(router);

      expect(await findByTestId('MaxFileSize')).toBeVisible();
    });

    it('should show the headers tab if specified in the URL', async () => {
      const router = buildRouter(CsvImportViewStepEnum.Headers);
      renderCsvHome(router);

      await waitFor(() => {
        expect(router.replace).toHaveBeenCalledWith(
          expect.objectContaining({
            query: {
              accountListId,
              tab: CsvImportViewStepEnum.Headers,
              ...{ id: csvFileId },
            },
          }),
        );
      });
    });

    it('should show the values tab if specified in the URL', async () => {
      const router = buildRouter(CsvImportViewStepEnum.Values);
      renderCsvHome(router);

      await waitFor(() => {
        expect(router.replace).toHaveBeenCalledWith(
          expect.objectContaining({
            query: {
              accountListId,
              tab: CsvImportViewStepEnum.Values,
              ...{ id: csvFileId },
            },
          }),
        );
      });
    });

    it('should show the preview tab if specified in the URL', async () => {
      const router = buildRouter(CsvImportViewStepEnum.Preview);
      renderCsvHome(router);

      await waitFor(() => {
        expect(router.replace).toHaveBeenCalledWith(
          expect.objectContaining({
            query: {
              accountListId,
              tab: CsvImportViewStepEnum.Preview,
              ...{ id: csvFileId },
            },
          }),
        );
      });
    });
  });
});
