import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { GqlMockedProvider } from '../../../../../../../__tests__/util/graphqlMocking';
import theme from '../../../../../../theme';
import ExportEmail from './ExportEmail';
import { GetEmailNewsletterContactsQuery } from './GetNewsletterContacts.generated';

const accountListId = '111';
const handleClose = jest.fn();

describe('LogNewsletter', () => {
  it('default', () => {
    const { queryByText } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<GetEmailNewsletterContactsQuery>>
          <ExportEmail
            accountListId={accountListId}
            handleClose={handleClose}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
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
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<GetEmailNewsletterContactsQuery> mocks={mocks}>
          <ExportEmail
            accountListId={accountListId}
            handleClose={handleClose}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
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
    const { queryByTestId, getByText } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<GetEmailNewsletterContactsQuery> mocks={mocks}>
          <ExportEmail
            accountListId={accountListId}
            handleClose={handleClose}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );
    await waitFor(() => expect(queryByTestId('emailList')).not.toBeNull());
    userEvent.click(getByText('Copy All'));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      `${email1},${email2}`,
    );
  });
});
