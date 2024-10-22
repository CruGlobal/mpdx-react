import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApolloErgonoMockMap } from 'graphql-ergonomock';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { ContactsWrapper } from 'pages/accountLists/[accountListId]/contacts/ContactsWrapper';
import { TypeEnum } from 'src/graphql/types.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import theme from 'src/theme';
import { GetPersonDuplicatesQuery } from './GetPersonDuplicates.generated';
import MergePeople from './MergePeople';
import { getPersonDuplicatesMocks } from './PersonDuplicatesMock';

const accountListId = '123';

const mockEnqueue = jest.fn();

jest.mock('src/hooks/useAccountListId');
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
  mocks?: ApolloErgonoMockMap;
}

const MergePeopleWrapper: React.FC<MergePeopleWrapperProps> = ({
  mutationSpy,
  mocks = getPersonDuplicatesMocks,
}) => {
  return (
    <ThemeProvider theme={theme}>
      <TestRouter>
        <GqlMockedProvider<{
          GetPersonDuplicates: GetPersonDuplicatesQuery;
        }>
          mocks={mocks}
          onCall={mutationSpy}
        >
          <ContactsWrapper>
            <MergePeople accountListId={accountListId} />
          </ContactsWrapper>
        </GqlMockedProvider>
      </TestRouter>
    </ThemeProvider>
  );
};

describe('Tools - MergePeople', () => {
  it('should render', async () => {
    const { findByTestId } = render(<MergePeopleWrapper />);

    const PeopleMergeDescription = await findByTestId('PeopleMergeDescription');
    expect(PeopleMergeDescription.textContent).toMatch(
      'You have 55 possible duplicate people',
    );
  });

  it('should merge people', async () => {
    const mutationSpy = jest.fn();

    const { getByText, queryAllByTestId, findByText, getByRole } = render(
      <SnackbarProvider>
        <MergePeopleWrapper
          mutationSpy={mutationSpy}
          mocks={{
            GetPersonDuplicates: getPersonDuplicatesMocks.GetPersonDuplicates,
            MergePeopleBulk: () => {
              return { mergePeopleBulk: ['person-1'] };
            },
          }}
        />
      </SnackbarProvider>,
    );

    await waitFor(() =>
      expect(queryAllByTestId('MergeContactPair')).toHaveLength(2),
    );
    expect(getByText('(US Donation Services)')).toBeInTheDocument();

    expect(
      getByRole('button', { name: 'Confirm and Continue' }),
    ).toBeDisabled();
    userEvent.click(queryAllByTestId('ignoreButton')[1]);
    userEvent.click(getByText('(person-1 phone) 555-555-5555'));
    userEvent.click(getByText('(person-1.5 phone) 444-444-4444'));
    userEvent.click(getByText('(person-1 phone) 555-555-5555'));
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

  it('should ignore duplicates', async () => {
    const mutationSpy = jest.fn();

    const {
      queryByText,
      queryAllByTestId,
      findByText,
      getByRole,
      queryByTestId,
      getByText,
    } = render(
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
      .filter(({ operationName }) => operationName === 'MergePeopleBulk');
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
        type: TypeEnum.Person,
        id: '1',
      },
    });
    expect(queryByTestId('ignoreButton')).not.toBeInTheDocument();
    expect(getByText('No duplicate people need attention')).toBeInTheDocument();
  });

  it('should show error', async () => {
    const mutationSpy = jest.fn();

    const { queryAllByTestId, getByRole } = render(
      <SnackbarProvider>
        <MergePeopleWrapper
          mutationSpy={mutationSpy}
          mocks={{
            GetPersonDuplicates: getPersonDuplicatesMocks.GetPersonDuplicates,
            UpdateDuplicate: () => {
              throw new Error('Server Error');
            },
            MergePeopleBulk: () => {
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
    (useAccountListId as jest.Mock).mockReturnValue(accountListId);

    const { findByRole } = render(<MergePeopleWrapper />);

    const contactName = await findByRole('link', {
      name: 'Ellie Francisco',
    });
    expect(contactName).toHaveAttribute(
      'href',
      `/accountLists/${accountListId}/tools/merge/people/contact-2`,
    );
  });
});
