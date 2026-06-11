import { Camera } from '@capacitor/camera';
import { renderHook } from '@testing-library/react';
import { compressAvatar } from 'src/lib/images/compressAvatar';
import { isNativeShell } from 'src/lib/nativeShell/nativeShell';
import { useNativeCamera } from './useNativeCamera';

// The hook loads @capacitor/camera via dynamic import(); a plain jest.mock
// factory intercepts that too. Enum values mirror the real plugin enums so
// assertions pin the exact wire values.
jest.mock('@capacitor/camera', () => ({
  Camera: {
    requestPermissions: jest.fn(),
    getPhoto: jest.fn(),
  },
  CameraResultType: { Uri: 'uri', Base64: 'base64', DataUrl: 'dataUrl' },
  CameraSource: { Prompt: 'PROMPT', Camera: 'CAMERA', Photos: 'PHOTOS' },
}));

jest.mock('src/lib/nativeShell/nativeShell', () => ({
  isNativeShell: jest.fn(),
}));

jest.mock('src/lib/images/compressAvatar', () => ({
  ...jest.requireActual('src/lib/images/compressAvatar'),
  compressAvatar: jest.fn(),
}));

const mockedCamera = Camera as jest.Mocked<typeof Camera>;
const mockedIsNativeShell = isNativeShell as jest.MockedFunction<
  typeof isNativeShell
>;
const mockedCompressAvatar = compressAvatar as jest.MockedFunction<
  typeof compressAvatar
>;

// 'photo-bytes' encoded; decodes to an 11-byte file
const smallBase64 = 'cGhvdG8tYnl0ZXM=';
// Decodes to 1,050,000 bytes — over the 1,000,000-byte avatar limit
const oversizeBase64 = 'A'.repeat(1_400_000);

describe('useNativeCamera', () => {
  beforeEach(() => {
    mockedIsNativeShell.mockReturnValue(true);
    mockedCamera.requestPermissions.mockResolvedValue({
      camera: 'granted',
      photos: 'granted',
    });
    mockedCamera.getPhoto.mockResolvedValue({
      base64String: smallBase64,
      format: 'jpeg',
      saved: false,
    });
  });

  describe('isNative', () => {
    it('is true inside the native shell', () => {
      const { result } = renderHook(() => useNativeCamera());

      expect(result.current.isNative).toBe(true);
    });

    it('is false in the browser', () => {
      mockedIsNativeShell.mockReturnValue(false);

      const { result } = renderHook(() => useNativeCamera());

      expect(result.current.isNative).toBe(false);
    });
  });

  describe('getAvatarPhoto success', () => {
    it('camera source: requests the camera permission and calls getPhoto with the designed options', async () => {
      const { result } = renderHook(() => useNativeCamera());

      const outcome = await result.current.getAvatarPhoto('camera');

      expect(mockedCamera.requestPermissions).toHaveBeenCalledWith({
        permissions: ['camera'],
      });
      expect(mockedCamera.getPhoto).toHaveBeenCalledWith({
        resultType: 'base64',
        source: 'CAMERA',
        quality: 85,
        width: 1024,
        height: 1024,
        correctOrientation: true,
        allowEditing: false,
        saveToGallery: false,
      });
      expect(outcome).toEqual({ outcome: 'success', file: expect.any(File) });
      if (outcome.outcome !== 'success') {
        throw new Error('expected success');
      }
      expect(outcome.file.type).toBe('image/jpeg');
      expect(outcome.file.name).toBe('avatar.jpeg');
      expect(outcome.file.size).toBe('photo-bytes'.length);
      expect(mockedCompressAvatar).not.toHaveBeenCalled();
    });

    it('photos source: requests the photos permission and uses the Photos camera source', async () => {
      const { result } = renderHook(() => useNativeCamera());

      const outcome = await result.current.getAvatarPhoto('photos');

      expect(mockedCamera.requestPermissions).toHaveBeenCalledWith({
        permissions: ['photos'],
      });
      expect(mockedCamera.getPhoto).toHaveBeenCalledWith(
        expect.objectContaining({ source: 'PHOTOS' }),
      );
      expect(outcome.outcome).toBe('success');
    });

    it('treats the iOS limited photos permission as granted', async () => {
      mockedCamera.requestPermissions.mockResolvedValue({
        camera: 'prompt',
        photos: 'limited',
      });
      const { result } = renderHook(() => useNativeCamera());

      const outcome = await result.current.getAvatarPhoto('photos');

      expect(mockedCamera.getPhoto).toHaveBeenCalled();
      expect(outcome.outcome).toBe('success');
    });

    it('defaults the file name and MIME type to jpeg when the plugin omits format', async () => {
      mockedCamera.getPhoto.mockResolvedValue({
        base64String: smallBase64,
        format: undefined as unknown as string,
        saved: false,
      });
      const { result } = renderHook(() => useNativeCamera());

      const outcome = await result.current.getAvatarPhoto('camera');

      if (outcome.outcome !== 'success') {
        throw new Error('expected success');
      }
      expect(outcome.file.name).toBe('avatar.jpeg');
      expect(outcome.file.type).toBe('image/jpeg');
    });
  });

  describe('getAvatarPhoto permission denial', () => {
    it('camera denied: returns permission-denied without calling getPhoto', async () => {
      mockedCamera.requestPermissions.mockResolvedValue({
        camera: 'denied',
        photos: 'granted',
      });
      const { result } = renderHook(() => useNativeCamera());

      const outcome = await result.current.getAvatarPhoto('camera');

      expect(outcome).toEqual({
        outcome: 'permission-denied',
        source: 'camera',
      });
      expect(mockedCamera.getPhoto).not.toHaveBeenCalled();
    });

    it('photos denied: returns permission-denied without calling getPhoto', async () => {
      mockedCamera.requestPermissions.mockResolvedValue({
        camera: 'granted',
        photos: 'denied',
      });
      const { result } = renderHook(() => useNativeCamera());

      const outcome = await result.current.getAvatarPhoto('photos');

      expect(outcome).toEqual({
        outcome: 'permission-denied',
        source: 'photos',
      });
      expect(mockedCamera.getPhoto).not.toHaveBeenCalled();
    });

    it('only consults the permission for the requested source', async () => {
      mockedCamera.requestPermissions.mockResolvedValue({
        camera: 'denied',
        photos: 'granted',
      });
      const { result } = renderHook(() => useNativeCamera());

      const outcome = await result.current.getAvatarPhoto('photos');

      expect(outcome.outcome).toBe('success');
    });
  });

  describe('getAvatarPhoto cancellation', () => {
    it.each([
      ['iOS/plugin spelling', 'User cancelled photos app'],
      ['single-l spelling', 'User canceled photos app'],
      ['camera capture cancel', 'CANCELLED'],
    ])(
      'returns canceled when getPhoto rejects with the %s message',
      async (_label, message) => {
        mockedCamera.getPhoto.mockRejectedValue(new Error(message));
        const { result } = renderHook(() => useNativeCamera());

        const outcome = await result.current.getAvatarPhoto('photos');

        expect(outcome).toEqual({ outcome: 'canceled' });
      },
    );

    it('does not treat unrelated rejections as cancellation', async () => {
      const error = new Error('No camera available');
      mockedCamera.getPhoto.mockRejectedValue(error);
      const { result } = renderHook(() => useNativeCamera());

      const outcome = await result.current.getAvatarPhoto('camera');

      expect(outcome).toEqual({ outcome: 'error', error });
    });
  });

  describe('getAvatarPhoto errors', () => {
    it('returns error when requestPermissions rejects', async () => {
      const error = new Error('bridge unavailable');
      mockedCamera.requestPermissions.mockRejectedValue(error);
      const { result } = renderHook(() => useNativeCamera());

      const outcome = await result.current.getAvatarPhoto('camera');

      expect(outcome).toEqual({ outcome: 'error', error });
    });

    it('wraps non-Error rejections in an Error', async () => {
      mockedCamera.getPhoto.mockRejectedValue('exploded');
      const { result } = renderHook(() => useNativeCamera());

      const outcome = await result.current.getAvatarPhoto('camera');

      if (outcome.outcome !== 'error') {
        throw new Error('expected error');
      }
      expect(outcome.error).toBeInstanceOf(Error);
      expect(outcome.error.message).toBe('exploded');
    });
  });

  describe('getAvatarPhoto compression safety net', () => {
    it('compresses an oversize photo and returns the compressed file', async () => {
      mockedCamera.getPhoto.mockResolvedValue({
        base64String: oversizeBase64,
        format: 'jpeg',
        saved: false,
      });
      const compressed = new File(['compressed'], 'avatar.jpg', {
        type: 'image/jpeg',
      });
      mockedCompressAvatar.mockResolvedValue(compressed);
      const { result } = renderHook(() => useNativeCamera());

      const outcome = await result.current.getAvatarPhoto('photos');

      expect(mockedCompressAvatar).toHaveBeenCalledWith({
        file: expect.any(File),
        t: expect.any(Function),
      });
      expect(outcome).toEqual({ outcome: 'success', file: compressed });
    });

    it('compresses non-JPEG/PNG formats even when small', async () => {
      mockedCamera.getPhoto.mockResolvedValue({
        base64String: smallBase64,
        format: 'heic',
        saved: false,
      });
      const compressed = new File(['compressed'], 'avatar.jpg', {
        type: 'image/jpeg',
      });
      mockedCompressAvatar.mockResolvedValue(compressed);
      const { result } = renderHook(() => useNativeCamera());

      const outcome = await result.current.getAvatarPhoto('photos');

      expect(mockedCompressAvatar).toHaveBeenCalledWith({
        file: expect.any(File),
        t: expect.any(Function),
      });
      expect(outcome).toEqual({ outcome: 'success', file: compressed });
    });

    it('does not compress a small PNG', async () => {
      mockedCamera.getPhoto.mockResolvedValue({
        base64String: smallBase64,
        format: 'png',
        saved: false,
      });
      const { result } = renderHook(() => useNativeCamera());

      const outcome = await result.current.getAvatarPhoto('photos');

      expect(mockedCompressAvatar).not.toHaveBeenCalled();
      if (outcome.outcome !== 'success') {
        throw new Error('expected success');
      }
      expect(outcome.file.type).toBe('image/png');
      expect(outcome.file.name).toBe('avatar.png');
    });

    it('returns error when compression gives up', async () => {
      mockedCamera.getPhoto.mockResolvedValue({
        base64String: oversizeBase64,
        format: 'jpeg',
        saved: false,
      });
      const error = new Error(
        'Cannot upload avatar: unable to compress the image below 1MB',
      );
      mockedCompressAvatar.mockRejectedValue(error);
      const { result } = renderHook(() => useNativeCamera());

      const outcome = await result.current.getAvatarPhoto('photos');

      expect(outcome).toEqual({ outcome: 'error', error });
    });
  });
});
