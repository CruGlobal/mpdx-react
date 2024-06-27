import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { ContactsProvider } from 'src/components/Contacts/ContactsContext/ContactsContext';
import theme from 'src/theme';
import { GetContactDuplicatesQuery } from './GetContactDuplicates.generated';
import MergeContacts from './MergeContacts';
import { getContactDuplicatesMocks } from './MergeContactsMock';

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

interface MergeContactsWrapperProps {
  mutationSpy?: () => void;
}

const MergeContactsWrapper: React.FC<MergeContactsWrapperProps> = ({
  mutationSpy,
}) => {
  return (
    <ThemeProvider theme={theme}>
      <TestRouter>
        <GqlMockedProvider<{
          GetContactDuplicates: GetContactDuplicatesQuery;
        }>
          mocks={getContactDuplicatesMocks}
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
            <MergeContacts
              accountListId={accountListId}
              setContactFocus={setContactFocus}
            />
          </ContactsProvider>
        </GqlMockedProvider>
      </TestRouter>
    </ThemeProvider>
  );
};

describe('Tools - MergeContacts', () => {
  it('should render', async () => {
    const { findByText, getByTestId } = render(<MergeContactsWrapper />);

    expect(await findByText('Merge Contacts')).toBeInTheDocument();
    expect(getByTestId('ContactMergeDescription').textContent).toMatch(
      'You have 55 possible duplicate contacts',
    );
  });

  it('should merge contacts', async () => {
    const mutationSpy = jest.fn();

    const { getByText, queryAllByTestId, findByText, getByRole } = render(
      <SnackbarProvider>
        <MergeContactsWrapper mutationSpy={mutationSpy} />
      </SnackbarProvider>,
    );

    await waitFor(() =>
      expect(queryAllByTestId('MergeContactPair')).toHaveLength(2),
    );
    const confirmButton = getByRole('button', { name: 'Confirm and Continue' });

    expect(confirmButton).toBeDisabled();
    userEvent.click(getByText('123 John St Orlando, FL 32832'));
    expect(await findByText('Use this one')).toBeInTheDocument();
    expect(confirmButton).not.toBeDisabled();

    userEvent.click(confirmButton);
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith('Success!', {
        variant: 'success',
      }),
    );

    const mergeCalls = mutationSpy.mock.calls
      .map(([{ operation }]) => operation)
      .filter(({ operationName }) => operationName === 'MassActionsMerge');
    expect(mergeCalls).toHaveLength(1);
    expect(mergeCalls[0].variables).toEqual({
      input: {
        winnersAndLosers: [
          {
            loserId: 'contact-1',
            winnerId: 'contact-2',
          },
        ],
      },
    });
  });

  it('should ignore contacts', async () => {
    const mutationSpy = jest.fn();

    const { queryByText, queryAllByTestId, findByText, getByRole } = render(
      <SnackbarProvider>
        <MergeContactsWrapper mutationSpy={mutationSpy} />
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
    expect(confirmButton).not.toBeDisabled();
  });

  describe('setContactFocus()', () => {
    it('should open up contact details', async () => {
      const mutationSpy = jest.fn();
      const { findByText, queryByTestId } = render(
        <MergeContactsWrapper mutationSpy={mutationSpy} />,
      );
      await waitFor(() =>
        expect(queryByTestId('loading')).not.toBeInTheDocument(),
      );
      expect(setContactFocus).not.toHaveBeenCalled();

      const contactName = await findByText('Doe, John and Nancy');

      expect(contactName).toBeInTheDocument();
      userEvent.click(contactName);
      expect(setContactFocus).toHaveBeenCalledWith('contact-2');
    });
  });
});
