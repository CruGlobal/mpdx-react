import React from 'react';
import { render } from '../../../../../__tests__/util/testingLibraryReactMock';
import TestWrapper from '../../../../../__tests__/util/TestWrapper';
import { Item } from './Item';

const item = {
  id: 'testItem',
  title: 'test title',
  isSelected: false,
};

describe('ToolItem', () => {
  it('default', () => {
    const { queryByText } = render(
      <TestWrapper>
        <Item id={item.id} title={item.title} isSelected={item.isSelected} />
      </TestWrapper>,
    );
    expect(queryByText(item.title)).toBeInTheDocument();
  });
});
