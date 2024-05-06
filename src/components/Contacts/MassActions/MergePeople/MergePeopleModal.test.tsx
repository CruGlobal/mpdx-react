import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from '../../../../theme';
import { MergePeopleModal } from './MergePeopleModal';

const handleClose = jest.fn();
const accountListId = '123';

const mockEnqueue = jest.fn();
const mutationSpy = jest.fn();

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

const people = [
  { id: 'person-1', firstName: 'John' },
  { id: 'person-2', firstName: 'Victor' },
  { id: 'person-3', firstName: 'Jane' },
];
const TestingComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <GqlMockedProvider onCall={mutationSpy}>
      <MergePeopleModal
        accountListId={accountListId}
        people={people}
        handleClose={handleClose}
      />
    </GqlMockedProvider>
  </ThemeProvider>
);

describe('MergePeopleModal', () => {
  it('should render modal', () => {
    const { getByRole } = render(<TestingComponent />);

    expect(getByRole('heading', { name: 'Merge People' })).toBeInTheDocument();

    expect(getByRole('heading', { name: 'John' })).toBeInTheDocument();
    expect(getByRole('heading', { name: 'Victor' })).toBeInTheDocument();
    expect(getByRole('heading', { name: 'Jane' })).toBeInTheDocument();
  });

  it('should close modal', () => {
    const { getByLabelText } = render(<TestingComponent />);

    userEvent.click(getByLabelText('Close'));
    expect(handleClose).toHaveBeenCalled();
  });

  it('should select clicked person', async () => {
    const { queryAllByTestId } = render(<TestingComponent />);

    expect(queryAllByTestId('MergePeopleModalPerson')).toHaveLength(3);

    const people = queryAllByTestId('MergePeopleModalPerson');
    expect(within(people[0]).queryByText('Use This One')).toBeInTheDocument();
    expect(
      within(people[1]).queryByText('Use This One'),
    ).not.toBeInTheDocument();
    expect(
      within(people[2]).queryByText('Use This One'),
    ).not.toBeInTheDocument();

    userEvent.click(people[1]);

    expect(
      within(people[0]).queryByText('Use This One'),
    ).not.toBeInTheDocument();
    expect(within(people[1]).queryByText('Use This One')).toBeInTheDocument();
    expect(
      within(people[2]).queryByText('Use This One'),
    ).not.toBeInTheDocument();
  });

  it('should merge people', async () => {
    const { getByText, getByRole } = render(
      <SnackbarProvider>
        <TestingComponent />
      </SnackbarProvider>,
    );

    userEvent.click(getByRole('heading', { name: 'Victor' }));

    userEvent.click(getByText('Merge'));
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith('People merged!', {
        variant: 'success',
      }),
    );

    const mergeCalls = mutationSpy.mock.calls
      .map(([{ operation }]) => operation)
      .filter(
        ({ operationName }) => operationName === 'MassActionsMergePeople',
      );
    expect(mergeCalls).toHaveLength(1);
    expect(mergeCalls[0].variables).toEqual({
      accountListId,
      winnerId: 'person-2',
      loserIds: ['person-1', 'person-3'],
    });
  });
});
