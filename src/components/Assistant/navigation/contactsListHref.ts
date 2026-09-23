import { DateTime } from 'luxon';
import {
  ContactFilterPledgeReceivedEnum,
  ContactFilterSetInput,
  ContactFilterStatusEnum,
  DateRangeInput,
} from 'src/graphql/types.generated';
import { getDateRange } from './dateRanges';
import {
  PLEDGE_FREQUENCY_FILTER_VALUES,
  STATUS_FILTER_VALUES,
  getNewsletterFilterValue,
} from './filterValues';
import {
  FILTER_PRESETS,
  FilterPreset,
  LATE_PRESETS,
  NEWSLETTER_VALUES,
  PLEDGE_FREQUENCIES,
  RANGES,
  Range,
  STATUSES,
} from './intents';
import {
  Params,
  hasOnlyKeys,
  isListOf,
  isOneOf,
  isPlainObject,
} from './params';
import { NavigationBuilder } from './types';

type LatePreset = (typeof LATE_PRESETS)[number];

const LATE_BY_DAYS: Record<LatePreset, number> = {
  late_by_30: 30,
  late_by_60: 60,
  late_by_90: 90,
};

// These always end inside the last month, which the API rejects for stopped giving
const UNSUPPORTED_STOPPED_GIVING_RANGES: Range[] = [
  'last_30_days',
  'this_month',
];

const isLatePreset = (preset: string): preset is LatePreset =>
  (LATE_PRESETS as readonly string[]).includes(preset);

const unique = <T>(values: T[]): T[] => Array.from(new Set(values));

// Stopped giving means the last gift fell in the range, and the API only accepts ranges ending a month ago or earlier
const getStoppedGivingRange = (
  range: unknown,
  now: DateTime,
): DateRangeInput | null => {
  if (range !== undefined && !isOneOf(range, RANGES)) {
    return null;
  }
  if (range && UNSUPPORTED_STOPPED_GIVING_RANGES.includes(range)) {
    return null;
  }
  const latestEnd = now.startOf('day').minus({ months: 1 });
  const { min, max } = range
    ? getDateRange(range, now)
    : { min: now.startOf('day').minus({ years: 1 }), max: latestEnd };
  const end = max < latestEnd ? max : latestEnd;
  if (end < min) {
    return null;
  }
  return { min: min.toISODate(), max: end.toISODate() };
};

const applyPreset = (
  filters: ContactFilterSetInput,
  name: FilterPreset,
  params: Params,
  now: DateTime,
): boolean => {
  if (isLatePreset(name)) {
    if (!hasOnlyKeys(params, [])) {
      return false;
    }
    // Matches the dashboard's Late Commitments link: received pledges at least N days late, not the Late By bands
    filters.lateAt = {
      min: '1970-01-01',
      max: now.minus({ days: LATE_BY_DAYS[name] }).toISODate(),
    };
    return true;
  }

  if (name === 'stopped_giving') {
    if (!hasOnlyKeys(params, ['range'])) {
      return false;
    }
    const range = getStoppedGivingRange(params.range, now);
    if (!range) {
      return false;
    }
    filters.stoppedGivingRange = range;
    return true;
  }

  if (!hasOnlyKeys(params, ['values'])) {
    return false;
  }
  const { values } = params;
  switch (name) {
    case 'status_in':
      if (!isListOf(values, STATUSES)) {
        return false;
      }
      filters.status = unique(values).map(
        (value) => STATUS_FILTER_VALUES[value],
      );
      return true;
    case 'newsletter_in': {
      if (!isListOf(values, NEWSLETTER_VALUES)) {
        return false;
      }
      const newsletter = getNewsletterFilterValue(values);
      if (!newsletter) {
        return false;
      }
      filters.newsletter = newsletter;
      return true;
    }
    case 'pledge_frequency_in':
      if (!isListOf(values, PLEDGE_FREQUENCIES)) {
        return false;
      }
      filters.pledgeFrequency = unique(values).map(
        (value) => PLEDGE_FREQUENCY_FILTER_VALUES[value],
      );
      return true;
  }
};

export const buildContactsListHref: NavigationBuilder = (
  params,
  { basePath, now },
) => {
  if (!hasOnlyKeys(params, ['presets'])) {
    return null;
  }
  const presets = params.presets ?? [];
  if (!Array.isArray(presets)) {
    return null;
  }

  const filters: ContactFilterSetInput = {};
  const seen = new Set<FilterPreset>();
  for (const preset of presets) {
    if (!isPlainObject(preset)) {
      return null;
    }
    const { preset: name, ...presetParams } = preset;
    if (!isOneOf(name, FILTER_PRESETS) || seen.has(name)) {
      return null;
    }
    if (isLatePreset(name) && Array.from(seen).some(isLatePreset)) {
      return null;
    }
    seen.add(name);
    if (!applyPreset(filters, name, presetParams, now)) {
      return null;
    }
  }

  if (Array.from(seen).some(isLatePreset)) {
    const financial = ContactFilterStatusEnum.PartnerFinancial;
    if (filters.status && !filters.status.includes(financial)) {
      return null;
    }
    filters.status = [financial];
    filters.pledgeReceived = ContactFilterPledgeReceivedEnum.Received;
  }

  const path = `${basePath}/contacts`;
  return Object.keys(filters).length
    ? `${path}?filters=${encodeURIComponent(JSON.stringify(filters))}`
    : path;
};
