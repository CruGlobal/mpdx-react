import { uploadTnt } from './uploadTntConnect';

describe('uploadTnt', () => {
  const fetch = jest.fn().mockResolvedValue({
    json: () => Promise.resolve({ success: true }),
  });
  beforeEach(() => {
    window.fetch = fetch;
  });

  const t = (message: string) => message;

  const file = new File(['contents'], 'tnt.xml', {
    type: 'text/xml',
  });
  const textFile = new File(['contents'], 'file.txt', {
    type: 'text/plain',
  });
  const largeFile = new File([new ArrayBuffer(2_000_000)], 'large.xml', {
    type: 'text/xml',
  });

  const selectedTags = ['test', 'tag1'];
  const accountListId = '1234';

  it('uploads the image', () => {
    return expect(
      uploadTnt({
        override: 'false',
        selectedTags,
        accountListId,
        file,
        t,
      }),
    ).resolves.toBeUndefined();
  });

  it('rejects files that are not xml files', () => {
    return expect(
      uploadTnt({
        override: 'false',
        selectedTags,
        accountListId,
        file: textFile,
        t,
      }),
    ).rejects.toThrow('Cannot upload file: file must be a xml file');
  });

  it('rejects files that are too large', () => {
    return expect(
      uploadTnt({
        override: 'false',
        selectedTags,
        accountListId,
        file: largeFile,
        t,
      }),
    ).rejects.toThrow('Cannot upload file: file size cannot exceed 1MB');
  });

  it('handles server errors', () => {
    fetch.mockRejectedValue(new Error('Network error'));

    return expect(
      uploadTnt({
        override: 'false',
        selectedTags,
        accountListId,
        file,
        t,
      }),
    ).rejects.toThrow('Cannot upload file: server error');
  });

  it('handles success being false', () => {
    const fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: false }),
    });
    window.fetch = fetch;

    return expect(
      uploadTnt({
        override: 'false',
        selectedTags,
        accountListId,
        file,
        t,
      }),
    ).rejects.toThrow('Cannot upload file: server not successful');
  });
});
