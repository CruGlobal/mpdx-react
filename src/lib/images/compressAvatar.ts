import { TFunction } from 'react-i18next';

// The /api/uploads/upload-person-avatar lambda truncates the request body at
// 2^20 bytes. 1MB is conservatively a little lower than 1MiB to leave room for
// the multipart/form-data encoding overhead and the other fields in the POST
// body. This is the single source of truth for the avatar size limit
// (validateAvatar imports it).
export const MAX_AVATAR_BYTES = 1_000_000;

// Maximum edge length for an avatar; larger bitmaps are downscaled into this
// bounding box before the compression ladder starts.
const MAX_AVATAR_EDGE_PX = 1024;

const QUALITY_STEPS = [0.85, 0.75, 0.65, 0.55];
const DIMENSION_SCALE_FACTOR = 0.75;
const MAX_DIMENSION_REDUCTIONS = 3;

export interface CompressionStep {
  /** JPEG encoding quality for this attempt */
  quality: number;
  /** Cumulative dimension scale relative to the (already capped) source size */
  scale: number;
  /** How many times dimensions have been reduced so far */
  dimensionReductions: number;
}

/**
 * Pure compression ladder: quality descends 0.85 → 0.75 → 0.65 → 0.55, then
 * dimensions scale by 0.75 and the quality ladder restarts. Returns `null`
 * (give up) once 3 dimension reductions are exhausted at the lowest quality.
 * Pass `null` to get the first step.
 */
export const nextCompressionStep = (
  current: CompressionStep | null,
): CompressionStep | null => {
  if (current === null) {
    return { quality: QUALITY_STEPS[0], scale: 1, dimensionReductions: 0 };
  }

  const qualityIndex = QUALITY_STEPS.indexOf(current.quality);
  if (qualityIndex !== -1 && qualityIndex < QUALITY_STEPS.length - 1) {
    return { ...current, quality: QUALITY_STEPS[qualityIndex + 1] };
  }

  if (current.dimensionReductions >= MAX_DIMENSION_REDUCTIONS) {
    return null;
  }
  return {
    quality: QUALITY_STEPS[0],
    scale: current.scale * DIMENSION_SCALE_FACTOR,
    dimensionReductions: current.dimensionReductions + 1,
  };
};

const renderJpegBlob = (
  bitmap: ImageBitmap,
  scale: number,
  quality: number,
): Promise<Blob | null> => {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext('2d');
  if (!context) {
    return Promise.resolve(null);
  }
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', quality);
  });
};

/**
 * Canvas-based safety net for native camera/library photos: re-encodes the
 * image to JPEG under `MAX_AVATAR_BYTES`, walking the `nextCompressionStep`
 * ladder. Throws a localized error if the image cannot be compressed under
 * the limit (surfaced by the caller as the existing avatar-error snackbar).
 */
export const compressAvatar = async ({
  file,
  t,
}: {
  file: File;
  t: TFunction;
}): Promise<File> => {
  const bitmap = await createImageBitmap(file);
  try {
    const maxEdge = Math.max(bitmap.width, bitmap.height);
    const baseScale =
      maxEdge > MAX_AVATAR_EDGE_PX ? MAX_AVATAR_EDGE_PX / maxEdge : 1;

    let step = nextCompressionStep(null);
    while (step !== null) {
      const blob = await renderJpegBlob(
        bitmap,
        baseScale * step.scale,
        step.quality,
      );
      if (blob && blob.size <= MAX_AVATAR_BYTES) {
        const baseName = file.name.replace(/\.[^.]*$/, '');
        return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' });
      }
      step = nextCompressionStep(step);
    }
  } finally {
    bitmap.close();
  }

  throw new Error(
    t('Cannot upload avatar: unable to compress the image below 1MB'),
  );
};
