import React from 'react';
import { render } from '@testing-library/react';
import { ReportLayout } from './ReportLayout';

describe('ReportLayout', () => {
  it('default', () => {
    const { getByTestId } = render(
      <ReportLayout selectedId="test">
        <div data-testid="children"></div>
      </ReportLayout>,
    );
    const element = getByTestId('children');
    expect(element).toBeInTheDocument();
  });
});
