import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { ContactsProvider } from 'src/components/Contacts/ContactsContext/ContactsContext';
import theme from 'src/theme';
import { GetPersonDuplicatesQuery } from './GetPersonDuplicates.generated';
import MergePeople from './MergePeople';
import { getPersonDuplicatesMocks } from './PersonDuplicatesMock';

const accountListId = '123';

const setContactFocus = jest.fn();
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

interface MergePeopleWrapperProps {
  mutationSpy?: () => void;
}

const MergePeopleWrapper: React.FC<MergePeopleWrapperProps> = ({
  mutationSpy,
}) => {
  return (
    <ThemeProvider theme={theme}>
      <TestRouter>
        <GqlMockedProvider<{
          GetPersonDuplicates: GetPersonDuplicatesQuery;
        }>
          mocks={getPersonDuplicatesMocks}
          onCall={mutationSpy}
        >
          <ContactsProvider
            activeFilters={{}}
            setActiveFilters={() => {}}
            starredFilter={{}}
            setStarredFilter={() => {}}
            filterPanelOpen={false}
            setFilterPanelOpen={() => {}}
            contactId={[]}
            searchTerm={''}
          >
            <MergePeople
              accountListId={accountListId}
              setContactFocus={setContactFocus}
            />
          </ContactsProvider>
        </GqlMockedProvider>
      </TestRouter>
    </ThemeProvider>
  );
};

describe('Tools - MergePeople', () => {
  it('should render', async () => {
    const { findByText, getByTestId } = render(<MergePeopleWrapper />);

    expect(await findByText('Merge People')).toBeInTheDocument();
    expect(getByTestId('PeopleMergeDescription').textContent).toMatch(
      'You have 55 possible duplicate people',
    );
  });

  it('should merge people', async () => {
    const mutationSpy = jest.fn();

    const { getByText, queryAllByTestId, findByText, getByRole } = render(
      <SnackbarProvider>
        <MergePeopleWrapper mutationSpy={mutationSpy} />
      </SnackbarProvider>,
    );

    await waitFor(() =>
      expect(queryAllByTestId('MergeContactPair')).toHaveLength(2),
    );
    expect(getByText('(Siebel)')).toBeInTheDocument();

    expect(
      getByRole('button', { name: 'Confirm and Continue' }),
    ).toBeDisabled();
    userEvent.click(getByText('555-555-5555'));
    expect(await findByText('Use this one')).toBeInTheDocument();
    expect(
      getByRole('button', { name: 'Confirm and Continue' }),
    ).not.toBeDisabled();

    userEvent.click(getByRole('button', { name: 'Confirm and Continue' }));
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith('Success!', {
        variant: 'success',
      }),
    );

    const mergeCalls = mutationSpy.mock.calls
      .map(([{ operation }]) => operation)
      .filter(({ operationName }) => operationName === 'MergePeopleBulk');
    expect(mergeCalls).toHaveLength(1);
    expect(mergeCalls[0].variables).toEqual({
      input: {
        winnersAndLosers: [
          {
            loserId: 'person-1.5',
            winnerId: 'person-1',
          },
        ],
      },
    });
  });

  it('should ignore contacts', async () => {
    const mutationSpy = jest.fn();

    const { queryByText, queryAllByTestId, findByText, getByRole } = render(
      <SnackbarProvider>
        <MergePeopleWrapper mutationSpy={mutationSpy} />
      </SnackbarProvider>,
    );

    await waitFor(() =>
      expect(queryAllByTestId('MergeContactPair')).toHaveLength(2),
    );
    const confirmButton = getByRole('button', { name: 'Confirm and Continue' });

    expect(confirmButton).toBeDisabled();
    userEvent.click(queryAllByTestId('rightButton')[0]);
    expect(await findByText('Use this one')).toBeInTheDocument();
    userEvent.click(queryAllByTestId('ignoreButton')[0]);
    expect(queryByText('Use this one')).not.toBeInTheDocument();
    expect(
      getByRole('button', { name: 'Confirm and Continue' }),
    ).not.toBeDisabled();
  });

  describe('setContactFocus()', () => {
    it('should open up contact details', async () => {
      const mutationSpy = jest.fn();
      const { findByText, queryByTestId } = render(
        <MergePeopleWrapper mutationSpy={mutationSpy} />,
      );
      await waitFor(() =>
        expect(queryByTestId('loading')).not.toBeInTheDocument(),
      );
      expect(setContactFocus).not.toHaveBeenCalled();

      const contactName = await findByText('Ellie Francisco');

      expect(contactName).toBeInTheDocument();
      userEvent.click(contactName);
      expect(setContactFocus).toHaveBeenCalledWith('contact-2');
    });
  });
});
