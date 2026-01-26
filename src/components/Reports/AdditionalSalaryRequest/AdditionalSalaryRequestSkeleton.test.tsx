import { render } from '@testing-library/react';
import { AdditionalSalaryRequestSkeleton } from './AdditionalSalaryRequestSkeleton';

describe('AdditionalSalaryRequestSkeleton', () => {
  it('renders skeleton elements', () => {
    const { container } = render(<AdditionalSalaryRequestSkeleton />);

    const skeletons = container.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons).toHaveLength(6);
  });
});
