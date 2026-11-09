import fs from 'fs';
import os from 'os';
import path from 'path';
import { mergeTimings, readPrevious, readTimingFiles } from './mergeTimings';

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
