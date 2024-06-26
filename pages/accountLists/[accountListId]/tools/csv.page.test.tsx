import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import TestWrapper from '__tests__/util/TestWrapper';
import { useApiConstants } from 'src/components/Constants/UseApiConstants';
import {
  CsvContact,
  CsvImportContext,
  CsvImportType,
  CsvImportViewStepEnum,
} from 'src/components/Tool/Import/Csv/CsvImportContext';
import { get } from 'src/components/Tool/Import/Csv/csvImportService';
import { useAccountListId } from 'src/hooks/useAccountListId';
import theme from 'src/theme';
import CsvHome, { CsvImportWrapper } from './csv.page';

jest.mock('src/hooks/useAccountListId');
jest.mock('src/components/Constants/UseApiConstants');
jest.mock('src/components/Tool/Import/Csv/csvImportService');

const accountListId = 'accountListId';
const csvFileId = 'csvFileId';

const constants = {
  sendAppeals: [
    { id: true, value: 'Yes' },
    { id: false, value: 'No' },
  ],
};

let uploadData = {
  id: csvFileId,
  fileHeadersMappings: {},
  fileHeaders: { test: 'test' },
} as CsvImportType;
const setUploadData = jest.fn().mockImplementation((data) => {
  uploadData = data;
});
let initialData = {
  id: csvFileId,
} as CsvImportType;
const setInitialData = jest.fn();
const t = (message: string) => message;

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
    (useApiConstants as jest.Mock).mockReturnValue(constants);
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

    it('should show the upload tab if specified', async () => {
      const { findByRole } = renderCsvImportWrapper(
        CsvImportViewStepEnum.Upload,
      );

      expect(
        await findByRole('button', { name: 'Select CSV file' }),
      ).toBeVisible();
    });

    it('should show the headers tab if specified', async () => {
      const { findByRole } = renderCsvImportWrapper(
        CsvImportViewStepEnum.Headers,
      );

      expect(
        await findByRole('columnheader', { name: 'Your CSV Header' }),
      ).toBeVisible();
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

    it('should show the values tab if specified', async () => {
      uploadData.valuesToConstantsMappings = {
        test: 'wee',
      };
      initialData = { ...uploadData };
      const { findByRole } = renderCsvImportWrapper(
        CsvImportViewStepEnum.Values,
      );

      expect(
        await findByRole('columnheader', { name: 'Your CSV value' }),
      ).toBeVisible();
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

    it('should show the preview tab if specified', async () => {
      uploadData.sampleContacts = [{} as CsvContact];
      const { findByRole } = renderCsvImportWrapper(
        CsvImportViewStepEnum.Preview,
      );

      expect(
        await findByRole('columnheader', { name: 'Contact Name' }),
      ).toBeVisible();
    });

    it('should show none of the tab bodies if a bad value is specified', async () => {
      uploadData.valuesToConstantsMappings = {
        test: 'wee',
      };
      uploadData.sampleContacts = [{} as CsvContact];
      initialData = { ...uploadData };

      const { queryByRole, findByText } = renderCsvImportWrapper('Fail');

      expect(await findByText('Import from CSV')).toBeVisible();
      expect(
        await queryByRole('columnheader', { name: 'Your CSV Header' }),
      ).not.toBeInTheDocument();
      expect(
        await queryByRole('columnheader', { name: 'Your CSV value' }),
      ).not.toBeInTheDocument();
      expect(
        await queryByRole('columnheader', { name: 'Contact Name' }),
      ).not.toBeInTheDocument();
    });

    const renderCsvImportWrapper = (currentTab) => {
      return render(
        <TestWrapper>
          <ThemeProvider theme={theme}>
            <CsvImportContext.Provider
              value={{
                uploadData,
                setUploadData,
                initialData,
                setInitialData,
                csvFileId,
              }}
            >
              <CsvImportWrapper
                accountListId={accountListId}
                currentTab={currentTab}
                setCurrentTab={jest.fn()}
                setCsvFileId={jest.fn()}
                t={t}
              ></CsvImportWrapper>
            </CsvImportContext.Provider>
          </ThemeProvider>
        </TestWrapper>,
      );
    };
  });
});
