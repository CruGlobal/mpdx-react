import React from 'react';
import { render } from '@testing-library/react';
import { SpecialInterestHelperPanel } from './SpecialInterestHelperPanel';

describe('SpecialInterestHelperPanel', () => {
  it('renders the helper panel with correct text', () => {
    const { getByText } = render(<SpecialInterestHelperPanel />);

    expect(
      getByText(
        'If you have income from outside sources (other than Cru) that you use as part of your budget, please include it below. Use "NET" numbers and not "Gross".',
      ),
    ).toBeInTheDocument();
  });
});
