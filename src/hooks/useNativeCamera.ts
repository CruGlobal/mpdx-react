import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { base64ToFile } from 'src/lib/images/base64ToFile';
import {
  MAX_AVATAR_BYTES,
  compressAvatar,
} from 'src/lib/images/compressAvatar';
import { isNativeShell } from 'src/lib/nativeShell/nativeShell';
import type { Photo } from '@capacitor/camera';

export type NativePhotoSource = 'camera' | 'photos';

export type NativePhotoResult =
  | { outcome: 'success'; file: File }
  | { outcome: 'canceled' }
  | { outcome: 'permission-denied'; source: NativePhotoSource }
  | { outcome: 'error'; error: Error };

export interface UseNativeCameraResult {
  /** True inside the Capacitor native shell; consumers must gate on this. */
  isNative: boolean;
  /**
   * Requests permission for `source`, captures/picks a photo, and converts it
   * to a `File` ready for the existing avatar pipeline (`setAvatar`). Never
   * throws — every outcome is encoded in the discriminated result.
   */
  getAvatarPhoto: (source: NativePhotoSource) => Promise<NativePhotoResult>;
}

// The plugin rejects with messages like 'User cancelled photos app' when the
// user backs out of the camera/picker; spelling varies by platform.
const cancellationRegex = /cancell?ed/i;

// Formats the avatar pipeline accepts as-is; anything else (or anything over
// the size limit) goes through the canvas-based compression safety net.
const passthroughMimeTypes = ['image/jpeg', 'image/png'];

const toError = (value: unknown): Error =>
  value instanceof Error ? value : new Error(String(value));

/**
 * Native camera/photo-library capture for contact avatars
 * (camera-contact-photo design §4.1). `@capacitor/camera` is loaded via
 * dynamic `import()` so plugin code never lands in the web bundle; the hook is
 * only reachable when `isNative` is true.
 */
export const useNativeCamera = (): UseNativeCameraResult => {
  const { t } = useTranslation();

  const getAvatarPhoto = useCallback(
    async (source: NativePhotoSource): Promise<NativePhotoResult> => {
      try {
        const { Camera, CameraResultType, CameraSource } = await import(
          /* webpackChunkName: "CapacitorCamera" */ '@capacitor/camera'
        );

        const status = await Camera.requestPermissions({
          permissions: [source],
        });
        const state = status[source];
        // 'limited' is iOS limited photo selection — the picker still works.
        if (state !== 'granted' && state !== 'limited') {
          return { outcome: 'permission-denied', source };
        }

        let photo: Photo;
        try {
          photo = await Camera.getPhoto({
            // Base64, not Uri: under server.url the _capacitor_file_ webPath
            // interception is unreliable on iOS; base64 crosses the bridge
            // directly and is origin-independent (design §3.2).
            resultType: CameraResultType.Base64,
            source:
              source === 'camera' ? CameraSource.Camera : CameraSource.Photos,
            quality: 85,
            width: 1024,
            height: 1024, // max bounding box; aspect ratio preserved
            correctOrientation: true, // EXIF rotation baked in
            allowEditing: false,
            saveToGallery: false,
          });
        } catch (error) {
          if (cancellationRegex.test(toError(error).message)) {
            return { outcome: 'canceled' };
          }
          throw error;
        }

        const format = photo.format ?? 'jpeg';
        let file = base64ToFile(
          photo.base64String ?? '',
          `image/${format}`,
          `avatar.${format}`,
        );
        if (
          file.size > MAX_AVATAR_BYTES ||
          !passthroughMimeTypes.includes(file.type)
        ) {
          file = await compressAvatar({ file, t });
        }
        return { outcome: 'success', file };
      } catch (error) {
        return { outcome: 'error', error: toError(error) };
      }
    },
    [t],
  );

  return { isNative: isNativeShell(), getAvatarPhoto };
};
