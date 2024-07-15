import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
// import userEvent from '@testing-library/user-event';
import { ErgonoMockShape } from 'graphql-ergonomock';
import TestRouter from '__tests__/util/TestRouter';
import TestWrapper from '__tests__/util/TestWrapper';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { render, waitFor } from '__tests__/util/testingLibraryReactMock';
import theme from '../../../theme';
import FixCommitmentInfo from './FixCommitmentInfo';
import { mockInvalidStatusesResponse } from './FixCommitmentInfoMocks';
import { GetInvalidStatusesQuery } from './GetInvalidStatuses.generated';

const mockEnqueue = jest.fn();

jest.mock('notistack', () => ({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ...jest.requireActual('notistack'),
  useSnackbar: () => {
    return {
      enqueueSnackbar: mockEnqueue,
    };
  },
}));

const accountListId = 'test121';
const router = {
  pathname: '/accountLists/[accountListId]/tools/fixCommitmentInfo',
  query: { accountListId: accountListId },
  push: jest.fn(),
};

const setContactFocus = jest.fn();

const Components = ({
  mockNodes = mockInvalidStatusesResponse,
}: {
  mockNodes?: ErgonoMockShape[];
}) => (
  <ThemeProvider theme={theme}>
    <TestRouter router={router}>
      <TestWrapper>
        <GqlMockedProvider<{
          GetInvalidStatuses: GetInvalidStatusesQuery;
        }>
          mocks={{
            GetInvalidStatuses: {
              contacts: {
                nodes: mockNodes,
              },
            },
          }}
        >
          <FixCommitmentInfo
            accountListId={accountListId}
            setContactFocus={setContactFocus}
          />
        </GqlMockedProvider>
      </TestWrapper>
    </TestRouter>
  </ThemeProvider>
);

describe('FixCommitmentContact', () => {
  it('default with test data', async () => {
    const { getByText, debug } = render(<Components />);
    debug(undefined, Infinity);
    await waitFor(() => {
      expect(getByText('Fix Commitment Info')).toBeInTheDocument();
      expect(
        getByText('You have 2 partner statuses to confirm.'),
      ).toBeInTheDocument();
    });
  });
  it('has correct styles', async () => {
    const { getByTestId, debug } = render(<Components />);
    debug(undefined, Infinity);
    const home = getByTestId('Home');

    expect(home.classList.contains('css-1ruq7cl-outer')).toBe(true);
    // expect(home).toHaveClass(' MuiBox-root css-1ruq7cl-outer');
    expect(home).toHaveStyle('display: flex');

    await waitFor(() => {
      const container = getByTestId('Container');
      const divider = getByTestId('Divider');
      const description = getByTestId('Description');

      expect(
        container.classList.contains('css-vb35gf-MuiGrid-root-container'),
      ).toBe(true);
      expect(container).toHaveStyle('width: 70%');

      expect(
        divider.classList.contains('css-bm8pe9-MuiDivider-root-divider'),
      ).toBe(true);
      expect(divider).toHaveStyle('margin-top: 16px');

      expect(description.classList.contains('css-ys3m4j-descriptionBox')).toBe(
        true,
      );
      expect(description).toHaveStyle('margin-bottom: 16px');
    });
  });
});
