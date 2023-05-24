import { uploadAvatar } from './uploadAvatar';

describe('uploadAvatar', () => {
  const fetch = jest.fn();
  beforeEach(() => {
    window.fetch = fetch;
  });

  it('uploads the image', async () => {
    fetch.mockResolvedValue({
      json: () =>
        Promise.resolve({ data: { attributes: { avatar: 'avatar-url' } } }),
    });

    const url = await uploadAvatar({
      token: 'abc',
      personId: 'person-1',
      file: new File(['contents'], 'image.png', {
        type: 'image/png',
      }),
    });
    expect(url).toEqual('avatar-url');
  });
});
