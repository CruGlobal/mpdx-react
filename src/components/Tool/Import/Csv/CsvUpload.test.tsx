import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestWrapper from '__tests__/util/TestWrapper';
import {
  CsvImportContext,
  CsvImportType,
  CsvImportViewStepEnum,
} from './CsvImportContext';
import CsvUpload from './CsvUpload';
import { getMaxFileSize, uploadFile } from './uploadCsvFile';

jest.mock('./uploadCsvFile');

const mockEnqueue = jest.fn();
jest.mock('notistack', () => ({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ...jest.requireActual('notistack'),
  useSnackbar: () => {
    return {
      enqueueSnackbar: mockEnqueue,
    };
  },
}));

const maxFileSize = 200;
const successResponse = {
  attributes: {
    file_constants: {},
    file_constants_mappings: {},
    file_headers: [],
    file_headers_mappings: {},
    in_preview: true,
    tag_list: [],
  },
  id: 'importId',
  relationships: {
    sample_contacts: {
      data: {},
    },
  },
};

beforeEach(() => {
  (getMaxFileSize as jest.Mock).mockReturnValue(maxFileSize);
  (uploadFile as jest.Mock).mockReturnValue(Promise.resolve(successResponse));
});

describe('CsvUpload', () => {
  const setCurrentTab = jest.fn();

  it('should show the max file size', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <CsvUpload
          accountListId="wee"
          setCurrentTab={setCurrentTab}
        ></CsvUpload>
      </TestWrapper>,
    );

    const element = getByTestId('MaxFileSize');
    expect(element).toBeVisible();
    element.click;
  });

  it('should fail to upload a file that is too large', async () => {
    const { getByTestId } = render(
      <TestWrapper>
        <CsvUpload
          accountListId="wee"
          setCurrentTab={setCurrentTab}
        ></CsvUpload>
      </TestWrapper>,
    );

    const file = new File(['contents'], 'test.csv', { type: 'csv' });
    Object.defineProperty(file, 'size', { value: 9999999999 });
    const submit = getByTestId('CsvUpload');
    userEvent.upload(submit, file);
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith(
        `File too large, ${maxFileSize}MB max`,
        {
          variant: 'error',
        },
      ),
    );
  });

  it('should successfully upload a file', async () => {
    let uploadData = {} as CsvImportType;
    const setUploadData = jest.fn();
    setUploadData.mockImplementation((data) => {
      uploadData = data;
    });
    const initialData = {} as CsvImportType;
    const setInitialData = jest.fn();
    const expectedData = {
      fileConstants: successResponse.attributes.file_constants,
      fileConstantsMappings: successResponse.attributes.file_constants_mappings,
      fileHeaders: successResponse.attributes.file_headers,
      fileHeadersMappings: successResponse.attributes.file_headers_mappings,
      id: successResponse.id,
      inPreview: successResponse.attributes.in_preview,
      sampleContacts: successResponse.relationships.sample_contacts.data,
      tagList: successResponse.attributes.tag_list,
    };

    const { getByTestId } = render(
      <TestWrapper>
        <CsvImportContext.Provider
          value={{ uploadData, setUploadData, initialData, setInitialData }}
        >
          <CsvUpload
            accountListId="wee"
            setCurrentTab={setCurrentTab}
          ></CsvUpload>
        </CsvImportContext.Provider>
      </TestWrapper>,
    );

    const file = new File(['contents'], 'test.csv', { type: 'csv' });
    const submit = getByTestId('CsvUpload');
    userEvent.upload(submit, file);
    await waitFor(() =>
      expect(setUploadData).toHaveBeenCalledWith(expectedData),
    );
    await waitFor(() =>
      expect(setCurrentTab).toHaveBeenCalledWith(CsvImportViewStepEnum.Headers),
    );
  });
});
