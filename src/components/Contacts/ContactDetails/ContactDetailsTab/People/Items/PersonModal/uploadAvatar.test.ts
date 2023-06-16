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
  const textFile = new File(['contents'], 'file.txt', {
    type: 'text/plain',
  });
  const largeFile = new File([new ArrayBuffer(2_000_000)], 'image.png', {
    type: 'image/png',
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
        file: textFile,
        t,
      }),
    ).rejects.toThrow('Cannot upload avatar: file must be an image');
  });

  it('rejects files that are too large', () => {
    return expect(
      uploadAvatar({
        personId: 'person-1',
        file: largeFile,
        t,
      }),
    ).rejects.toThrow('Cannot upload avatar: file size cannot exceed 1MB');
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
