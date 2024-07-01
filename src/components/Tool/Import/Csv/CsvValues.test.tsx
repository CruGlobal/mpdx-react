import React from 'react';
import { ThemeProvider } from '@emotion/react';
import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestWrapper from '__tests__/util/TestWrapper';
import { useApiConstants } from 'src/components/Constants/UseApiConstants';
import theme from 'src/theme';
import {
  CsvImportContext,
  CsvImportType,
  CsvImportViewStepEnum,
} from './CsvImportContext';
import CsvValues, { CsvValuesProps } from './CsvValues';
import { save } from './csvImportService';

jest.mock('./csvImportService');
jest.mock('src/components/Constants/UseApiConstants');

let uploadData;
const setUploadData = jest.fn();

let initialData;
const setInitialData = jest.fn();

const setCurrentTab = jest.fn();

const constants = {
  sendAppeals: [
    { id: 'true', value: 'Yes' },
    { id: 'false', value: 'No' },
  ],
  newsletter: [
    {
      id: 'Physical',
      value: 'Physical',
    },
    {
      id: 'Email',
      value: 'Email',
    },
    {
      id: 'Both',
      value: 'Both',
    },
    {
      id: 'None',
      value: 'None',
    },
  ],
  pledgeCurrency: [
    {
      code: 'USD',
      codeSymbolString: 'USD $',
      name: 'USD',
    },
  ],
};

const initializeData = () => {
  uploadData = {
    id: 'csvFileId',
    fileConstants: {
      weird: 'Odd Value',
      foo: 'bar',
    },
    fileConstantsMappings: {
      send_appeals: [
        {
          id: '',
          values: ['Odd Value'],
        },
      ],
      newsletter: [
        {
          id: '',
          values: ['bar'],
        },
      ],
    },
    fileHeaders: {
      first_name: 'first_name',
      last_name: 'last_name',
      full_name: 'full_name',
      weird: 'weird',
      foo: 'foo',
    },
    fileHeadersMappings: {
      first_name: 'first_name',
      last_name: 'last_name',
      full_name: 'full_name',
      weird: 'send_appeals',
      foo: 'newsletter',
    },
    valuesToConstantsMappings: {
      send_appeals: {
        'Odd Value': null,
      },
      newsletter: {
        bar: null,
      },
    },
  } as CsvImportType;
  initialData = JSON.parse(JSON.stringify(uploadData));
};

initializeData();

const CsvValuesMockComponent: React.FC<CsvValuesProps> = ({
  accountListId,
  setCurrentTab,
}) => (
  <TestWrapper>
    <ThemeProvider theme={theme}>
      <CsvImportContext.Provider
        value={{
          uploadData,
          setUploadData,
          initialData,
          setInitialData,
          csvFileId: uploadData?.csvFileId,
        }}
      >
        <CsvValues
          accountListId={accountListId}
          setCurrentTab={setCurrentTab}
        ></CsvValues>
      </CsvImportContext.Provider>
    </ThemeProvider>
  </TestWrapper>
);

beforeEach(() => {
  initializeData();
  (save as jest.Mock).mockReturnValue(
    Promise.resolve({ valuesToConstantsMappings: {} }),
  );
  (useApiConstants as jest.Mock).mockReturnValue(constants);
});

describe('CsvValues', () => {
  describe('render', () => {
    it('should not show if the initial data is not there', async () => {
      initialData = null;
      const { queryByRole } = render(
        <CsvValuesMockComponent
          accountListId="wee"
          setCurrentTab={setCurrentTab}
        ></CsvValuesMockComponent>,
      );
      expect(queryByRole('columnheader')).not.toBeInTheDocument();
    });

    it('should not show if the upload data is not there', async () => {
      uploadData = null;
      const { queryByRole } = render(
        <CsvValuesMockComponent
          accountListId="wee"
          setCurrentTab={setCurrentTab}
        ></CsvValuesMockComponent>,
      );
      expect(queryByRole('columnheader')).not.toBeInTheDocument();
    });

    it('should not show if the accountListId is not there', async () => {
      initialData = null;
      const { queryByRole } = render(
        <CsvValuesMockComponent
          accountListId=""
          setCurrentTab={setCurrentTab}
        ></CsvValuesMockComponent>,
      );
      expect(queryByRole('columnheader')).not.toBeInTheDocument();
    });

    it('should display the values needing to be mapped', async () => {
      const { getByRole } = render(
        <CsvValuesMockComponent
          accountListId="wee"
          setCurrentTab={setCurrentTab}
        ></CsvValuesMockComponent>,
      );
      expect(
        getByRole('columnheader', {
          name: 'weird',
        }),
      ).toBeInTheDocument();
      expect(
        getByRole('columnheader', {
          name: 'foo',
        }),
      ).toBeInTheDocument();
    });

    it('should display the constants options', async () => {
      const { getByRole } = render(
        <CsvValuesMockComponent
          accountListId="wee"
          setCurrentTab={setCurrentTab}
        ></CsvValuesMockComponent>,
      );
      const weirdCell = getByRole('cell', {
        name: /weird send appeals\? odd value/i,
      });
      const weirdSelect = within(weirdCell).getByRole('combobox');
      const fooCell = getByRole('cell', { name: /foo newsletter bar/i });
      const fooSelect = within(fooCell).getByRole('combobox');

      userEvent.click(weirdSelect);
      expect(getByRole('option', { name: /true/i })).toBeInTheDocument();
      expect(getByRole('option', { name: /false/i })).toBeInTheDocument();
      expect(getByRole('option', { name: /none/i })).toBeInTheDocument();

      userEvent.click(fooSelect);
      expect(getByRole('option', { name: /physical/i })).toBeInTheDocument();
      expect(getByRole('option', { name: /email/i })).toBeInTheDocument();
      expect(getByRole('option', { name: /both/i })).toBeInTheDocument();
      expect(getByRole('option', { name: /none/i })).toBeInTheDocument();
    });

    it('should handle pledge currency', async () => {
      initialData.fileHeadersMappings.weird = 'pledge_currency';
      uploadData.valuesToConstantsMappings = {
        pledge_currency: {
          'Odd Value': null,
        },
      };

      const { getByRole } = render(
        <CsvValuesMockComponent
          accountListId="wee"
          setCurrentTab={setCurrentTab}
        ></CsvValuesMockComponent>,
      );
      const weirdCell = getByRole('cell', {
        name: /weird commitment currency odd value/i,
      });
      const weirdSelect = within(weirdCell).getByRole('combobox');
      userEvent.click(weirdSelect);
      expect(getByRole('option', { name: /usd/i })).toBeInTheDocument();
    });
  });

  describe('handleUpdateValues', () => {
    it('should update the valuesToConstantsMappings when selecting an option', async () => {
      const { getByRole } = render(
        <CsvValuesMockComponent
          accountListId="wee"
          setCurrentTab={setCurrentTab}
        ></CsvValuesMockComponent>,
      );
      const weirdCell = getByRole('cell', {
        name: /weird send appeals\? odd value/i,
      });
      const weirdSelect = within(weirdCell).getByRole('combobox');
      userEvent.click(weirdSelect);
      userEvent.click(getByRole('option', { name: /true/i }));

      await waitFor(() => {
        expect(setUploadData).toHaveBeenCalledWith({
          ...uploadData,
          valuesToConstantsMappings: {
            ...uploadData.valuesToConstantsMappings,
            send_appeals: { 'Odd Value': 'true' },
          },
        });
      });
    });

    it('should properly handle multiple values', async () => {
      uploadData.valuesToConstantsMappings.newsletter['baz'] = null;

      const { getByRole } = render(
        <CsvValuesMockComponent
          accountListId="wee"
          setCurrentTab={setCurrentTab}
        ></CsvValuesMockComponent>,
      );
      const fooCell = getByRole('cell', { name: /foo newsletter bar/i });
      const fooSelects = within(fooCell).getAllByRole('combobox');
      userEvent.click(fooSelects[0]);
      userEvent.click(getByRole('option', { name: /both/i }));

      await waitFor(() => {
        expect(setUploadData).toHaveBeenCalledWith({
          ...uploadData,
          valuesToConstantsMappings: {
            ...uploadData.valuesToConstantsMappings,
            newsletter: { bar: 'Both', baz: null },
          },
        });
      });
    });
  });

  describe('fileHeader', () => {
    it('should return the proper header from the mappings', async () => {
      const { getByRole } = render(
        <CsvValuesMockComponent
          accountListId="wee"
          setCurrentTab={setCurrentTab}
        ></CsvValuesMockComponent>,
      );
      expect(getByRole('columnheader', { name: /weird/i })).toBeInTheDocument();
      expect(getByRole('columnheader', { name: /foo/i })).toBeInTheDocument();
    });
  });

  describe('handleBack', () => {
    it('should send the user back to the headers tab', async () => {
      const { getByRole } = render(
        <CsvValuesMockComponent
          accountListId="wee"
          setCurrentTab={setCurrentTab}
        ></CsvValuesMockComponent>,
      );
      userEvent.click(getByRole('button', { name: /back/i }));
      expect(setCurrentTab).toHaveBeenCalledWith(CsvImportViewStepEnum.Headers);
    });
  });

  describe('handleSave', () => {
    it('should save the data', async () => {
      const { getByRole } = render(
        <CsvValuesMockComponent
          accountListId="wee"
          setCurrentTab={setCurrentTab}
        ></CsvValuesMockComponent>,
      );
      userEvent.click(getByRole('button', { name: /next/i }));
      await waitFor(() => {
        expect(save).toHaveBeenCalledWith(
          expect.objectContaining({
            uploadData,
            constants,
            accountListId: 'wee',
            setUploadData,
          }),
        );
      });
    });

    it('should send the user to the preview tab', async () => {
      const { getByRole } = render(
        <CsvValuesMockComponent
          accountListId="wee"
          setCurrentTab={setCurrentTab}
        ></CsvValuesMockComponent>,
      );
      userEvent.click(getByRole('button', { name: /next/i }));
      await waitFor(() => {
        expect(setCurrentTab).toHaveBeenCalledWith(
          CsvImportViewStepEnum.Preview,
        );
      });
    });
  });
});
