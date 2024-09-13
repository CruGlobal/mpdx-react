import { renderHook } from '@testing-library/react-hooks';
import { getSession } from 'next-auth/react';
import { fetchAllData } from 'src/lib/deserializeJsonApi';
import { CsvImportType } from './CsvImportContext';
import {
  getFile,
  getMaxFileSize,
  includeParam,
  saveFile,
  uploadFile,
  useRequiredHeaders,
  useSupportedHeaders,
} from './uploadCsvFile';

jest.mock('src/lib/deserializeJsonApi');
jest.mock('next-auth/react');

const importId = 'import-id';

beforeEach(() => {
  (fetchAllData as jest.Mock).mockReturnValue({
    id: importId,
    first_name: 'Bob',
  });
  (getSession as jest.Mock).mockReturnValue({
    user: { apiToken: 'token' },
  });
});

describe('uploadCsvFile', () => {
  const accountListId = 'account-list-id';
  const t = (message: string) => message;
  const fetch = jest.fn();

  beforeEach(() => {
    fetch.mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: { id: importId } }),
    });
    window.fetch = fetch;
  });

  describe('uploadFile', () => {
    const file = new File(['wee'], 'wee.csv');
    it('should call the API', async () => {
      await uploadFile({ accountListId, file, t });
      expect(fetch).toHaveBeenCalledWith('/api/uploads/csv-upload', {
        body: expect.any(FormData),
        method: 'POST',
      });
    });

    it('should return the data from the API', async () => {
      const data = await uploadFile({ accountListId, file, t });
      expect(data).toEqual({ id: importId });
    });

    it('should throw an error', async () => {
      fetch.mockResolvedValue({
        json: () => Promise.resolve({ success: false }),
      });
      return expect(uploadFile({ accountListId, file, t })).rejects.toThrow(
        new Error(
          'Invalid CSV file - See help docs or send us a message with your CSV attached',
        ),
      );
    });
  });

  describe('saveFile', () => {
    let data;

    const findFormData = () => {
      const callArgs = fetch.mock.lastCall[1];
      const body = callArgs.body as FormData;
      return Array.from(body.entries()).reduce(
        (acc, f) => ({ ...acc, [f[0]]: f[1] }),
        {} as Record<string, any>,
      );
    };

    const verifyFormData = (expectedPatch: object): boolean => {
      const formData = findFormData();

      expect(formData).toEqual(
        expect.objectContaining({
          patchedData: JSON.stringify(expectedPatch),
        }),
      );
      return true;
    };

    beforeEach(() => {
      data = {
        fileConstants: { test: 'data' },
        fileConstantsMappings: {},
        fileHeaders: {},
        fileHeadersMappings: {},
        id: importId,
      } as CsvImportType;
    });

    it('should call the api', async () => {
      await saveFile({
        accountListId,
        initialData: data,
        uploadData: data,
        t: t,
      });
      expect(fetch).toHaveBeenCalledWith('/api/csv-update', {
        body: expect.any(FormData),
        method: 'PUT',
      });
    });

    it('should throw an error', async () => {
      fetch.mockResolvedValue({
        json: () => Promise.resolve({ success: false }),
      });
      return expect(
        saveFile({ accountListId, initialData: data, uploadData: data, t: t }),
      ).rejects.toThrow(
        new Error(
          'Unable to save your CSV import settings - See help docs or send us a message with your CSV attached',
        ),
      );
    });

    it('should join tag_list by commas', async () => {
      data.tagList = ['test', 'post', 'please', 'ignore'];
      await saveFile({
        accountListId,
        initialData: data,
        uploadData: data,
        t: t,
      });
      const expectedPatch = {
        ...data,
        tagList: 'test,post,please,ignore',
      };
      expect(verifyFormData(expectedPatch)).toEqual(true);
    });

    it('should invert the fileHeadersMappings', async () => {
      data.fileHeadersMappings = {
        test: 'test1',
        foo: 'foo1',
      };
      await saveFile({
        accountListId,
        initialData: data,
        uploadData: data,
        t: t,
      });
      const expectedPatch = {
        ...data,
        fileHeadersMappings: { test1: 'test', foo1: 'foo' },
        tagList: '',
      };
      expect(verifyFormData(expectedPatch)).toEqual(true);
    });

    it('should parse the JsonAPI response', async () => {
      const expectedResponseData = {
        data: {
          file_constants: { test: 'data' },
          file_constants_mappings: {},
          file_headers: {},
          file_headers_mappings: {},
          id: importId,
          relationships: {
            sample_contacts: {
              data: {
                id: '1',
                type: 'contacts',
              },
            },
          },
        },
        included: [
          {
            id: '2',
            type: 'contacts',
            attributes: {
              name: 'Test Name',
            },
          },
          {
            id: '3',
            type: 'people',
            attributes: {
              first_name: 'Test',
              last_name: 'Name',
            },
          },
        ],
        success: true,
      };

      fetch.mockResolvedValue({
        json: () => Promise.resolve(expectedResponseData),
      });
      await saveFile({
        accountListId,
        initialData: data,
        uploadData: data,
        t: t,
      });

      expect(fetchAllData).toHaveBeenCalledWith(
        expectedResponseData.data,
        expectedResponseData.included,
      );
    });
  });

  describe('getFile', () => {
    beforeEach(() => {
      fetch.mockResolvedValue({
        json: () =>
          Promise.resolve({
            success: true,
            data: { id: importId, attributes: { first_name: 'Bob' } },
          }),
        status: 200,
      });
    });
    it('should call the API', async () => {
      await getFile({ accountListId, csvFileId: importId });
      expect(fetch).toHaveBeenCalledWith(
        `${process.env.REST_API_URL}account_lists/${accountListId}/imports/csv/${importId}?include=${includeParam}`,
        {
          method: 'GET',
          headers: {
            authorization: 'Bearer token',
            'content-type': 'application/vnd.api+json',
          },
        },
      );
    });

    it('should return the data from the API', async () => {
      const data = await getFile({ accountListId, csvFileId: importId });
      expect(data).toEqual({ id: importId, first_name: 'Bob' });
    });

    it('should throw an error', async () => {
      fetch.mockResolvedValue({
        json: () => Promise.resolve({ status: 401 }),
      });
      return expect(
        getFile({ accountListId, csvFileId: importId }),
      ).rejects.toThrow(new Error('Failed to get CSV File'));
    });
  });

  describe('getMaxFileSize', () => {
    it('should return 150', () => {
      expect(getMaxFileSize()).toEqual(150);
    });
  });

  describe('useSupportedHeaders', () => {
    it('should bring back headers', () => {
      const { result } = renderHook(() => useSupportedHeaders());
      expect(result.current).toEqual(expect.objectContaining({ zip: 'Zip' }));
    });
  });

  describe('useRequiredHeaders', () => {
    it('should bring back headers', () => {
      const { result } = renderHook(() => useRequiredHeaders());
      expect(result.current).toEqual(['first_name', 'last_name']);
    });
  });
});
