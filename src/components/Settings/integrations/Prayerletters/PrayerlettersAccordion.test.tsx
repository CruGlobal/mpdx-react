import { PropsWithChildren } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import * as Types from 'src/graphql/types.generated';
import theme from 'src/theme';
import { PrayerlettersAccordion } from './PrayerlettersAccordion';
import { PrayerlettersAccountQuery } from './PrayerlettersAccount.generated';

jest.mock('next-auth/react');

const accountListId = 'account-list-1';
const contactId = 'contact-1';
const router = {
  query: { accountListId, contactId: [contactId] },
  isReady: true,
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

const handleAccordionChange = jest.fn();

const Components = ({ children }: PropsWithChildren) => (
  <SnackbarProvider>
    <TestRouter router={router}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </TestRouter>
  </SnackbarProvider>
);

const standardPrayerlettersAccount: Types.PrayerlettersAccount = {
  __typename: 'PrayerlettersAccount',
  validToken: true,
};

describe('PrayerlettersAccount', () => {
  process.env.OAUTH_URL = 'https://auth.mpdx.org';
  it('should render accordion closed', async () => {
    const { getByText, queryByRole } = render(
      <Components>
        <GqlMockedProvider>
          <PrayerlettersAccordion
            handleAccordionChange={handleAccordionChange}
            expandedPanel={''}
          />
        </GqlMockedProvider>
      </Components>,
    );
    expect(getByText('prayerletters.com')).toBeInTheDocument();
    const image = queryByRole('img', {
      name: /prayerletters.com/i,
    });
    expect(image).not.toBeInTheDocument();
  });
  it('should render accordion open', async () => {
    const { queryByRole } = render(
      <Components>
        <GqlMockedProvider>
          <PrayerlettersAccordion
            handleAccordionChange={handleAccordionChange}
            expandedPanel={'prayerletters.com'}
          />
        </GqlMockedProvider>
      </Components>,
    );
    const image = queryByRole('img', {
      name: /prayerletters.com/i,
    });
    expect(image).toBeInTheDocument();
  });

  describe('Not Connected', () => {
    it('should render PrayerLetters.com Overview', async () => {
      process.env.SITE_URL = 'https://next.mpdx.org';
      const { getByText } = render(
        <Components>
          <GqlMockedProvider<{
            PrayerlettersAccount: PrayerlettersAccountQuery;
          }>
            mocks={{
              PrayerlettersAccount: {
                prayerlettersAccount: [],
              },
            }}
          >
            <PrayerlettersAccordion
              handleAccordionChange={handleAccordionChange}
              expandedPanel={'prayerletters.com'}
            />
          </GqlMockedProvider>
        </Components>,
      );

      await waitFor(() => {
        expect(getByText('PrayerLetters.com Overview')).toBeInTheDocument();
      });
      userEvent.click(getByText('Connect prayerletters.com Account'));

      expect(getByText('Connect prayerletters.com Account')).toHaveAttribute(
        'href',
        `https://auth.mpdx.org/auth/user/prayer_letters?account_list_id=account-list-1&redirect_to=https%3A%2F%2Fnext.mpdx.org%2FaccountLists%2Faccount-list-1%2Fsettings%2Fintegrations%3FselectedTab%3Dprayerletters.com&access_token=apiToken`,
      );
    });
  });

  describe('Connected', () => {
    let prayerlettersAccount = { ...standardPrayerlettersAccount };

    beforeEach(() => {
      prayerlettersAccount = { ...standardPrayerlettersAccount };
    });
    it('is connected but token is not valid', async () => {
      process.env.SITE_URL = 'https://next.mpdx.org';
      prayerlettersAccount.validToken = false;
      const mutationSpy = jest.fn();
      const { queryByText, getByText, getByRole } = render(
        <Components>
          <GqlMockedProvider<{
            PrayerlettersAccount: PrayerlettersAccountQuery;
          }>
            mocks={{
              PrayerlettersAccount: {
                prayerlettersAccount: [prayerlettersAccount],
              },
            }}
            onCall={mutationSpy}
          >
            <PrayerlettersAccordion
              handleAccordionChange={handleAccordionChange}
              expandedPanel={'prayerletters.com'}
            />
          </GqlMockedProvider>
        </Components>,
      );

      await waitFor(() => {
        expect(
          queryByText('Refresh prayerletters.com Account'),
        ).toBeInTheDocument();
      });

      expect(getByText('Refresh prayerletters.com Account')).toHaveAttribute(
        'href',
        `https://auth.mpdx.org/auth/user/prayer_letters?account_list_id=account-list-1&redirect_to=https%3A%2F%2Fnext.mpdx.org%2FaccountLists%2Faccount-list-1%2Fsettings%2Fintegrations%3FselectedTab%3Dprayerletters.com&access_token=apiToken`,
      );

      userEvent.click(
        getByRole('button', {
          name: /disconnect/i,
        }),
      );

      await waitFor(() => {
        expect(
          queryByText(
            'Are you sure you wish to disconnect this Prayer Letters account?',
          ),
        ).toBeInTheDocument();
      });

      userEvent.click(
        getByRole('button', {
          name: /confirm/i,
        }),
      );

      await waitFor(() => {
        expect(mockEnqueue).toHaveBeenCalledWith(
          '{{appName}} removed your integration with Prayer Letters',
          {
            variant: 'success',
          },
        );
        expect(mutationSpy.mock.calls[1][0].operation.operationName).toEqual(
          'DeletePrayerlettersAccount',
        );
        expect(mutationSpy.mock.calls[1][0].operation.variables.input).toEqual({
          accountListId: accountListId,
        });
      });
    });

    it('is connected but token is valid', async () => {
      const mutationSpy = jest.fn();
      const { queryByText, getByRole } = render(
        <Components>
          <GqlMockedProvider<{
            PrayerlettersAccount: PrayerlettersAccountQuery;
          }>
            mocks={{
              PrayerlettersAccount: {
                prayerlettersAccount: [prayerlettersAccount],
              },
            }}
            onCall={mutationSpy}
          >
            <PrayerlettersAccordion
              handleAccordionChange={handleAccordionChange}
              expandedPanel={'prayerletters.com'}
            />
          </GqlMockedProvider>
        </Components>,
      );

      await waitFor(() => {
        expect(
          queryByText(
            'We strongly recommend only making changes in {{appName}}.',
          ),
        ).toBeInTheDocument();
      });

      userEvent.click(
        getByRole('button', {
          name: /disconnect/i,
        }),
      );
      await waitFor(() => {
        expect(
          queryByText(
            'Are you sure you wish to disconnect this Prayer Letters account?',
          ),
        ).toBeInTheDocument();
      });

      userEvent.click(
        getByRole('button', {
          name: /confirm/i,
        }),
      );

      await waitFor(() => {
        expect(mockEnqueue).toHaveBeenCalledWith(
          '{{appName}} removed your integration with Prayer Letters',
          {
            variant: 'success',
          },
        );
        expect(mutationSpy.mock.calls[1][0].operation.operationName).toEqual(
          'DeletePrayerlettersAccount',
        );
        expect(mutationSpy.mock.calls[1][0].operation.variables.input).toEqual({
          accountListId: accountListId,
        });
      });
    });

    it('should sync contacts', async () => {
      const mutationSpy = jest.fn();
      const { queryByText, getByRole } = render(
        <Components>
          <GqlMockedProvider<{
            PrayerlettersAccount: PrayerlettersAccountQuery;
          }>
            mocks={{
              PrayerlettersAccount: {
                prayerlettersAccount: [prayerlettersAccount],
              },
            }}
            onCall={mutationSpy}
          >
            <PrayerlettersAccordion
              handleAccordionChange={handleAccordionChange}
              expandedPanel={'prayerletters.com'}
            />
          </GqlMockedProvider>
        </Components>,
      );

      await waitFor(() => {
        expect(
          queryByText(
            'We strongly recommend only making changes in {{appName}}.',
          ),
        ).toBeInTheDocument();
      });

      userEvent.click(
        getByRole('button', {
          name: /sync now/i,
        }),
      );

      await waitFor(() => {
        expect(mockEnqueue).toHaveBeenCalledWith(
          '{{appName}} is now syncing your newsletter recipients with Prayer Letters',
          {
            variant: 'success',
          },
        );
        expect(mutationSpy.mock.calls[1][0].operation.operationName).toEqual(
          'SyncPrayerlettersAccount',
        );
        expect(mutationSpy.mock.calls[1][0].operation.variables.input).toEqual({
          accountListId: accountListId,
        });
      });
    });
  });
});
