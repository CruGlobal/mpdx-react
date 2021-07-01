import React from 'react';
import { Item } from './Item';
import { render } from '__tests__/util/testingLibraryReactMock';
import TestWrapper from '__tests__/util/TestWrapper';

const item = {
  id: 'testItem',
  title: 'test title',
  subTitle: 'test subTitle',
};

describe('Item', () => {
  it('default', () => {
    const { queryByText } = render(
      <TestWrapper initialState={{}}>
        <Item item={item} isSelected={false} />
      </TestWrapper>,
    );
    expect(queryByText(item.title)).toBeInTheDocument();
    expect(queryByText(item.subTitle)).toBeInTheDocument();
  });
});
