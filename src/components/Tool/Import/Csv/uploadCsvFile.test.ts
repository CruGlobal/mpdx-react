import { getMaxFileSize, uploadFile } from './uploadCsvFile';

const importId = 'import-id';

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

  describe('getMaxFileSize', () => {
    it('should return 150', () => {
      expect(getMaxFileSize()).toEqual(150);
    });
  });
});
