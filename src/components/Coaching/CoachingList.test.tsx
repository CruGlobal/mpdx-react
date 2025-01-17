import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { ErgonoMockShape } from 'graphql-ergonomock';
import TestRouter from '__tests__/util/TestRouter';
import TestWrapper from '__tests__/util/TestWrapper';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { CoachingList } from './CoachingList';
import { LoadCoachingListQuery } from './LoadCoachingList.generated';

const accountListId = 'accountListId';
const mutationSpy = jest.fn();

const coachingAccountListsMock = [
  {
    id: '1',
    name: 'Account 1',
  },
  {
    id: '2',
    name: 'Account 2',
  },
];
const router = {
  query: { accountListId: accountListId },
  push: jest.fn(),
};

interface ComponentsProps {
  mockNodes?: ErgonoMockShape[];
}
const Components = ({
  mockNodes = coachingAccountListsMock,
}: ComponentsProps) => (
  <ThemeProvider theme={theme}>
    <TestRouter router={router}>
      <TestWrapper>
        <GqlMockedProvider<{
          coachingAccountLists: LoadCoachingListQuery;
        }>
          mocks={{
            LoadCoachingList: {
              coachingAccountLists: {
                nodes: mockNodes,
                totalCount: 2,
              },
            },
          }}
          onCall={mutationSpy}
        >
          <CoachingList accountListId={accountListId} />
        </GqlMockedProvider>
      </TestWrapper>
    </TestRouter>
  </ThemeProvider>
);

describe('CoachingList', () => {
  it('should render loading state', () => {
    const { getAllByTestId } = render(<Components />);

    expect(getAllByTestId('loading-coaches')[0]).toBeInTheDocument();
  });

  it('should render coaching accounts', async () => {
    const { findByText, getByText } = render(<Components />);

    expect(await findByText('Account 1')).toBeInTheDocument();
    expect(getByText('Account 2')).toBeInTheDocument();
  });
});
