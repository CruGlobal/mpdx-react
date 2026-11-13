import React from 'react';
import { render } from '@testing-library/react';
import {
  desktopWidth,
  getGridColumnsAtWidth,
  phoneWidth,
} from '__tests__/util/styleAtWidth';
import { NameDisplaySkeleton } from './NameDisplaySkeleton';

describe('NameDisplaySkeleton', () => {
  it('renders the amounts row with showContent', () => {
    const { getByTestId } = render(<NameDisplaySkeleton showContent />);
    expect(getByTestId('name-display-skeleton-amounts')).toBeInTheDocument();
  });

  it('renders three amount columns when asked', () => {
    const { getAllByTestId } = render(
      <NameDisplaySkeleton showContent columns={3} />,
    );
    expect(getAllByTestId('name-display-skeleton-column')).toHaveLength(3);
  });

  it('renders only the header without showContent', () => {
    const { getByTestId, queryByTestId } = render(<NameDisplaySkeleton />);
    expect(getByTestId('name-display-skeleton')).toBeInTheDocument();
    expect(
      queryByTestId('name-display-skeleton-amounts'),
    ).not.toBeInTheDocument();
  });

  it('stacks the two default columns on a phone, like the loaded card', () => {
    const { getAllByTestId } = render(<NameDisplaySkeleton showContent />);
    const columns = getAllByTestId('name-display-skeleton-column');

    expect(columns).toHaveLength(2);
    columns.forEach((column) => {
      expect(getGridColumnsAtWidth(column, phoneWidth)).toBe(12);
      expect(getGridColumnsAtWidth(column, desktopWidth)).toBe(6);
    });
  });
});
