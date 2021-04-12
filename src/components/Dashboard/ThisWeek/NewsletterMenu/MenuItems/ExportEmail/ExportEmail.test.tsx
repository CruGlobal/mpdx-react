import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GqlMockedProvider } from '../../../../../../../__tests__/util/graphqlMocking';
import ExportEmail from './ExportEmail';
import { GetEmailNewsletterContactsQuery } from './GetNewsletterContacts.generated';

const accountListId = '111';
const handleClose = jest.fn();

describe('LogNewsletter', () => {
  it('default', () => {
    const { queryByText } = render(
      <GqlMockedProvider<GetEmailNewsletterContactsQuery>>
        <ExportEmail accountListId={accountListId} handleClose={handleClose} />
      </GqlMockedProvider>,
    );
    expect(queryByText('Email Newsletter List')).toBeInTheDocument();
  });

  it('creates emailList string', async () => {
    const email1 = 'fakeemail1@fake.com';
    const email2 = 'fakeemail2@fake.com';
    const mocks = {
      GetEmailNewsletterContacts: {
        contacts: {
          nodes: [
            {
              primaryPerson: {
                primaryEmailAddress: {
                  email: email1,
                },
              },
            },
            {
              primaryPerson: {
                primaryEmailAddress: {
                  email: email2,
                },
              },
            },
            {
              primaryPerson: null,
            },
          ],
        },
      },
    };
    const { queryByTestId } = render(
      <GqlMockedProvider<GetEmailNewsletterContactsQuery> mocks={mocks}>
        <ExportEmail accountListId={accountListId} handleClose={handleClose} />
      </GqlMockedProvider>,
    );
    await waitFor(() => expect(queryByTestId('emailList')).not.toBeNull());
    expect(queryByTestId('emailList')).toHaveValue(`${email1},${email2}`);
  });

  it('copies emailList to clipboard', async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn(),
      },
    });
    const email1 = 'fakeemail1@fake.com';
    const email2 = 'fakeemail2@fake.com';
    const mocks = {
      GetEmailNewsletterContacts: {
        contacts: {
          nodes: [
            {
              primaryPerson: {
                primaryEmailAddress: {
                  email: email1,
                },
              },
            },
            {
              primaryPerson: {
                primaryEmailAddress: {
                  email: email2,
                },
              },
            },
            {
              primaryPerson: null,
            },
          ],
        },
      },
    };
    const { queryByTestId, queryByText } = render(
      <GqlMockedProvider<GetEmailNewsletterContactsQuery> mocks={mocks}>
        <ExportEmail accountListId={accountListId} handleClose={handleClose} />
      </GqlMockedProvider>,
    );
    await waitFor(() => expect(queryByTestId('emailList')).not.toBeNull());
    userEvent.click(queryByText('Copy All'));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      `${email1},${email2}`,
    );
  });
});
