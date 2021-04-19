import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import {
  getContactsForTaskDrawerContactListMock,
  getContactsForTaskDrawerContactListEmptyMock,
  getContactsForTaskDrawerContactListLoadingMock,
  getContactsForTaskDrawerContactListErrorMock,
} from './ContactList.mock';
import TaskDrawerContactList from '.';

const accountListId = 'abc';
const contactIds = ['contact-1', 'contact-2'];

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

describe('TaskDrawerContactList', () => {
  it('default', async () => {
    const { queryByTestId, getAllByTestId, findByTestId } = render(
      <MockedProvider
        mocks={[
          getContactsForTaskDrawerContactListMock(accountListId, contactIds),
        ]}
        addTypename={false}
      >
        <TaskDrawerContactList
          accountListId={accountListId}
          contactIds={contactIds}
        />
      </MockedProvider>,
    );
    await findByTestId('TaskDrawerContactListLoading');
    await waitFor(() =>
      expect(
        queryByTestId('TaskDrawerContactListLoading'),
      ).not.toBeInTheDocument(),
    );
    expect(
      getAllByTestId(/TaskDrawerContactListItem-contact-./).map((element) =>
        element.getAttribute('data-testid'),
      ),
    ).toEqual([
      'TaskDrawerContactListItem-contact-2',
      'TaskDrawerContactListItem-contact-1',
    ]);
  });

  it('loading', async () => {
    const { findByTestId } = render(
      <MockedProvider
        mocks={[
          getContactsForTaskDrawerContactListLoadingMock(
            accountListId,
            contactIds,
          ),
        ]}
        addTypename={false}
      >
        <TaskDrawerContactList
          accountListId={accountListId}
          contactIds={contactIds}
        />
      </MockedProvider>,
    );
    expect(
      await findByTestId('TaskDrawerContactListLoading'),
    ).toBeInTheDocument();
  });

  it('empty', async () => {
    const { queryByTestId, getByTestId } = render(
      <MockedProvider
        mocks={[
          getContactsForTaskDrawerContactListEmptyMock(
            accountListId,
            contactIds,
          ),
        ]}
        addTypename={false}
      >
        <TaskDrawerContactList
          accountListId={accountListId}
          contactIds={contactIds}
        />
      </MockedProvider>,
    );
    await waitFor(() =>
      expect(
        queryByTestId('TaskDrawerContactListLoading'),
      ).not.toBeInTheDocument(),
    );
    expect(getByTestId('TaskDrawerContactListEmpty')).toBeInTheDocument();
  });

  it('error', async () => {
    render(
      <MockedProvider
        mocks={[
          getContactsForTaskDrawerContactListErrorMock(
            accountListId,
            contactIds,
          ),
        ]}
        addTypename={false}
      >
        <TaskDrawerContactList
          accountListId={accountListId}
          contactIds={contactIds}
        />
      </MockedProvider>,
    );

    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith(
        'Error loading data.  Try again.',
        {
          variant: 'error',
        },
      ),
    );
  });
});
