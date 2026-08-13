import { v2 } from '@datadog/datadog-api-client';
import { fetchBaselineSeries, parseTimeseriesBuckets } from './aggregate';
import { signalByKey } from './signals';
import { percentile } from './stats';

describe('parseTimeseriesBuckets', () => {
  it('extracts one value per bucket', () => {
    const response: v2.RUMAnalyticsAggregateResponse = {
      data: {
        buckets: [
          {
            computes: {
              c0: [{ time: new Date('2026-08-01T00:00:00Z'), value: 3 }],
            },
          },
        ],
      },
    };
    expect(parseTimeseriesBuckets(response)).toEqual([3]);
  });

  it('returns an empty series for an empty response', () => {
    expect(parseTimeseriesBuckets({})).toEqual([]);
  });

  it('throws on a scalar compute rather than calibrating off one point', () => {
    expect(() =>
      parseTimeseriesBuckets({ data: { buckets: [{ computes: { c0: 7 } }] } }),
    ).toThrow('expected a timeseries compute');
  });
});

const mockApi = (response: unknown): v2.RUMApi =>
  ({
    aggregateRUMEvents: jest.fn().mockResolvedValue(response),
  }) as unknown as v2.RUMApi;

const timeseriesResponse = (values: number[]): unknown => ({
  data: {
    buckets: [
      {
        computes: {
          c0: values.map((value, index) => ({
            time: new Date(index * 60_000),
            value,
          })),
        },
      },
    ],
  },
});

describe('fetchBaselineSeries', () => {
  it("buckets by the signal's own monitorWindow, not a fixed hour", async () => {
    const api = mockApi(timeseriesResponse([1]));

    await fetchBaselineSeries(api, signalByKey('errorImpact'), 30);

    expect(api.aggregateRUMEvents).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          compute: [
            {
              aggregation: 'cardinality',
              metric: '@usr.id',
              interval: '15m',
              type: 'timeseries',
            },
          ],
          filter: expect.objectContaining({ from: 'now-30d', to: 'now' }),
        }),
      }),
    );
  });

  it('omits the metric for a rollup with no facet', async () => {
    const api = mockApi(timeseriesResponse([1]));

    await fetchBaselineSeries(api, signalByKey('frustration'), 30);

    expect(api.aggregateRUMEvents).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          compute: [
            { aggregation: 'count', interval: '1h', type: 'timeseries' },
          ],
        }),
      }),
    );
  });

  it('throws on a response with no buckets instead of zero-filling a whole grid', async () => {
    const api = mockApi({ data: { buckets: [] } });

    await expect(
      fetchBaselineSeries(api, signalByKey('errorImpact'), 28),
    ).rejects.toThrow('the query matches nothing');
  });

  it('zero-fills buckets Datadog omits so percentiles see the full grid', async () => {
    // errorImpact buckets at 15m: 1 day = 96 intervals, 97 aligned buckets
    const api = mockApi(timeseriesResponse([4, 2]));

    const { series, observed, expected } = await fetchBaselineSeries(
      api,
      signalByKey('errorImpact'),
      1,
    );

    expect(series).toHaveLength(97);
    expect(series.filter((value) => value === 0)).toHaveLength(95);
    // The gaps must drag percentiles down: sparse median is 3, filled is 0
    expect(percentile(series, 50)).toBe(0);
    // The real coverage survives the fill, so callers can report it
    expect({ observed, expected }).toEqual({ observed: 2, expected: 97 });
  });

  it('leaves gauge series unfilled because a missing bucket is no measurement', async () => {
    const api = mockApi(timeseriesResponse([5.1e9, 4.2e9, 3.3e9]));

    const { series, observed, expected } = await fetchBaselineSeries(
      api,
      signalByKey('perf'),
      1,
    );

    expect(series).toEqual([5.1e9, 4.2e9, 3.3e9]);
    expect({ observed, expected }).toEqual({ observed: 3, expected: 13 });
  });
});
