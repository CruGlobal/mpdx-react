import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApolloErgonoMockMap } from 'graphql-ergonomock';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { ContactPanelProvider } from 'src/components/common/ContactPanelProvider/ContactPanelProvider';
import { TypeEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { GetContactDuplicatesQuery } from './GetContactDuplicates.generated';
import MergeContacts from './MergeContacts';
import { getContactDuplicatesMocks } from './MergeContactsMock';

const accountListId = '123';
const router = {
  pathname:
    '/accountLists/[accountListId]/tools/merge/contacts/[[...contactId]]',
  query: { accountListId },
};

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
  mocks?: ApolloErgonoMockMap;
  contactId?: string;
}

const MergeContactsWrapper: React.FC<MergeContactsWrapperProps> = ({
  mutationSpy,
  mocks = getContactDuplicatesMocks,
  contactId,
}) => {
  return (
    <ThemeProvider theme={theme}>
      <TestRouter router={router}>
        <GqlMockedProvider<{
          GetContactDuplicates: GetContactDuplicatesQuery;
        }>
          mocks={mocks}
          onCall={mutationSpy}
        >
          <ContactPanelProvider>
            <MergeContacts
              accountListId={accountListId}
              contactId={contactId}
            />
          </ContactPanelProvider>
        </GqlMockedProvider>
      </TestRouter>
    </ThemeProvider>
  );
};

describe('Tools - MergeContacts', () => {
  it('should render', async () => {
    const { findByTestId } = render(<MergeContactsWrapper />);
    const ContactMergeDescription = await findByTestId(
      'ContactMergeDescription',
    );
    expect(ContactMergeDescription.textContent).toMatch(
      'You have 55 possible duplicate contacts',
    );
  });

  it('should merge contacts', async () => {
    const mutationSpy = jest.fn();

    const { getByText, queryAllByTestId, findByText, getByRole } = render(
      <SnackbarProvider>
        <MergeContactsWrapper
          mutationSpy={mutationSpy}
          mocks={{
            GetContactDuplicates:
              getContactDuplicatesMocks.GetContactDuplicates,
            MassActionsMerge: () => {
              return { mergeContacts: ['contact-2'] };
            },
          }}
        />
      </SnackbarProvider>,
    );

    await waitFor(() =>
      expect(queryAllByTestId('MergeContactPair')).toHaveLength(2),
    );
    const confirmButton = getByRole('button', { name: 'Confirm and Continue' });

    expect(confirmButton).toBeDisabled();
    userEvent.click(queryAllByTestId('ignoreButton')[1]);
    userEvent.click(
      getByText('(contact-2 address) 123 John St Orlando, FL 32832'),
    );
    userEvent.click(
      getByText('(contact-1 address) 123 Main St Orlando, FL 32832'),
    );
    userEvent.click(
      getByText('(contact-2 address) 123 John St Orlando, FL 32832'),
    );
    expect(await findByText('Use this one')).toBeInTheDocument();
    expect(
      getByRole('button', { name: 'Confirm and Continue' }),
    ).not.toBeDisabled();

    userEvent.click(getByRole('button', { name: 'Confirm and Continue' }));
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith('Updated 2 duplicate(s)', {
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
            winnerId: 'contact-2',
            loserId: 'contact-1',
          },
        ],
      },
    });
  });

  it('should ignore contacts', async () => {
    const mutationSpy = jest.fn();

    const {
      queryByText,
      queryByTestId,
      queryAllByTestId,
      findByText,
      getByText,
      getByRole,
    } = render(
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
    userEvent.click(queryAllByTestId('ignoreButton')[1]);
    expect(queryByText('Use this one')).not.toBeInTheDocument();

    userEvent.click(getByRole('button', { name: 'Confirm and Continue' }));
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith('Updated 2 duplicate(s)', {
        variant: 'success',
      }),
    );

    const mergeCalls = mutationSpy.mock.calls
      .map(([{ operation }]) => operation)
      .filter(({ operationName }) => operationName === 'MassActionsMerge');
    expect(mergeCalls).toHaveLength(0);

    const ignoreCalls = mutationSpy.mock.calls
      .map(([{ operation }]) => operation)
      .filter(({ operationName }) => operationName === 'UpdateDuplicate');
    expect(ignoreCalls).toHaveLength(2);
    expect(ignoreCalls[0].variables).toEqual({
      input: {
        attributes: {
          ignore: true,
        },
        type: TypeEnum.Contact,
        id: '1',
      },
    });
    expect(queryByTestId('ignoreButton')).not.toBeInTheDocument();
    expect(
      getByText('No duplicate contacts need attention'),
    ).toBeInTheDocument();
  });

  it('should only load duplicates of a specific contact', async () => {
    const mutationSpy = jest.fn();
    render(
      <SnackbarProvider>
        <MergeContactsWrapper mutationSpy={mutationSpy} contactId="contact-1" />
      </SnackbarProvider>,
    );

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('GetContactDuplicates', {
        accountListId: '123',
        contactIds: ['contact-1'],
      }),
    );
  });

  it('should show error', async () => {
    const mutationSpy = jest.fn();

    const { queryAllByTestId, getByRole } = render(
      <SnackbarProvider>
        <MergeContactsWrapper
          mutationSpy={mutationSpy}
          mocks={{
            GetContactDuplicates:
              getContactDuplicatesMocks.GetContactDuplicates,
            UpdateDuplicate: () => {
              throw new Error('Server Error');
            },
            MassActionsMerge: () => {
              throw new Error('Server Error');
            },
          }}
        />
      </SnackbarProvider>,
    );
    await waitFor(() =>
      expect(queryAllByTestId('MergeContactPair')).toHaveLength(2),
    );
    userEvent.click(queryAllByTestId('ignoreButton')[0]);

    userEvent.click(getByRole('button', { name: 'Confirm and Continue' }));
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith(
        'Failed to update 1 duplicate(s)',
        {
          variant: 'error',
        },
      ),
    );
  });

  it('should render link with correct href', async () => {
    const { findByRole } = render(<MergeContactsWrapper />);

    const contactName = await findByRole('link', {
      name: 'Doe, John and Nancy',
    });
    expect(contactName).toHaveAttribute(
      'href',
      `/accountLists/${accountListId}/tools/merge/contacts/contact-2`,
    );
  });
});
