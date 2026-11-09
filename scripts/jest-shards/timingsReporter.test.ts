import fs from 'fs';
import os from 'os';
import path from 'path';
import TimingsReporter from './timingsReporter';

type Results = Parameters<TimingsReporter['onRunComplete']>[1];

const results = {
  testResults: [
    { testFilePath: '/repo/src/a.test.tsx', perfStats: { runtime: 1234 } },
    { testFilePath: '/repo/pages/b.test.ts', perfStats: { runtime: 56 } },
    { testFilePath: '/repo/src/broken.test.ts', perfStats: { runtime: 0 } },
  ],
} as unknown as Results;

describe('TimingsReporter', () => {
  const originalFile = process.env.JEST_TIMINGS_FILE;
  afterEach(() => {
    if (originalFile === undefined) {
      delete process.env.JEST_TIMINGS_FILE;
    } else {
      process.env.JEST_TIMINGS_FILE = originalFile;
    }
    jest.restoreAllMocks();
  });

  it('writes each file runtime in milliseconds, keyed by path from rootDir', () => {
    const file = path.join(
      fs.mkdtempSync(path.join(os.tmpdir(), 'reporter-')),
      'jest-timings.json',
    );
    process.env.JEST_TIMINGS_FILE = file;

    new TimingsReporter({ rootDir: '/repo' }).onRunComplete(new Set(), results);

    expect(JSON.parse(fs.readFileSync(file, 'utf8'))).toEqual({
      'pages/b.test.ts': 56,
      'src/a.test.tsx': 1234,
    });
  });

  it('writes nothing when JEST_TIMINGS_FILE is not set', () => {
    delete process.env.JEST_TIMINGS_FILE;
    const writeFile = jest.spyOn(fs, 'writeFileSync');

    new TimingsReporter({ rootDir: '/repo' }).onRunComplete(new Set(), results);

    expect(writeFile).not.toHaveBeenCalled();
  });
});
