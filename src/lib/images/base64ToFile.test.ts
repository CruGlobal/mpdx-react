import { base64ToFile } from './base64ToFile';

// jsdom does not implement Blob.prototype.arrayBuffer, so read via FileReader
const readFileBytes = (file: File): Promise<Uint8Array> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });

describe('base64ToFile', () => {
  it('decodes base64 into a File with byte-exact contents, name, and MIME type', async () => {
    // Includes non-ASCII bytes to prove the decode is binary-safe, not text-based
    const bytes = new Uint8Array([
      0x00, 0x01, 0x7f, 0x80, 0xfe, 0xff, 0x4d, 0x50, 0x44, 0x58,
    ]);
    const base64 = btoa(String.fromCharCode(...bytes));

    const file = base64ToFile(base64, 'image/jpeg', 'avatar.jpeg');

    expect(file).toBeInstanceOf(File);
    expect(file.name).toBe('avatar.jpeg');
    expect(file.type).toBe('image/jpeg');
    expect(file.size).toBe(bytes.length);
    expect(await readFileBytes(file)).toEqual(bytes);
  });

  it('round-trips a known base64 string byte-exactly', async () => {
    // 'SGVsbG8sIE1QRFgh' is the base64 encoding of 'Hello, MPDX!'
    const expected = Uint8Array.from('Hello, MPDX!', (char) =>
      char.charCodeAt(0),
    );

    const file = base64ToFile('SGVsbG8sIE1QRFgh', 'image/png', 'avatar.png');

    expect(file.type).toBe('image/png');
    expect(await readFileBytes(file)).toEqual(expected);
  });

  it('returns an empty file for an empty base64 string without throwing', () => {
    const file = base64ToFile('', 'image/jpeg', 'avatar.jpeg');

    expect(file.size).toBe(0);
    expect(file.name).toBe('avatar.jpeg');
    expect(file.type).toBe('image/jpeg');
  });
});
