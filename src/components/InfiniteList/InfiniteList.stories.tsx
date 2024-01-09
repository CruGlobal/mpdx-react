import React from 'react';
import { Story } from '@storybook/react';
import { InfiniteList } from './InfiniteList';

export default {
  title: 'InfiniteList',
  argTypes: { endReached: { action: 'end of list reached' } },
};

export const Default: Story = (args) => (
  <InfiniteList
    loading={false}
    data={[...Array(25).keys()]}
    itemContent={(index, item) => <div>{item}</div>}
    endReached={args.endReached}
    EmptyPlaceholder={<div>No items</div>}
  />
);

export const Loading: Story = () => (
  <InfiniteList
    loading={true}
    itemContent={(index, item) => (
      <>
        {index} {item}
      </>
    )}
    endReached={() => {}}
    EmptyPlaceholder={<div>No items</div>}
  />
);

export const Empty: Story = () => (
  <InfiniteList
    loading={false}
    itemContent={(index, item) => (
      <>
        {index} {item}
      </>
    )}
    endReached={() => {}}
    EmptyPlaceholder={<div>No items</div>}
  />
);
