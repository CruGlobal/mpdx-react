import React from 'react';
import { render } from '@testing-library/react';
import { AppealProgress } from './AppealProgress';

describe('AppealProgress', () => {
  it('has correct defaults', () => {
    const { getByTestId, queryByTestId } = render(<AppealProgress isPrimary />);
    expect(queryByTestId('styledProgressLoading')).toBeNull();
    expect(getByTestId('styledProgressPrimary')).toHaveStyle(
      'width: calc(0% - 4px);',
    );
    expect(getByTestId('styledProgressSecondary')).toHaveStyle(
      'width: calc(0% - 4px);',
    );
  });

  it('has correct overrides', () => {
    const { getByTestId, queryByTestId } = render(
      <AppealProgress isPrimary goal={1} received={0.5} pledged={0.75} />,
    );
    expect(queryByTestId('styledProgressLoading')).toBeNull();
    expect(getByTestId('styledProgressPrimary')).toHaveStyle(
      'width: calc(50% - 4px);',
    );
    expect(getByTestId('styledProgressSecondary')).toHaveStyle(
      'width: calc(75% - 4px);',
    );
  });

  it('allows loading', () => {
    const { getByTestId, queryByTestId } = render(
      <AppealProgress loading isPrimary />,
    );
    expect(getByTestId('styledProgressLoading')).toBeTruthy();
    expect(queryByTestId('styledProgressPrimary')).toBeNull();
    expect(queryByTestId('styledProgressSecondary')).toBeNull();
  });
});
