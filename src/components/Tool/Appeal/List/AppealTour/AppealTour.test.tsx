import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { AppealsWrapper } from 'pages/accountLists/[accountListId]/tools/appeals/AppealsWrapper';
import { ListHeaderCheckBoxState } from 'src/components/Shared/Header/ListHeader';
import { useMassSelection } from 'src/hooks/useMassSelection';
import theme from 'src/theme';
import { AppealTour } from './AppealTour';

const accountListId = 'accountListId';
const deselectAll = jest.fn();
const toggleSelectAll = jest.fn();

jest.mock('src/hooks/useMassSelection');

(useMassSelection as jest.Mock).mockReturnValue({
  selectionType: ListHeaderCheckBoxState.Unchecked,
  isRowChecked: jest.fn(),
  toggleSelectAll,
  deselectAll,
  toggleSelectionById: jest.fn(),
});

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

const Components = ({ showTour = true }) => {
  const appealId = showTour ? ['123', 'list', 'tour'] : ['123', 'list'];
  return (
    <ThemeProvider theme={theme}>
      <TestRouter
        router={{
          query: { accountListId, appealId },
          pathname:
            '/accountLists/[accountListId]/tools/appeals/[[...appealId]]',
          isReady: true,
        }}
      >
        <GqlMockedProvider>
          <AppealsWrapper>
            <AppealTour />
          </AppealsWrapper>
        </GqlMockedProvider>
      </TestRouter>
    </ThemeProvider>
  );
};

describe('AppealTour', () => {
  beforeEach(() => {
    deselectAll.mockClear();
    toggleSelectAll.mockClear();
  });

  it('should not render the tour', async () => {
    const { queryByText, queryByRole } = render(
      <Components showTour={false} />,
    );
    await waitFor(() => {
      expect(
        queryByText('Appeal created successfully'),
      ).not.toBeInTheDocument();
      expect(queryByRole('button', { name: 'Start' })).not.toBeInTheDocument();
    });
  });

  it('should render default view', () => {
    const { getByRole } = render(<Components />);

    expect(
      getByRole('heading', { name: 'Appeal created successfully' }),
    ).toBeInTheDocument();
    expect(getByRole('button', { name: 'Hide' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Start' })).toBeInTheDocument();
  });

  it('should hide the tour', async () => {
    const { getByRole, queryByRole } = render(<Components />);

    expect(
      getByRole('heading', { name: 'Appeal created successfully' }),
    ).toBeInTheDocument();

    userEvent.click(getByRole('button', { name: 'Hide' }));

    await waitFor(() => {
      expect(
        queryByRole('heading', { name: 'Appeal created successfully' }),
      ).not.toBeInTheDocument();
      expect(queryByRole('button', { name: 'Start' })).not.toBeInTheDocument();
    });
  });

  it('should click through steps of the tour', async () => {
    const { getByRole, queryByRole, queryByTestId, rerender } = render(
      <Components />,
    );

    await waitFor(() => {
      expect(
        getByRole('heading', { name: 'Appeal created successfully' }),
      ).toBeInTheDocument();
    });

    userEvent.click(getByRole('button', { name: 'Start' }));
    expect(
      getByRole('heading', { name: 'Review Excluded' }),
    ).toBeInTheDocument();
    const hideButton = getByRole('button', { name: 'Hide' });
    const nextButton = getByRole('button', { name: 'Next' });
    expect(hideButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();

    userEvent.click(getByRole('button', { name: 'Next' }));
    expect(getByRole('heading', { name: 'Review Asked' })).toBeInTheDocument();
    expect(hideButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();

    userEvent.click(getByRole('button', { name: 'Next' }));
    expect(
      getByRole('heading', { name: 'Export Contacts' }),
    ).toBeInTheDocument();
    expect(hideButton).toBeInTheDocument();
    expect(getByRole('button', { name: 'Export to CSV' })).toBeInTheDocument();

    userEvent.click(getByRole('button', { name: 'Export to CSV' }));
    expect(
      getByRole('heading', { name: 'Export Contacts' }),
    ).toBeInTheDocument();
    expect(queryByRole('button', { name: 'Hide' })).not.toBeInTheDocument();
    expect(getByRole('button', { name: 'Finished' })).toBeInTheDocument();

    userEvent.click(getByRole('button', { name: 'Finished' }));
    expect(queryByTestId('appealTour')).not.toBeInTheDocument();

    // Once finished, the tour should not show again.
    rerender(<Components />);
    await waitFor(() => {
      expect(queryByTestId('appealTour')).not.toBeInTheDocument();
    });
  });
});
