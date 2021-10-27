import { MockedProvider } from '@apollo/client/testing';
import { Box } from '@material-ui/core';
import React, { ReactElement } from 'react';
import { GqlMockedProvider } from '../../../../__tests__/util/graphqlMocking';
import { FilterPanel } from './FilterPanel';
import { FiltersDocument, FiltersQuery } from './FilterPanel.generated';
import {
  FiltersDefaultMock,
  FiltersEmptyMock,
  FiltersErrorMock,
} from './FilterPanel.mocks';

export default {
  title: 'Shared/FilterPanel',
  args: { width: 290, page: 'contact' },
  argTypes: {
    page: {
      name: 'page',
      options: ['task', 'contact'],
      control: { type: 'select' },
    },
  },
};

const accountListId = '111';

const StorybookFilterPanel = ({
  width,
  page,
}: {
  width: number;
  page: 'contact' | 'task';
}): ReactElement => (
  <Box width={width} height="100vh" bgcolor="#fff">
    <FilterPanel
      page={page}
      accountListId={accountListId}
      width={width}
      onClose={() => {}}
      onSelectedFiltersChanged={() => {}}
    />
  </Box>
);

export const Default = ({
  width,
  page,
}: {
  width: number;
  page: 'contact' | 'task';
}): ReactElement => (
  <GqlMockedProvider<FiltersQuery> mocks={{ Filters: FiltersDefaultMock }}>
    <StorybookFilterPanel width={width} page={page} />
  </GqlMockedProvider>
);

export const Loading = ({
  width,
  page,
}: {
  width: number;
  page: 'contact' | 'task';
}): ReactElement => {
  const mock = {
    request: {
      query: FiltersDocument,
      variables: { accountListId: accountListId },
    },
    result: {},
    delay: 86_400_000,
  };

  return (
    <MockedProvider mocks={[mock]}>
      <StorybookFilterPanel width={width} page={page} />
    </MockedProvider>
  );
};

export const Empty = ({
  width,
  page,
}: {
  width: number;
  page: 'contact' | 'task';
}): ReactElement => (
  <GqlMockedProvider<FiltersQuery> mocks={{ Filters: FiltersEmptyMock }}>
    <StorybookFilterPanel width={width} page={page} />
  </GqlMockedProvider>
);

export const Error = ({
  width,
  page,
}: {
  width: number;
  page: 'contact' | 'task';
}): ReactElement => (
  <GqlMockedProvider<FiltersQuery> mocks={{ Filters: FiltersErrorMock }}>
    <StorybookFilterPanel width={width} page={page} />
  </GqlMockedProvider>
);
