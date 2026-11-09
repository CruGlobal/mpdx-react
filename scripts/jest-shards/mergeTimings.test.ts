import fs from 'fs';
import os from 'os';
import path from 'path';
import {
  mergeTimings,
  readPrevious,
  readTimingFiles,
  refreshTimings,
} from './mergeTimings';

describe('mergeTimings', () => {
  it('takes the median per file and sorts by path', () => {
    const merged = mergeTimings(
      [
        { 'src/b.test.ts': 100, 'src/a.test.ts': 10 },
        { 'src/b.test.ts': 300 },
        { 'src/b.test.ts': 200, 'src/a.test.ts': 15 },
      ],
      {},
      () => true,
    );
    expect(merged).toEqual({ 'src/a.test.ts': 13, 'src/b.test.ts': 200 });
    expect(Object.keys(merged)).toEqual(['src/a.test.ts', 'src/b.test.ts']);
  });

  it('drops measured files that have since been deleted', () => {
    const merged = mergeTimings(
      [{ 'src/kept.test.ts': 5, 'src/deleted.test.ts': 7 }],
      {},
      (file) => file !== 'src/deleted.test.ts',
    );
    expect(merged).toEqual({ 'src/kept.test.ts': 5 });
  });

  it('keeps earlier times for test files no run measured, and drops deleted ones', () => {
    const merged = mergeTimings(
      [{ 'src/measured.test.ts': 50 }],
      {
        'src/measured.test.ts': 10,
        'src/unmeasured.test.ts': 20,
        'src/deleted.test.ts': 30,
      },
      (file) => file !== 'src/deleted.test.ts',
    );
    expect(merged).toEqual({
      'src/measured.test.ts': 50,
      'src/unmeasured.test.ts': 20,
    });
  });
});

describe('readTimingFiles', () => {
  it('reads every .json file below the directory', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'merge-'));
    fs.mkdirSync(path.join(dir, 'jest-timings-0'));
    fs.mkdirSync(path.join(dir, 'jest-timings-1'));
    fs.writeFileSync(
      path.join(dir, 'jest-timings-0', 'jest-timings.json'),
      '{"a.test.ts": 1}',
    );
    fs.writeFileSync(
      path.join(dir, 'jest-timings-1', 'jest-timings.json'),
      '{"b.test.ts": 2}',
    );
    fs.writeFileSync(path.join(dir, 'notes.txt'), 'ignored');

    expect(readTimingFiles(dir)).toEqual(
      expect.arrayContaining([{ 'a.test.ts': 1 }, { 'b.test.ts': 2 }]),
    );
    expect(readTimingFiles(dir)).toHaveLength(2);
  });
});

describe('readPrevious', () => {
  const dir = () => fs.mkdtempSync(path.join(os.tmpdir(), 'previous-'));

  it('starts empty when there is no timings file yet', () => {
    expect(readPrevious(path.join(dir(), 'timings.json'))).toEqual({});
  });

  it('refuses to overwrite a timings file it cannot parse', () => {
    const file = path.join(dir(), 'timings.json');
    fs.writeFileSync(file, '<<<<<<< HEAD');
    expect(() => readPrevious(file)).toThrow();
  });
});

describe('refreshTimings', () => {
  const setup = () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'refresh-'));
    const timingsPath = path.join(dir, 'timings.json');
    fs.mkdirSync(path.join(dir, 'runs', 'jest-timings-0'), { recursive: true });
    return { dir, timingsPath };
  };
  let stdout: jest.SpyInstance;
  let stderr: jest.SpyInstance;
  beforeEach(() => {
    stdout = jest.spyOn(process.stdout, 'write').mockReturnValue(true);
    stderr = jest.spyOn(process.stderr, 'write').mockReturnValue(true);
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('rewrites timings.json from the runs and keeps times for unmeasured test files that still exist', () => {
    const { dir, timingsPath } = setup();
    fs.writeFileSync(
      timingsPath,
      JSON.stringify({
        'scripts/jest-shards/sequencer.test.ts': 40,
        'src/deleted.test.ts': 50,
      }),
    );
    fs.writeFileSync(
      path.join(dir, 'runs', 'jest-timings-0', 'jest-timings.json'),
      JSON.stringify({ 'scripts/jest-shards/repoPath.js': 7 }),
    );

    expect(refreshTimings([path.join(dir, 'runs')], timingsPath)).toBe(0);

    expect(JSON.parse(fs.readFileSync(timingsPath, 'utf8'))).toEqual({
      'scripts/jest-shards/repoPath.js': 7,
      'scripts/jest-shards/sequencer.test.ts': 40,
    });
    expect(stdout).toHaveBeenCalledWith(
      'Wrote 2 test files from 1 timing files; 1 kept their earlier time because no run measured them.\n',
    );
  });

  it('fails without touching timings.json when there are no timing files', () => {
    const { dir, timingsPath } = setup();
    fs.writeFileSync(timingsPath, '{"src/a.test.ts": 1}');

    expect(refreshTimings([path.join(dir, 'runs')], timingsPath)).toBe(1);

    expect(fs.readFileSync(timingsPath, 'utf8')).toBe('{"src/a.test.ts": 1}');
    expect(stderr).toHaveBeenCalledWith(
      expect.stringContaining('No timing files found'),
    );
  });
});
