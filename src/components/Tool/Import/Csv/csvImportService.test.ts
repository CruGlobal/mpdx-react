import { CsvImportType } from './CsvImportContext';
import { constants, supportedHeaders } from './CsvImportMocks';
import {
  SaveCsvProps,
  constantsMappingsToValueMappings,
  get,
  save,
  valueMappingsToConstantsMappings,
} from './csvImportService';
import { getFile, saveFile } from './uploadCsvFile';

const importId = 'import_id';

jest.mock('./uploadCsvFile', () => {
  const originalModule = jest.requireActual('./uploadCsvFile');
  return {
    __esModule: true,
    ...originalModule,
    saveFile: jest.fn(({ uploadData }) => {
      return {
        fileConstants: uploadData.fileConstants,
        fileConstantsMappings: uploadData.fileConstantsMappings,
        fileHeaders: uploadData.fileHeaders,
        fileHeadersMappings: uploadData.fileHeadersMappings,
        id: importId,
        inPreview: true,
        sampleContacts: {},
        tagList: uploadData.tagList,
      };
    }),
    getFile: jest.fn(() => {
      return {
        fileHeadersMappings: { one: 'send_appeals' },
        tagList: null,
        fileConstantsMappings: {
          send_appeals: [
            {
              id: true,
              values: ['value'],
            },
          ],
        },
        fileConstants: { one: ['value'] },
      };
    }),
  };
});

describe('csvImportService', () => {
  describe('constantsMappingsToValueMappings', () => {
    it('should return deserialized object', () => {
      const fileConstants = {
        send_letter: ['abc', 'def', 'ghi', 'jkl', 'mno', 'pqr'],
      };
      const fileHeadersMappings = {
        send_letter: 'newsletter',
      };
      const constantsMappings = {
        newsletter: [
          {
            id: 'Physical',
            values: ['abc', 'def'],
          },
          {
            id: 'Both',
            values: ['ghi', 'jkl'],
          },
        ],
      };
      const formattedData = {
        newsletter: {
          abc: 'Physical',
          def: 'Physical',
          ghi: 'Both',
          jkl: 'Both',
          mno: '',
          pqr: '',
        },
      };

      expect(
        constantsMappingsToValueMappings(
          constantsMappings,
          fileConstants,
          fileHeadersMappings,
        ),
      ).toEqual(formattedData);
    });
  });

  describe('valueMappingsToConstantsMappings', () => {
    it('should return a serialized object', () => {
      const fileConstants = {
        send_letter: ['abc', 'def', 'ghi', 'jkl', 'mno', 'pqr'],
      };
      const fileHeadersMappings = {
        send_letter: 'newsletter',
      };
      const formattedData = {
        newsletter: {
          abc: 'Physical',
          def: 'Physical',
          ghi: 'Both',
          mno: null,
          pqr: 'null',
        },
      };
      const data = {
        newsletter: [
          {
            id: 'Physical',
            values: ['abc', 'def'],
          },
          {
            id: 'Both',
            values: ['ghi'],
          },
          {
            id: '',
            values: ['mno', 'pqr', 'jkl'],
          },
        ],
      };
      expect(
        valueMappingsToConstantsMappings(
          formattedData,
          fileConstants,
          fileHeadersMappings,
          constants,
        ),
      ).toEqual(data);
    });

    it('should handle boolean values', () => {
      const fileConstants = {
        send_appeal: ['bar', 'baz'],
      };
      const fileHeadersMappings = {
        send_appeal: 'send_appeals',
      };
      const formattedData = {
        send_appeals: {
          bar: 'true',
          baz: 'false',
        },
      };
      const data = {
        send_appeals: [
          {
            id: true,
            values: ['bar'],
          },
          {
            id: false,
            values: ['baz'],
          },
        ],
      };
      expect(
        valueMappingsToConstantsMappings(
          formattedData,
          fileConstants,
          fileHeadersMappings,
          constants,
        ),
      ).toEqual(data);
    });
  });

  describe('save', () => {
    const accountListId = 'account-list-id';
    const setUploadData = jest.fn();
    const setInitialData = jest.fn();
    const t = jest.fn();
    let data;

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
      await save({
        uploadData: data,
        initialData: data,
        constants,
        accountListId,
        t,
        supportedHeaders,
        setUploadData,
        setInitialData,
      } as SaveCsvProps);
      expect(saveFile).toHaveBeenCalledWith({
        accountListId,
        initialData: data,
        uploadData: data,
        t,
      });
    });

    describe('file_headers_mappings', () => {
      beforeEach(() => {
        data.fileHeadersMappings = {
          a: -1,
          b: -1,
          c: 'send_appeals',
        };
      });

      it('should set file_headers_mappings', async () => {
        const transformedData = await save({
          uploadData: data,
          initialData: data,
          constants,
          accountListId,
          t,
          supportedHeaders,
          setUploadData,
          setInitialData,
        } as SaveCsvProps);
        expect(transformedData.fileHeadersMappings).toEqual({
          send_appeals: 'c',
        });
      });

      it('should omit unmapped headers', async () => {
        data.fileHeadersMappings = {
          test: 'test',
          foo: -1,
        };

        await save({
          uploadData: data,
          initialData: data,
          constants,
          accountListId,
          t,
          supportedHeaders,
          setUploadData,
          setInitialData,
        } as SaveCsvProps);

        expect(saveFile).toHaveBeenCalledWith({
          accountListId,
          initialData: data,
          uploadData: {
            ...data,
            fileHeadersMappings: { test: 'test' },
          },
          t,
        });
      });
    });

    describe('file_constants_mappings', () => {
      beforeEach(() => {
        data.valuesToConstantsMappings = {
          newsletter: {
            none_1: '',
            none_2: null,
            none_3: 'null',
            none_4: '',
            physical_1: 'physical',
            email_1: 'email',
            both_1: 'both',
          },
        };
      });

      it('should set file_constants_mappings', async () => {
        const transformedData = await save({
          uploadData: data,
          initialData: data,
          constants,
          accountListId,
          t,
          supportedHeaders,
          setUploadData,
          setInitialData,
        } as SaveCsvProps);
        expect(transformedData.fileConstantsMappings).toEqual({
          newsletter: [
            {
              id: '',
              values: ['none_1', 'none_2', 'none_3', 'none_4'],
            },
            {
              id: 'physical',
              values: ['physical_1'],
            },
            {
              id: 'email',
              values: ['email_1'],
            },
            {
              id: 'both',
              values: ['both_1'],
            },
          ],
        });
      });

      describe('only unmapped constants present', () => {
        beforeEach(() => {
          data.fileConstants = {
            categories: ['test_1', 'test_2', 'test_3', 'test_4', 'test_5'],
          };
          data.fileHeadersMappings = {
            categories: 'status',
          };
          data.valuesToConstantsMappings = {};
        });

        it('should add unmapped constants to file_constants_mappings', async () => {
          const transformedData = await save({
            uploadData: data,
            initialData: data,
            constants,
            accountListId,
            t,
            supportedHeaders,
            setUploadData,
            setInitialData,
          } as SaveCsvProps);
          expect(transformedData.fileConstantsMappings).toEqual({
            status: [
              {
                id: '',
                values: ['test_1', 'test_2', 'test_3', 'test_4', 'test_5'],
              },
            ],
          });
        });
      });

      describe('mapped and unmapped constants present', () => {
        beforeEach(() => {
          data.fileConstants = {
            categories: ['test_1', 'test_2', 'test_3', 'test_4', 'test_5'],
          };
          data.fileHeadersMappings = {
            categories: 'status',
          };
          data.valuesToConstantsMappings = {
            status: {
              test_5: 'Never Contacted',
            },
          };
        });

        it('should add unmapped constants to file_constants_mappings', async () => {
          const transformedData = await save({
            uploadData: data,
            initialData: data,
            constants,
            accountListId,
            t,
            supportedHeaders,
            setUploadData,
            setInitialData,
          } as SaveCsvProps);
          expect(transformedData.fileConstantsMappings).toEqual({
            status: [
              {
                id: 'Never Contacted',
                values: ['test_5'],
              },
              {
                id: '',
                values: ['test_1', 'test_2', 'test_3', 'test_4'],
              },
            ],
          });
        });
      });

      describe('only mapped constants present', () => {
        beforeEach(() => {
          data.fileConstants = {
            categories: ['test_1', 'test_2'],
          };
          data.fileHeadersMappings = {
            categories: 'status',
          };
          data.valuesToConstantsMappings = {
            status: {
              test_1: 'Never Contacted',
              test_2: 'Never Contacted',
            },
          };
        });

        it('should add unmapped constants to file_constants_mappings', async () => {
          const transformedData = await save({
            uploadData: data,
            initialData: data,
            constants,
            accountListId,
            t,
            supportedHeaders,
            setUploadData,
            setInitialData,
          } as SaveCsvProps);
          expect(transformedData.fileConstantsMappings).toEqual({
            status: [
              {
                id: 'Never Contacted',
                values: ['test_1', 'test_2'],
              },
            ],
          });
        });

        it('should properly re-map file constants', async () => {
          const initialData = {
            ...data,
            fileConstantsMappings: {
              pledge_frequency: [{ id: 'WEEKLY', values: ['test'] }],
            },
            fileHeadersMappings: {
              foo: 'pledge_frequency',
            },
            fileHeaders: { foo: 'foo' },
            fileConstants: { foo: ['test'] },
            valuesToConstantsMappings: {
              pledge_frequency: { test: 'WEEKLY' },
            },
          };
          const uploadData = {
            ...data,
            fileConstantsMappings: {
              newsletter: [{ id: '', values: ['test'] }],
            },
            fileHeadersMappings: {
              foo: 'newsletter',
            },
            fileHeaders: { foo: 'foo' },
            fileConstants: { foo: ['test'] },
            valuesToConstantsMappings: {},
          };

          await save({
            uploadData,
            initialData,
            constants,
            accountListId,
            t,
            supportedHeaders,
            setUploadData,
            setInitialData,
          } as SaveCsvProps);

          expect(saveFile).toHaveBeenCalledWith({
            accountListId,
            initialData,
            uploadData: {
              ...uploadData,
              fileConstantsMappings: {
                newsletter: [{ id: '', values: ['test'] }],
              },
            },
            t,
          });
        });
      });
    });

    describe('promise successful', () => {
      it('should set upload data', async () => {
        const transformedData = await save({
          uploadData: data,
          initialData: data,
          constants,
          accountListId,
          t,
          supportedHeaders,
          setUploadData,
          setInitialData,
        } as SaveCsvProps);
        expect(setUploadData).toHaveBeenCalledWith(transformedData);
      });

      it('should set initial data', async () => {
        const transformedData = await save({
          uploadData: data,
          initialData: data,
          constants,
          accountListId,
          t,
          supportedHeaders,
          setUploadData,
          setInitialData,
        } as SaveCsvProps);
        expect(setInitialData).toHaveBeenCalledWith(transformedData);
      });
    });

    describe('promise unsuccessful', () => {
      beforeEach(() => {
        jest
          .mocked(saveFile)
          .mockImplementation(() =>
            Promise.reject(new Error('something bad happened')),
          );
      });

      it('should set upload data', async () => {
        try {
          await save({
            uploadData: data,
            initialData: data,
            constants,
            accountListId,
            t,
            supportedHeaders,
            setUploadData,
            setInitialData,
          } as SaveCsvProps);
          throw new Error('Should have gone to catch');
        } catch (err) {
          // Ignore the exception
        } finally {
          expect(setUploadData).toHaveBeenCalledWith(data);
        }
      });
    });
  });

  describe('get', () => {
    const accountListId = 'account-list-id';
    const csvFileId = 'file-id';

    it('should call the api', async () => {
      await get(accountListId, csvFileId, null);
      expect(getFile).toHaveBeenCalledWith({ accountListId, csvFileId });
    });

    describe('data cached', () => {
      let initialData;
      beforeEach(() => {
        initialData = { id: csvFileId } as CsvImportType;
      });

      it('should not call the api', async () => {
        await get(accountListId, csvFileId, initialData);
        expect(getFile).not.toHaveBeenCalled();
      });

      describe('promise successful', () => {
        it('should return data', async () => {
          const data = await get(accountListId, csvFileId, initialData);
          expect(data).toEqual({ id: csvFileId });
        });
      });
    });

    describe('promise successful', () => {
      it('should make the tagList non-null', async () => {
        const data = await get(accountListId, csvFileId, null);
        expect(data.tagList).toEqual([]);
      });

      it('should re-map values_to_constants_mappings', async () => {
        const data = await get(accountListId, csvFileId, null);
        expect(data.valuesToConstantsMappings).toEqual({
          send_appeals: {
            value: true,
          },
        });
      });

      it('should invert the file headers mappings', async () => {
        const data = await get(accountListId, csvFileId, null);
        expect(data.fileHeadersMappings).toEqual({ send_appeals: 'one' });
      });
    });
  });
});
