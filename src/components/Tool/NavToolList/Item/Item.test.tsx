import React from 'react';
import { render } from '../../../../../__tests__/util/testingLibraryReactMock';
import TestWrapper from '../../../../../__tests__/util/TestWrapper';
import { Item } from './Item';

const item = {
  id: 'testItem',
  title: 'test title',
};

describe('ToolItem', () => {
  it('default', () => {
    const { queryByText } = render(
      <TestWrapper>
        <Item id={item.id} title={item.title} />
      </TestWrapper>,
    );
    expect(queryByText(item.title)).toBeInTheDocument();
  });
});
