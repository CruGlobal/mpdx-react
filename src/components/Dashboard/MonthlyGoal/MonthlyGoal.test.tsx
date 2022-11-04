import React from 'react';
import { render } from '@testing-library/react';
import matchMediaMock from '../../../../__tests__/util/matchMediaMock';
import MonthlyGoal from './MonthlyGoal';

describe('MonthlyGoal', () => {
  beforeEach(() => {
    matchMediaMock({ width: '1024px' });
  });

  it('default', () => {
    const { getByTestId, queryByTestId } = render(
      <MonthlyGoal accountListId="1111" />,
    );
    expect(
      queryByTestId('MonthlyGoalTypographyGoalMobile'),
    ).not.toBeInTheDocument();
    expect(getByTestId('MonthlyGoalTypographyGoal').textContent).toEqual('$0');
    expect(
      getByTestId('MonthlyGoalTypographyReceivedPercentage').textContent,
    ).toEqual('-');
    expect(getByTestId('MonthlyGoalTypographyReceived').textContent).toEqual(
      '$0',
    );
    expect(
      getByTestId('MonthlyGoalTypographyPledgedPercentage').textContent,
    ).toEqual('-');
    expect(getByTestId('MonthlyGoalTypographyPledged').textContent).toEqual(
      '$0',
    );
    expect(
      queryByTestId('MonthlyGoalTypographyBelowGoalPercentage'),
    ).not.toBeInTheDocument();
    expect(
      queryByTestId('MonthlyGoalTypographyBelowGoal'),
    ).not.toBeInTheDocument();
    expect(
      getByTestId('MonthlyGoalTypographyAboveGoalPercentage').textContent,
    ).toEqual('-');
    expect(getByTestId('MonthlyGoalTypographyAboveGoal').textContent).toEqual(
      '$0',
    );
  });

  it('loading', () => {
    const { getByTestId } = render(
      <MonthlyGoal accountListId="1111" loading />,
    );
    expect(
      getByTestId('MonthlyGoalTypographyGoal').children[0].className,
    ).toContain('MuiSkeleton-root');
    expect(
      getByTestId('MonthlyGoalTypographyReceivedPercentage').children[0]
        .className,
    ).toContain('MuiSkeleton-root');
    expect(
      getByTestId('MonthlyGoalTypographyReceived').children[0].className,
    ).toContain('MuiSkeleton-root');
    expect(
      getByTestId('MonthlyGoalTypographyPledgedPercentage').children[0]
        .className,
    ).toContain('MuiSkeleton-root');
    expect(
      getByTestId('MonthlyGoalTypographyPledged').children[0].className,
    ).toContain('MuiSkeleton-root');
    expect(
      getByTestId('MonthlyGoalTypographyAboveGoalPercentage').children[0]
        .className,
    ).toContain('MuiSkeleton-root');
    expect(
      getByTestId('MonthlyGoalTypographyAboveGoal').children[0].className,
    ).toContain('MuiSkeleton-root');
  });

  it('props', () => {
    const { getByTestId, queryByTestId } = render(
      <MonthlyGoal
        accountListId="1111"
        goal={999.5}
        received={500}
        pledged={750}
        currencyCode="EUR"
      />,
    );
    expect(getByTestId('MonthlyGoalTypographyGoal').textContent).toEqual(
      '€1,000',
    );
    expect(
      getByTestId('MonthlyGoalTypographyReceivedPercentage').textContent,
    ).toEqual('50%');
    expect(getByTestId('MonthlyGoalTypographyReceived').textContent).toEqual(
      '€500',
    );
    expect(
      getByTestId('MonthlyGoalTypographyPledgedPercentage').textContent,
    ).toEqual('75%');
    expect(getByTestId('MonthlyGoalTypographyPledged').textContent).toEqual(
      '€750',
    );
    expect(
      getByTestId('MonthlyGoalTypographyBelowGoalPercentage').textContent,
    ).toEqual('25%');
    expect(getByTestId('MonthlyGoalTypographyBelowGoal').textContent).toEqual(
      '€250',
    );
    expect(
      queryByTestId('MonthlyGoalTypographyAboveGoalPercentage'),
    ).not.toBeInTheDocument();
    expect(
      queryByTestId('MonthlyGoalTypographyAboveGoal'),
    ).not.toBeInTheDocument();
  });

  it('props above goal', () => {
    const { getByTestId, queryByTestId } = render(
      <MonthlyGoal
        accountListId="1111"
        goal={999.5}
        received={5000}
        pledged={7500}
        currencyCode="EUR"
      />,
    );
    expect(
      getByTestId('MonthlyGoalTypographyReceivedPercentage').textContent,
    ).toEqual('500%');
    expect(
      getByTestId('MonthlyGoalTypographyPledgedPercentage').textContent,
    ).toEqual('750%');
    expect(
      getByTestId('MonthlyGoalTypographyAboveGoalPercentage').textContent,
    ).toEqual('650%');
    expect(getByTestId('MonthlyGoalTypographyAboveGoal').textContent).toEqual(
      '€6,501',
    );
    expect(
      queryByTestId('MonthlyGoalTypographyBelowGoalPercentage'),
    ).not.toBeInTheDocument();
    expect(
      queryByTestId('MonthlyGoalTypographyBelowGoal'),
    ).not.toBeInTheDocument();
  });

  describe('mobile', () => {
    beforeEach(() => {
      matchMediaMock({ width: '599px' });
    });

    it('default', () => {
      const { getByTestId, queryByTestId } = render(
        <MonthlyGoal accountListId="1111" />,
      );
      expect(
        getByTestId('MonthlyGoalTypographyGoalMobile').textContent,
      ).toEqual('$0');
      expect(
        queryByTestId('MonthlyGoalTypographyGoal'),
      ).not.toBeInTheDocument();
      expect(
        queryByTestId('MonthlyGoalTypographyAboveGoalPercentage'),
      ).not.toBeInTheDocument();
      expect(
        queryByTestId('MonthlyGoalTypographyAboveGoal'),
      ).not.toBeInTheDocument();
    });

    it('props', () => {
      const { getByTestId } = render(
        <MonthlyGoal
          accountListId="1111"
          goal={999.5}
          received={500}
          pledged={750}
          currencyCode="EUR"
        />,
      );
      expect(
        getByTestId('MonthlyGoalTypographyGoalMobile').textContent,
      ).toEqual('€1,000');
    });
  });
});
