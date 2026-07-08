import { ReactElement } from 'react';
import { waitFor } from '@testing-library/dom';
import { renderHook } from '@testing-library/react-hooks';
import { NsoMpdQuestionnaireTestWrapper } from '../NsoMpdQuestionnaireTestWrapper';
import { MinistriesQuery } from './Ministries.generated';
import { flattenMinistries, useOneAppMinistries } from './useOneAppMinistries';

const ministries: MinistriesQuery['ministries'] = [
  {
    id: 'campus',
    name: 'Campus Ministry',
    children: [
      { id: 'univ', name: 'University' },
      { id: 'hs', name: 'High School' },
    ],
  },
  {
    id: 'other',
    name: 'Other Ministries',
    children: [
      { id: 'film', name: 'Jesus Film Project' },
      { id: 'other', name: 'Other' },
    ],
  },
  { id: 'aia', name: 'Athletes in Action', children: [] },
  {
    id: 'city',
    name: 'City',
    children: [{ id: 'nyc', name: 'New York City' }],
  },
];

describe('flattenMinistries', () => {
  it('expands allowlisted roots and sorts alphabetically with "Other" pinned last', () => {
    expect(flattenMinistries(ministries)).toEqual([
      { id: 'aia', name: 'Athletes in Action' },
      { id: 'city', name: 'City' },
      { id: 'hs', name: 'High School' },
      { id: 'film', name: 'Jesus Film Project' },
      { id: 'univ', name: 'University' },
      { id: 'other', name: 'Other' },
    ]);
  });

  it('keeps non-allowlisted roots as single options even when they have children', () => {
    const result = flattenMinistries(ministries);
    expect(result).toContainEqual({ id: 'city', name: 'City' });
    expect(result).not.toContainEqual({ id: 'nyc', name: 'New York City' });
  });

  it('drops ministries without a name', () => {
    const withNulls: MinistriesQuery['ministries'] = [
      { id: 'nameless-root', name: null, children: [] },
      {
        id: 'campus',
        name: 'Campus Ministry',
        children: [
          { id: 'univ', name: 'University' },
          { id: 'nameless-child', name: null },
        ],
      },
    ];
    expect(flattenMinistries(withNulls)).toEqual([
      { id: 'univ', name: 'University' },
    ]);
  });
});

describe('useOneAppMinistries', () => {
  const wrapper = ({ children }: { children: ReactElement }) => (
    <NsoMpdQuestionnaireTestWrapper>{children}</NsoMpdQuestionnaireTestWrapper>
  );

  it('returns an empty list while loading', () => {
    const { result } = renderHook(() => useOneAppMinistries(), { wrapper });

    expect(result.current).toEqual({ ministries: [], loading: true });
  });

  it('flattens and sorts the ministries once the query resolves', async () => {
    const { result } = renderHook(() => useOneAppMinistries(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.ministries.map((ministry) => ministry.name)).toEqual([
      'Athletes in Action',
      'High School',
      'Jesus Film Project',
      'University',
    ]);
  });
});
