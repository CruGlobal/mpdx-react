import { render } from '@testing-library/react';
import { BarChartSkeleton } from './BarChartSkeleton';

describe('BarChartSkeleton', () => {
  it('renders the right number of bars', () => {
    const { getAllByTestId } = render(<BarChartSkeleton bars={10} />);

    expect(getAllByTestId('SkeletonBar')).toHaveLength(10);
  });

  it('sets the bar heights to ascend to 100%', () => {
    const { getAllByTestId } = render(<BarChartSkeleton bars={3} />);

    const bars = getAllByTestId('SkeletonBar');
    expect(bars[0]).toHaveStyle({ height: '33%' });
    expect(bars[1]).toHaveStyle({ height: '67%' });
    expect(bars[2]).toHaveStyle({ height: '100%' });
  });
});
