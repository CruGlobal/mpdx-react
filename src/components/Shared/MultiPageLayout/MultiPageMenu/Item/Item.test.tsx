import React from 'react';
import { Item } from './Item';
import { render } from '__tests__/util/testingLibraryReactMock';
import TestWrapper from '__tests__/util/TestWrapper';
import { NavTypeEnum } from '../MultiPageMenu';

const item = {
  id: 'testItem',
  title: 'test title',
  subTitle: 'test subTitle',
};

describe('Item', () => {
  it('default', () => {
    const { queryByText } = render(
      <TestWrapper>
        <Item item={item} selectedId="testItem" navType={NavTypeEnum.Reports} />
      </TestWrapper>,
    );
    expect(queryByText(item.title)).toBeInTheDocument();
    expect(queryByText(item.subTitle)).toBeInTheDocument();
  });
});
