import { uploadAvatar } from './uploadAvatar';

describe('uploadAvatar', () => {
  const fetch = jest.fn().mockResolvedValue({
    json: () => Promise.resolve({ success: true }),
  });
  beforeEach(() => {
    window.fetch = fetch;
  });

  const t = (message: string) => message;

  const file = new File(['contents'], 'image.png', {
    type: 'image/png',
  });
  const invalidFile = new File(['contents'], 'file.txt', {
    type: 'text/plain',
  });

  it('uploads the image', () => {
    return expect(
      uploadAvatar({
        personId: 'person-1',
        file,
        t,
      }),
    ).resolves.toBeUndefined();
  });

  it('rejects files that are not images', () => {
    return expect(
      uploadAvatar({
        personId: 'person-1',
        file: invalidFile,
        t,
      }),
    ).rejects.toThrow('Cannot upload avatar: file is not an image');
  });

  it('handles server errors', () => {
    fetch.mockRejectedValue(new Error('Network error'));

    return expect(
      uploadAvatar({
        personId: 'person-1',
        file,
        t,
      }),
    ).rejects.toThrow('Cannot upload avatar: server error');
  });
});
