import {
  CompressionStep,
  MAX_AVATAR_BYTES,
  compressAvatar,
  nextCompressionStep,
} from './compressAvatar';

const t = (message: string) => message;

describe('MAX_AVATAR_BYTES', () => {
  it('is 1,000,000 bytes (the upload lambda truncation limit)', () => {
    expect(MAX_AVATAR_BYTES).toBe(1_000_000);
  });
});

describe('nextCompressionStep', () => {
  const collectLadder = (): CompressionStep[] => {
    const steps: CompressionStep[] = [];
    let step = nextCompressionStep(null);
    while (step !== null) {
      steps.push(step);
      step = nextCompressionStep(step);
    }
    return steps;
  };

  it('starts at quality 0.85 with full dimensions', () => {
    expect(nextCompressionStep(null)).toEqual({
      quality: 0.85,
      scale: 1,
      dimensionReductions: 0,
    });
  });

  it('steps quality down 0.85 → 0.75 → 0.65 → 0.55 before touching dimensions', () => {
    const firstFour = collectLadder().slice(0, 4);

    expect(firstFour.map((step) => step.quality)).toEqual([
      0.85, 0.75, 0.65, 0.55,
    ]);
    expect(firstFour.every((step) => step.scale === 1)).toBe(true);
    expect(firstFour.every((step) => step.dimensionReductions === 0)).toBe(
      true,
    );
  });

  it('scales dimensions by 0.75 and restarts the quality ladder once quality is exhausted', () => {
    expect(
      nextCompressionStep({ quality: 0.55, scale: 1, dimensionReductions: 0 }),
    ).toEqual({ quality: 0.85, scale: 0.75, dimensionReductions: 1 });
  });

  it('gives up (null) after 3 dimension reductions at the lowest quality', () => {
    expect(
      nextCompressionStep({
        quality: 0.55,
        scale: 0.421875,
        dimensionReductions: 3,
      }),
    ).toBeNull();
  });

  it('produces the full 16-step ladder (4 qualities × 4 dimension levels) then gives up', () => {
    const steps = collectLadder();

    expect(steps).toHaveLength(16);
    expect(steps.map((step) => step.quality)).toEqual([
      0.85, 0.75, 0.65, 0.55, 0.85, 0.75, 0.65, 0.55, 0.85, 0.75, 0.65, 0.55,
      0.85, 0.75, 0.65, 0.55,
    ]);
    expect(steps.map((step) => step.scale)).toEqual([
      1, 1, 1, 1, 0.75, 0.75, 0.75, 0.75, 0.5625, 0.5625, 0.5625, 0.5625,
      0.421875, 0.421875, 0.421875, 0.421875,
    ]);
    expect(steps[15]).toEqual({
      quality: 0.55,
      scale: 0.421875,
      dimensionReductions: 3,
    });
  });
});

describe('compressAvatar', () => {
  const file = new File([new Uint8Array(2_000_000)], 'photo.png', {
    type: 'image/png',
  });

  const closeBitmap = jest.fn();
  const drawImage = jest.fn();
  let toBlobQualities: Array<number | undefined>;
  let canvasSizes: Array<{ width: number; height: number }>;

  const mockBitmap = (width: number, height: number) => {
    window.createImageBitmap = jest.fn().mockResolvedValue({
      width,
      height,
      close: closeBitmap,
    }) as unknown as typeof window.createImageBitmap;
  };

  // blobSizes[i] is the size of the blob produced by the i-th toBlob call; the
  // last entry repeats for any further calls
  const mockToBlob = (blobSizes: number[]) => {
    let call = 0;
    jest
      .spyOn(HTMLCanvasElement.prototype, 'toBlob')
      .mockImplementation(function (this: HTMLCanvasElement, callback, _type, quality) {
        toBlobQualities.push(quality as number | undefined);
        canvasSizes.push({ width: this.width, height: this.height });
        const size = blobSizes[Math.min(call, blobSizes.length - 1)];
        call++;
        callback(new Blob([new Uint8Array(size)], { type: 'image/jpeg' }));
      });
  };

  beforeEach(() => {
    toBlobQualities = [];
    canvasSizes = [];
    jest
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue({ drawImage } as unknown as CanvasRenderingContext2D);
    mockBitmap(2048, 1536);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns a JPEG file from the first attempt when it fits, capped at a 1024px max edge', async () => {
    mockToBlob([500_000]);

    const result = await compressAvatar({ file, t });

    expect(result.type).toBe('image/jpeg');
    expect(result.name).toBe('photo.jpg');
    expect(result.size).toBe(500_000);
    expect(toBlobQualities).toEqual([0.85]);
    // 2048x1536 capped to a 1024 max edge => 1024x768
    expect(canvasSizes).toEqual([{ width: 1024, height: 768 }]);
  });

  it('does not upscale bitmaps already within the 1024px bounding box', async () => {
    mockBitmap(512, 384);
    mockToBlob([100_000]);

    await compressAvatar({ file, t });

    expect(canvasSizes).toEqual([{ width: 512, height: 384 }]);
  });

  it('walks the quality ladder, then reduces dimensions, until a blob fits', async () => {
    // First four qualities at full size are oversize, and the first attempt at
    // reduced dimensions is too — succeeds on the 6th attempt
    mockToBlob([
      MAX_AVATAR_BYTES + 1,
      MAX_AVATAR_BYTES + 1,
      MAX_AVATAR_BYTES + 1,
      MAX_AVATAR_BYTES + 1,
      MAX_AVATAR_BYTES + 1,
      900_000,
    ]);

    const result = await compressAvatar({ file, t });

    expect(result.size).toBe(900_000);
    expect(toBlobQualities).toEqual([0.85, 0.75, 0.65, 0.55, 0.85, 0.75]);
    expect(canvasSizes[4]).toEqual({ width: 768, height: 576 });
    expect(canvasSizes[5]).toEqual({ width: 768, height: 576 });
  });

  it('throws a localized error after the ladder is exhausted (16 attempts)', async () => {
    mockToBlob([MAX_AVATAR_BYTES + 1]);

    await expect(compressAvatar({ file, t })).rejects.toThrow(
      'Cannot upload avatar: unable to compress the image below 1MB',
    );
    expect(toBlobQualities).toHaveLength(16);
  });

  it('closes the image bitmap after use', async () => {
    mockToBlob([100_000]);

    await compressAvatar({ file, t });

    expect(closeBitmap).toHaveBeenCalled();
  });

  it('closes the image bitmap even when compression fails', async () => {
    mockToBlob([MAX_AVATAR_BYTES + 1]);

    await expect(compressAvatar({ file, t })).rejects.toThrow();

    expect(closeBitmap).toHaveBeenCalled();
  });
});
