import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import TestWrapper from '__tests__/util/TestWrapper';
import { useApiConstants } from 'src/components/Constants/UseApiConstants';
import {
  CsvContact,
  CsvImportContext,
  CsvImportType,
  CsvImportViewStepEnum,
} from 'src/components/Tool/Import/Csv/CsvImportContext';
import { CsvImportWrapper } from 'src/components/Tool/Import/Csv/CsvImportWrapper';
import { get } from 'src/components/Tool/Import/Csv/csvImportService';
import { useAccountListId } from 'src/hooks/useAccountListId';
import theme from 'src/theme';

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

describe('CsvImportWrapper', () => {
  beforeEach(() => {
    (useAccountListId as jest.Mock).mockReturnValue(accountListId);
    (useApiConstants as jest.Mock).mockReturnValue(constants);
    (get as jest.Mock).mockReturnValue(Promise.resolve({ id: 'from-get' }));
  });

  describe('render', () => {
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

      const { queryByRole } = renderCsvImportWrapper('Fail');

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
