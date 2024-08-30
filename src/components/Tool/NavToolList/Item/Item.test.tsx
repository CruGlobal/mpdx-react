import React from 'react';
import TestWrapper from '__tests__/util/TestWrapper';
import { render } from '__tests__/util/testingLibraryReactMock';
import { Item } from './Item';

const item = {
  url: 'testItem',
  title: 'test title',
  isSelected: false,
};

describe('ToolItem', () => {
  it('default', () => {
    const { queryByText } = render(
      <TestWrapper>
        <Item
          url={item.url}
          title={item.title}
          isSelected={item.isSelected}
          loading={false}
          needsAttention={false}
          totalCount={0}
        />
      </TestWrapper>,
    );
    expect(queryByText(item.title)).toBeInTheDocument();
  });
});
