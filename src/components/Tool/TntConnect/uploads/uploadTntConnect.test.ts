import { session } from '__tests__/fixtures/session';
import { uploadTnt } from './uploadTntConnect';

const apiToken = session.user.apiToken;

describe('uploadTnt', () => {
  const fetch = jest.fn().mockResolvedValue({
    ok: true,
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

  const selectedTags = ['test', 'tag1'];
  const accountListId = '1234';

  it('uploads the file', () => {
    return expect(
      uploadTnt({
        apiToken,
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
        apiToken,
        override: 'false',
        selectedTags,
        accountListId,
        file: textFile,
        t,
      }),
    ).rejects.toThrow('Cannot upload file: file must be a xml file');
  });

  it('handles network errors', () => {
    fetch.mockRejectedValue(new Error('Network error'));

    return expect(
      uploadTnt({
        apiToken,
        override: 'false',
        selectedTags,
        accountListId,
        file,
        t,
      }),
    ).rejects.toThrow('Cannot upload file: network error');
  });

  it('handles success being false', () => {
    fetch.mockResolvedValue({
      ok: false,
    });

    return expect(
      uploadTnt({
        apiToken,
        override: 'false',
        selectedTags,
        accountListId,
        file,
        t,
      }),
    ).rejects.toThrow('Cannot upload file: server not successful');
  });
});
