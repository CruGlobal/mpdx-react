import { render } from '@testing-library/react';
import { MultilineSkeleton } from './MultilineSkeleton';

describe('MultilineSkeleton', () => {
  it('renders the specific number of lines', () => {
    const { queryAllByTestId } = render(<MultilineSkeleton lines={3} />);

    expect(queryAllByTestId('Line')).toHaveLength(3);
  });
});
