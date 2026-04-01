import React from 'react';
import { render } from '@testing-library/react';
import { PdsGoalCalculatorTestWrapper } from '../PdsGoalCalculatorTestWrapper';
import { PdsGoalCalculatorLayout } from './PdsGoalCalculatorLayout';

describe('PdsGoalCalculatorLayout', () => {
  it('renders the layout with sidebar and main content', () => {
    const { getByText } = render(
      <PdsGoalCalculatorTestWrapper>
        <PdsGoalCalculatorLayout
          sectionListPanel={<div>Section List</div>}
          mainContent={<div>Main Content</div>}
        />
      </PdsGoalCalculatorTestWrapper>,
    );

    expect(getByText('Main Content')).toBeInTheDocument();
  });
});
