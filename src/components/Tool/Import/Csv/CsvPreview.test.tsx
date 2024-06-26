import React from 'react';
import { ThemeProvider } from '@emotion/react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestWrapper from '__tests__/util/TestWrapper';
import { useApiConstants } from 'src/components/Constants/UseApiConstants';
import theme from 'src/theme';
import {
  CsvImportContext,
  CsvImportType,
  CsvImportViewStepEnum,
} from './CsvImportContext';
import CsvPreview, { CsvPreviewProps } from './CsvPreview';
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
  pledgeFrequency: [
    { id: 'WEEKLY', key: '0.23076923076923', value: 'Weekly' },
    { id: 'MONTHLY', key: '1.0', value: 'Monthly' },
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
          id: 'PHYSICAL',
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
    sampleContacts: [
      {
        envelopeGreeting: 'Test Name',
        greeting: 'Test',
        name: 'Name, Test',
        sendNewsletter: 'PHYSICAL',
      },
    ],
    tagList: [] as string[],
  } as CsvImportType;
  initialData = JSON.parse(JSON.stringify(uploadData));
};

initializeData();

const CsvPreviewMockComponent: React.FC<CsvPreviewProps> = ({
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
        <CsvPreview
          accountListId={accountListId}
          setCurrentTab={setCurrentTab}
        ></CsvPreview>
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

describe('CsvPreview', () => {
  describe('render', () => {
    it('should not show if the upload data is not there', async () => {
      uploadData = null;
      const { queryByRole } = render(
        <CsvPreviewMockComponent
          accountListId="wee"
          setCurrentTab={setCurrentTab}
        ></CsvPreviewMockComponent>,
      );
      expect(queryByRole('columnheader')).not.toBeInTheDocument();
    });

    it('should render data from the CSV file', async () => {
      const { getByRole } = render(
        <CsvPreviewMockComponent
          accountListId="wee"
          setCurrentTab={setCurrentTab}
        ></CsvPreviewMockComponent>,
      );
      expect(getByRole('cell', { name: 'Name, Test' })).toBeInTheDocument();
      expect(getByRole('cell', { name: 'Test Name' })).toBeInTheDocument();
      expect(getByRole('cell', { name: 'Test' })).toBeInTheDocument();
    });

    it('should render a constant value', async () => {
      const { getByRole } = render(
        <CsvPreviewMockComponent
          accountListId="wee"
          setCurrentTab={setCurrentTab}
        ></CsvPreviewMockComponent>,
      );
      expect(getByRole('cell', { name: /physical/i })).toBeInTheDocument();
    });

    it('should handle finding a weekly pledge frequency', async () => {
      uploadData.fileConstantsMappings.pledge_frequency = [
        {
          id: 'Weekly',
          values: ['baz'],
        },
      ];
      uploadData.sampleContacts[0].pledgeFrequency = '0.23076923076923';
      const { getByRole } = render(
        <CsvPreviewMockComponent
          accountListId="wee"
          setCurrentTab={setCurrentTab}
        ></CsvPreviewMockComponent>,
      );
      expect(getByRole('cell', { name: /weekly/i })).toBeInTheDocument();
    });

    it('should handle finding a monthly pledge frequency', async () => {
      uploadData.fileConstantsMappings.pledge_frequency = [
        {
          id: 'Monthly',
          values: ['baz'],
        },
      ];
      uploadData.sampleContacts[0].pledgeFrequency = '1';
      const { getByRole } = render(
        <CsvPreviewMockComponent
          accountListId="wee"
          setCurrentTab={setCurrentTab}
        ></CsvPreviewMockComponent>,
      );
      expect(getByRole('cell', { name: /monthly/i })).toBeInTheDocument();
    });

    it('should handle null tag list', async () => {
      uploadData.tagList = null;
      const { getByRole } = render(
        <CsvPreviewMockComponent
          accountListId="wee"
          setCurrentTab={setCurrentTab}
        ></CsvPreviewMockComponent>,
      );
      expect(getByRole('combobox')).toBeVisible();
    });

    it('should handle no tags', async () => {
      const { getByRole } = render(
        <CsvPreviewMockComponent
          accountListId="wee"
          setCurrentTab={setCurrentTab}
        ></CsvPreviewMockComponent>,
      );
      expect(getByRole('combobox')).toBeVisible();
    });

    it('should handle a single tag', async () => {
      uploadData.tagList = 'tag1';
      const { getByRole, getByText } = render(
        <CsvPreviewMockComponent
          accountListId="wee"
          setCurrentTab={setCurrentTab}
        ></CsvPreviewMockComponent>,
      );
      expect(getByRole('combobox')).toBeVisible();
      expect(getByText('tag1')).toBeInTheDocument();
    });

    it('should handle multiple tags', async () => {
      uploadData.tagList = ['tag1', 'tag2', 'tag3'];
      const { getByRole, getByText } = render(
        <CsvPreviewMockComponent
          accountListId="wee"
          setCurrentTab={setCurrentTab}
        ></CsvPreviewMockComponent>,
      );
      expect(getByRole('combobox')).toBeVisible();
      expect(getByText('tag1')).toBeInTheDocument();
      expect(getByText('tag2')).toBeInTheDocument();
      expect(getByText('tag3')).toBeInTheDocument();
    });

    it('should add a tag', async () => {
      const { getByRole } = render(
        <CsvPreviewMockComponent
          accountListId="wee"
          setCurrentTab={setCurrentTab}
        ></CsvPreviewMockComponent>,
      );
      const newTag = 'typedtag';
      const tagBox = getByRole('combobox');
      userEvent.click(tagBox);
      userEvent.type(tagBox, newTag);
      userEvent.tab();
      await waitFor(() => {
        expect(setUploadData).toHaveBeenCalledWith({
          ...uploadData,
          tagList: [newTag],
        });
      });
    });
  });

  describe('handleBack()', () => {
    it('should go back to the values page', async () => {
      const { getByRole } = render(
        <CsvPreviewMockComponent
          accountListId="wee"
          setCurrentTab={setCurrentTab}
        ></CsvPreviewMockComponent>,
      );
      userEvent.click(getByRole('button', { name: 'Back' }));
      await waitFor(() => {
        expect(setCurrentTab).toHaveBeenCalledWith(
          CsvImportViewStepEnum.Values,
        );
      });
    });

    it('should go back to the headers page', async () => {
      uploadData.valuesToConstantsMappings = {};
      const { getByRole } = render(
        <CsvPreviewMockComponent
          accountListId="wee"
          setCurrentTab={setCurrentTab}
        ></CsvPreviewMockComponent>,
      );
      userEvent.click(getByRole('button', { name: 'Back' }));
      await waitFor(() => {
        expect(setCurrentTab).toHaveBeenCalledWith(
          CsvImportViewStepEnum.Headers,
        );
      });
    });
  });

  describe('handleSave()', () => {
    it('should be disabled if the user has not accepted', async () => {
      const { getByRole } = render(
        <CsvPreviewMockComponent
          accountListId="wee"
          setCurrentTab={setCurrentTab}
        ></CsvPreviewMockComponent>,
      );
      expect(getByRole('button', { name: 'Import' })).toBeDisabled();
    });

    it('should save the data', async () => {
      const accountListId = 'wee';
      clickSave(accountListId);
      await waitFor(() => {
        expect(save).toHaveBeenCalledWith(
          expect.objectContaining({
            uploadData,
            constants,
            accountListId,
            setUploadData,
          }),
        );
      });
    });

    it('should show the success modal', async () => {
      const accountListId = 'wee';
      const screen = clickSave(accountListId);
      await waitFor(() => {
        expect(
          screen.getByText(
            'Your CSV import has started and your contacts will be in MPDX shortly. We will email you when your import is complete.',
          ),
        ).toBeVisible();
      });
    });

    it('should redirect to the tools page', async () => {
      const accountListId = 'wee';
      const screen = clickSave(accountListId);
      userEvent.click(await screen.findByRole('button', { name: /ok/i }));
      await waitFor(() => {
        expect(window.location.assign).toHaveBeenCalledWith(
          `/accountLists/${accountListId}/tools`,
        );
      });
    });

    it('should clear the data', async () => {
      const accountListId = 'wee';
      const screen = clickSave(accountListId);
      userEvent.click(await screen.findByRole('button', { name: /ok/i }));
      await waitFor(() => {
        expect(setUploadData).toHaveBeenCalledWith(null);
      });
    });

    const clickSave = (accountListId: string) => {
      const screen = render(
        <CsvPreviewMockComponent
          accountListId={accountListId}
          setCurrentTab={setCurrentTab}
        ></CsvPreviewMockComponent>,
      );
      userEvent.click(
        screen.getByRole('checkbox', {
          name: /I accept that this import cannot be undone/i,
        }),
      );
      userEvent.click(screen.getByRole('button', { name: 'Import' }));
      return screen;
    };
  });
});
