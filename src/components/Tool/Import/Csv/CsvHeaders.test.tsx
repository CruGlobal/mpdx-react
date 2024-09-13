import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestWrapper from '__tests__/util/TestWrapper';
import { useApiConstants } from 'src/components/Constants/UseApiConstants';
import theme from 'src/theme';
import CsvHeaders, { CsvHeadersProps } from './CsvHeaders';
import {
  CsvImportContext,
  CsvImportType,
  CsvImportViewStepEnum,
} from './CsvImportContext';
import { constants, uploadDataFileHeaders } from './CsvImportMocks';
import { get, save } from './csvImportService';

jest.mock('./csvImportService');
jest.mock('src/components/Constants/UseApiConstants');

let uploadData;
const setUploadData = jest.fn();

let initialData;
const setInitialData = jest.fn();

const setCurrentTab = jest.fn();

const CsvHeadersMockComponent: React.FC<CsvHeadersProps> = ({
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
          csvFileId: 'csvFileId',
        }}
      >
        <CsvHeaders
          accountListId={accountListId}
          setCurrentTab={setCurrentTab}
        ></CsvHeaders>
      </CsvImportContext.Provider>
    </ThemeProvider>
  </TestWrapper>
);

beforeEach(() => {
  (get as jest.Mock).mockReturnValue(Promise.resolve({ id: 'from-get' }));
  (save as jest.Mock).mockReturnValue(
    Promise.resolve({ valuesToConstantsMappings: {} }),
  );
  (useApiConstants as jest.Mock).mockReturnValue(constants);
});

describe('CsvHeaders', () => {
  beforeEach(() => {
    uploadData = {
      id: 'csvFileId',
      fileHeadersMappings: {},
    } as CsvImportType;
    initialData = {} as CsvImportType;
  });

  describe('rendering', () => {
    it('should not render if there is no accountListId', async () => {
      const { queryByRole } = render(
        <CsvHeadersMockComponent
          accountListId=""
          setCurrentTab={setCurrentTab}
        ></CsvHeadersMockComponent>,
      );

      expect(queryByRole('combobox')).not.toBeInTheDocument();
    });

    it('should not render if there is no uploadData', async () => {
      uploadData = undefined as unknown as CsvImportType;
      const { queryByRole } = render(
        <CsvHeadersMockComponent
          accountListId="wee"
          setCurrentTab={setCurrentTab}
        ></CsvHeadersMockComponent>,
      );

      expect(queryByRole('combobox')).not.toBeInTheDocument();
    });

    it('should show errors if required headers are missing', async () => {
      uploadData.fileHeaders = { custom_header: 'Wee' };
      const { queryByText } = render(
        <CsvHeadersMockComponent
          accountListId="wee"
          setCurrentTab={setCurrentTab}
        ></CsvHeadersMockComponent>,
      );

      expect(queryByText('first_name is required')).toBeInTheDocument();
      expect(queryByText('last_name is required')).toBeInTheDocument();
    });

    it('should not show errors if required headers are mapped', async () => {
      uploadData.fileHeaders = uploadDataFileHeaders;
      const { queryByText } = render(
        <CsvHeadersMockComponent
          accountListId="wee"
          setCurrentTab={setCurrentTab}
        ></CsvHeadersMockComponent>,
      );

      expect(queryByText('first_name is required')).not.toBeInTheDocument();
      expect(queryByText('last_name is required')).not.toBeInTheDocument();
      expect(queryByText('full_name is required')).not.toBeInTheDocument();
    });

    it('should allow the user to map every header', async () => {
      uploadData.fileHeaders = {
        first_name: 'First Name',
        custom_header: 'Wee',
      };

      const { findByRole } = render(
        <CsvHeadersMockComponent
          accountListId="wee"
          setCurrentTab={setCurrentTab}
        ></CsvHeadersMockComponent>,
      );

      expect(
        await findByRole('cell', { name: 'First Name' }),
      ).toBeInTheDocument();
      expect(await findByRole('cell', { name: 'Wee' })).toBeInTheDocument();
    });
  });

  describe('buildDefaultFileHeadersMappings', () => {
    beforeEach(() => {
      uploadData.fileHeaders = {};
      uploadData.fileHeadersMappings = {};
      setUploadData.mockImplementation((data) => {
        uploadData = data;
      });
      setInitialData.mockImplementation((data) => {
        initialData = data;
      });
    });

    it('should map headers with the same key by default', async () => {
      uploadData.fileHeaders = { first_name: 'Wee', last_name: 'Test' };
      render(
        <CsvHeadersMockComponent
          accountListId="wee"
          setCurrentTab={setCurrentTab}
        ></CsvHeadersMockComponent>,
      );
      await waitFor(() =>
        expect(uploadData.fileHeadersMappings).toEqual({
          first_name: 'first_name',
          last_name: 'last_name',
        }),
      );
    });

    it('should not automatically map unmatched headers', async () => {
      uploadData.fileHeaders = {
        first_name: 'Wee',
        custom_header: 'Foo',
      };

      render(
        <CsvHeadersMockComponent
          accountListId="wee"
          setCurrentTab={setCurrentTab}
        ></CsvHeadersMockComponent>,
      );

      await waitFor(() =>
        expect(uploadData.fileHeadersMappings).toEqual({
          first_name: 'first_name',
          custom_header: -1,
        }),
      );
    });
  });

  describe('handleUpdateHeaders', () => {
    beforeEach(() => {
      uploadData.fileHeaders = uploadDataFileHeaders;
    });

    it('should disable options that are already mapped to other fields', async () => {
      uploadData.fileHeadersMappings = {
        first_name: 'first_name',
        last_name: 'last_name',
        full_name: 'full_name',
        weird: 'city',
      };

      const { findByRole } = render(
        <CsvHeadersMockComponent
          accountListId="wee"
          setCurrentTab={setCurrentTab}
        ></CsvHeadersMockComponent>,
      );

      const firstNameRow = await findByRole('row', { name: 'first_name' });
      userEvent.click(within(firstNameRow).getByRole('combobox'));

      expect(
        await findByRole('option', { name: 'Do Not Import' }),
      ).not.toHaveAttribute('aria-disabled', 'true');
      expect(
        await findByRole('option', { name: 'First Name' }),
      ).not.toHaveAttribute('aria-disabled', 'true');
      expect(await findByRole('option', { name: 'Last Name' })).toHaveAttribute(
        'aria-disabled',
        'true',
      );
    });

    it('should update the unmapped headers on change', async () => {
      uploadData.fileHeadersMappings = {
        first_name: 'first_name',
        last_name: 'last_name',
        full_name: 'full_name',
        weird: '-1',
      };

      const { findByRole } = render(
        <CsvHeadersMockComponent
          accountListId="wee"
          setCurrentTab={setCurrentTab}
        ></CsvHeadersMockComponent>,
      );

      const weirdRow = await findByRole('row', { name: 'weird' });
      userEvent.click(within(weirdRow).getByRole('combobox'));
      userEvent.click(await findByRole('option', { name: 'Church' }));

      await waitFor(() =>
        expect(uploadData.fileHeadersMappings).toEqual({
          first_name: 'first_name',
          last_name: 'last_name',
          full_name: 'full_name',
          weird: 'church',
        }),
      );
    });
  });

  describe('handleBack', () => {
    it('should show a warning modal', async () => {
      const { getByRole, getByText } = render(
        <CsvHeadersMockComponent
          accountListId="wee"
          setCurrentTab={setCurrentTab}
        ></CsvHeadersMockComponent>,
      );
      userEvent.click(getByRole('button', { name: 'Back' }));
      expect(
        getByText(
          /are you sure you want to navigate back to the upload step\? you will lose all unsaved progress\./i,
        ),
      ).toBeVisible();
    });
  });

  describe('handleSubmitModal', () => {
    it('should clear out the data', async () => {
      const { getByRole } = render(
        <CsvHeadersMockComponent
          accountListId="wee"
          setCurrentTab={setCurrentTab}
        ></CsvHeadersMockComponent>,
      );
      userEvent.click(getByRole('button', { name: 'Back' }));
      userEvent.click(getByRole('button', { name: 'Yes' }));
      expect(setUploadData).toHaveBeenCalledWith(null);
    });

    it('should update the current tab to the previous tab', async () => {
      const { getByRole } = render(
        <CsvHeadersMockComponent
          accountListId="wee"
          setCurrentTab={setCurrentTab}
        ></CsvHeadersMockComponent>,
      );
      userEvent.click(getByRole('button', { name: 'Back' }));
      userEvent.click(getByRole('button', { name: 'Yes' }));
      expect(setCurrentTab).toHaveBeenCalledWith(CsvImportViewStepEnum.Upload);
    });
  });

  describe('handleClose modal', () => {
    it('should close the modal when the user clicks No', async () => {
      const { getByRole, queryByText } = render(
        <CsvHeadersMockComponent
          accountListId="wee"
          setCurrentTab={setCurrentTab}
        ></CsvHeadersMockComponent>,
      );
      userEvent.click(getByRole('button', { name: 'Back' }));
      userEvent.click(getByRole('button', { name: 'No' }));
      expect(
        queryByText(
          /are you sure you want to navigate back to the upload step\? you will lose all unsaved progress\./i,
        ),
      ).not.toBeInTheDocument();
      expect(setCurrentTab).not.toHaveBeenCalled();
      expect(setUploadData).not.toHaveBeenCalledWith(null);
    });
  });

  describe('handleSave', () => {
    beforeEach(() => {
      uploadData.fileHeaders = uploadDataFileHeaders;
      uploadData.fileHeadersMappings = {
        first_name: 'first_name',
        last_name: 'last_name',
        full_name: 'full_name',
        weird: 'city',
      };
    });

    it('should return early if the right data is not available', async () => {
      (useApiConstants as jest.Mock).mockReturnValue(null);
      const { findByRole } = render(
        <CsvHeadersMockComponent
          accountListId="wee"
          setCurrentTab={setCurrentTab}
        ></CsvHeadersMockComponent>,
      );

      userEvent.click(await findByRole('button', { name: 'Next' }));
      await waitFor(() => expect(save).not.toHaveBeenCalled());
    });

    it('should save the data', async () => {
      const { findByRole } = render(
        <CsvHeadersMockComponent
          accountListId="wee"
          setCurrentTab={setCurrentTab}
        ></CsvHeadersMockComponent>,
      );

      userEvent.click(await findByRole('button', { name: 'Next' }));
      await waitFor(() =>
        expect(save).toHaveBeenCalledWith(
          expect.objectContaining({
            uploadData,
            constants,
            accountListId: 'wee',
            setUploadData,
          }),
        ),
      );
    });

    it('should move to the values page', async () => {
      (save as jest.Mock).mockReturnValue(
        Promise.resolve({
          valuesToConstantsMappings: { send_appeals: { Test: 'Yes' } },
        }),
      );
      const { findByRole } = render(
        <CsvHeadersMockComponent
          accountListId="wee"
          setCurrentTab={setCurrentTab}
        ></CsvHeadersMockComponent>,
      );

      userEvent.click(await findByRole('button', { name: 'Next' }));
      await waitFor(() =>
        expect(setCurrentTab).toHaveBeenCalledWith(
          CsvImportViewStepEnum.Values,
        ),
      );
    });

    it('should move to the preview page directly', async () => {
      const { findByRole } = render(
        <CsvHeadersMockComponent
          accountListId="wee"
          setCurrentTab={setCurrentTab}
        ></CsvHeadersMockComponent>,
      );
      userEvent.click(await findByRole('button', { name: 'Next' }));
      await waitFor(() =>
        expect(setCurrentTab).toHaveBeenCalledWith(
          CsvImportViewStepEnum.Preview,
        ),
      );
    });

    it('should allow the user to not map every header', async () => {
      uploadData.fileHeadersMappings.weird = -1;

      const { findByRole } = render(
        <CsvHeadersMockComponent
          accountListId="wee"
          setCurrentTab={setCurrentTab}
        ></CsvHeadersMockComponent>,
      );

      userEvent.click(await findByRole('button', { name: 'Next' }));
      await waitFor(() =>
        expect(save).toHaveBeenCalledWith(
          expect.objectContaining({
            uploadData,
            constants,
            accountListId: 'wee',
            setUploadData,
          }),
        ),
      );
    });
  });
});
