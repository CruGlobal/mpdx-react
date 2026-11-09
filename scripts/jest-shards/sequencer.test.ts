import fs from 'fs';
import os from 'os';
import path from 'path';
import DefaultSequencer from '@jest/test-sequencer';
import DurationSequencer, {
  loadTimings,
  planShards,
  weighFiles,
} from './sequencer';

type Test = Parameters<DefaultSequencer['sort']>[0][number];

const files = (count: number) =>
  Array.from({ length: count }, (_, index) => `src/file${index}.test.tsx`);

const timingsFor = (paths: string[]) =>
  Object.fromEntries(paths.map((file, index) => [file, (index * 37) % 101]));

const expectEachFileOnce = (shards: string[][], paths: string[]) => {
  const all = shards.flat();
  expect(new Set(all).size).toBe(all.length);
  expect([...all].sort()).toEqual([...paths].sort());
};

describe('weighFiles', () => {
  it('uses the timing for known files and the mean for new ones', () => {
    const weights = weighFiles(['a', 'b', 'new'], { a: 100, b: 301, gone: 5 });
    expect(weights).toEqual(
      new Map([
        ['a', 100],
        ['b', 301],
        ['new', 201],
      ]),
    );
  });

  it('weighs zero-millisecond files as 1 so they still spread across shards', () => {
    const weights = weighFiles(['a', 'b', 'c'], { a: 0, b: 0, c: 0 });
    expect(weights).toEqual(
      new Map([
        ['a', 1],
        ['b', 1],
        ['c', 1],
      ]),
    );
    expect(planShards(weights, 3)).toEqual([['a'], ['b'], ['c']]);
  });

  it('weighs every file the same when none are known', () => {
    expect(weighFiles(['a', 'b'], { gone: 5 })).toEqual(
      new Map([
        ['a', 1],
        ['b', 1],
      ]),
    );
  });
});

describe('planShards', () => {
  it('puts every file in exactly one shard', () => {
    const paths = files(921);
    const shards = planShards(weighFiles(paths, timingsFor(paths)), 12);
    expect(shards).toHaveLength(12);
    expectEachFileOnce(shards, paths);
  });

  it('includes files missing from the timings', () => {
    const paths = files(50);
    const timings = timingsFor(paths.slice(0, 20));
    const shards = planShards(weighFiles(paths, timings), 7);
    expect(shards).toHaveLength(7);
    expectEachFileOnce(shards, paths);
  });

  it('gives the same shards whatever order the files arrive in', () => {
    const paths = files(200);
    const timings = timingsFor(paths);
    const shuffled = [...paths].sort((a, b) =>
      a.split('').reverse().join('').localeCompare(b),
    );
    expect(planShards(weighFiles(shuffled, timings), 12)).toEqual(
      planShards(weighFiles(paths, timings), 12),
    );
  });

  it('balances the shards by weight, not by count', () => {
    const weights = new Map([
      ['slow', 90],
      ['medium1', 50],
      ['medium2', 40],
      ['fast1', 10],
      ['fast2', 10],
      ['fast3', 10],
    ]);
    expect(planShards(weights, 2)).toEqual([
      ['slow', 'fast1', 'fast3'],
      ['medium1', 'medium2', 'fast2'],
    ]);
  });

  it('keeps the shard count when there are fewer files than shards', () => {
    expect(planShards(new Map([['only', 5]]), 3)).toEqual([['only'], [], []]);
  });
});

describe('loadTimings', () => {
  const write = (contents: string) => {
    const file = path.join(
      fs.mkdtempSync(path.join(os.tmpdir(), 'timings-')),
      'timings.json',
    );
    fs.writeFileSync(file, contents);
    return file;
  };

  it('reads a map of file to milliseconds', () => {
    expect(loadTimings(write('{"a.test.ts": 12, "b.test.ts": 0}'))).toEqual({
      'a.test.ts': 12,
      'b.test.ts': 0,
    });
  });

  it.each([
    ['is missing', path.join(os.tmpdir(), 'no-such-dir', 'timings.json')],
    ['is not JSON', write('{oops')],
    ['is empty', write('{}')],
    ['is an array', write('[1, 2]')],
    ['has a negative time', write('{"a.test.ts": -1}')],
    ['has a string time', write('{"a.test.ts": "12"}')],
  ])('returns null when the file %s', (_, file) => {
    expect(loadTimings(file)).toBeNull();
  });
});

describe('DurationSequencer', () => {
  const rootDir = '/repo';
  const makeTests = (paths: string[]) =>
    paths.map(
      (file) =>
        ({
          path: path.join(rootDir, file),
          context: { config: { rootDir } },
        }) as unknown as Test,
    );
  const relative = (tests: Test[]) =>
    tests.map((test) => path.relative(rootDir, test.path));

  let stderr: jest.SpyInstance;
  beforeEach(() => {
    stderr = jest.spyOn(process.stderr, 'write').mockReturnValue(true);
  });
  afterEach(() => {
    stderr.mockRestore();
  });

  it('splits by the committed timings and sorts each shard longest first', async () => {
    const tests = makeTests(['a.test.ts', 'b.test.ts', 'c.test.ts']);
    const sequencer = new DurationSequencer();
    sequencer.readTimings = () => ({
      'a.test.ts': 10,
      'b.test.ts': 30,
      'c.test.ts': 15,
    });

    const first = await sequencer.shard(tests, {
      shardIndex: 1,
      shardCount: 2,
    });
    const second = await sequencer.shard(tests, {
      shardIndex: 2,
      shardCount: 2,
    });

    expect(relative(first)).toEqual(['b.test.ts']);
    const sorted = await sequencer.sort([...second].reverse());
    expect(relative(sorted)).toEqual(['c.test.ts', 'a.test.ts']);
    expect(sorted.map((test) => test.duration)).toEqual([15, 10]);
  });

  it("falls back to Jest's own split when there are no timings", async () => {
    const tests = makeTests(files(30));
    const options = { shardIndex: 2, shardCount: 3 };
    const sequencer = new DurationSequencer();
    sequencer.readTimings = () => null;

    expect(await sequencer.shard(tests, options)).toEqual(
      await new DefaultSequencer().shard(tests, options),
    );
    expect(stderr).toHaveBeenCalledWith(
      expect.stringContaining('falling back'),
    );
  });

  it("uses Jest's own sort when it did not shard by timings", async () => {
    const tests = makeTests(['a.test.ts', 'b.test.ts']);
    const defaultSort = jest
      .spyOn(DefaultSequencer.prototype, 'sort')
      .mockReturnValue(tests);

    expect(await new DurationSequencer().sort(tests)).toBe(tests);
    expect(defaultSort).toHaveBeenCalledWith(tests);
    defaultSort.mockRestore();
  });

  it('has a usable committed timings file', () => {
    const committed = loadTimings(
      path.join(__dirname, 'timings.json'),
    ) as Record<string, number>;
    expect(Object.keys(committed).length).toBeGreaterThan(0);
  });
});
