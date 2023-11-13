import React from 'react';
import { Item } from './Item';
import { render, waitFor } from '__tests__/util/testingLibraryReactMock';
import TestWrapper from '__tests__/util/TestWrapper';
import { NavTypeEnum } from '../MultiPageMenu';
import userEvent from '@testing-library/user-event';

const item = {
  id: 'testItem',
  title: 'test title',
  subTitle: 'test subTitle',
};

const itemWithSubitems = {
  id: 'testItem',
  title: 'test title',
  subTitle: 'test subTitle',
  subItems: [
    {
      id: 'organizations',
      title: 'Impersonate & Share',
      grantedAccess: ['admin'],
    },
    {
      id: 'organizations/accountLists',
      title: 'Account Lists',
      grantedAccess: ['admin'],
    },
  ],
};

describe('Item', () => {
  it('default', () => {
    const { queryByText, queryByTestId } = render(
      <TestWrapper>
        <Item item={item} selectedId="testItem" navType={NavTypeEnum.Reports} />
      </TestWrapper>,
    );
    expect(queryByText(item.title)).toBeInTheDocument();
    expect(queryByText(item.subTitle)).toBeInTheDocument();
    expect(queryByTestId('multiPageMenuCollapser')).not.toBeInTheDocument();
  });

  it('should render subItems', async () => {
    const { getByTestId, queryByText } = render(
      <TestWrapper>
        <Item
          item={itemWithSubitems}
          selectedId=""
          navType={NavTypeEnum.Reports}
        />
      </TestWrapper>,
    );

    const arrowForwardIosIcon = getByTestId('ArrowForwardIosIcon');

    expect(arrowForwardIosIcon).toBeInTheDocument();

    expect(queryByText('Impersonate & Share')).not.toBeInTheDocument();
    expect(queryByText('Account Lists')).not.toBeInTheDocument();

    userEvent.click(arrowForwardIosIcon);

    await waitFor(() => {
      expect(queryByText('Impersonate & Share')).toBeInTheDocument();
      expect(queryByText('Account Lists')).toBeInTheDocument();
    });
  });

  it('should show subItems as one if selected', async () => {
    const { getByText } = render(
      <TestWrapper>
        <Item
          item={itemWithSubitems}
          selectedId="organizations"
          navType={NavTypeEnum.Reports}
        />
      </TestWrapper>,
    );

    expect(getByText('Impersonate & Share')).toBeInTheDocument();
    expect(getByText('Account Lists')).toBeInTheDocument();
  });
});
