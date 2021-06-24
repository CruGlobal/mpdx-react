import React from 'react';
import { EmptyReport } from './EmptyReport';
import { render } from '__tests__/util/testingLibraryReactMock';
import TestWrapper from '__tests__/util/TestWrapper';

describe('EmptyReport', () => {
  it('default', () => {
    const { queryByText } = render(
      <TestWrapper initialState={{}}>
        <EmptyReport title="test title" subTitle="test subTitle" />
      </TestWrapper>,
    );
    expect(queryByText('test title')).toBeInTheDocument();
    expect(queryByText('test subTitle')).toBeInTheDocument();
  });
});
