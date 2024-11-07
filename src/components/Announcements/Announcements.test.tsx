import React from 'react';
import { ThemeProvider } from '@emotion/react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { I18nextProvider } from 'react-i18next';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { DisplayMethodEnum } from 'src/graphql/types.generated';
import { dispatch } from 'src/lib/analytics';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import { ContactTagsQuery } from '../Tool/Appeal/InitialPage/AddAppealForm/AddAppealForm.generated';
import { contactTagsMock } from '../Tool/Appeal/InitialPage/AddAppealForm/AddAppealFormMocks';
import { Announcements } from './Announcements';
import {
  AnnouncementFragment,
  AnnouncementsQuery,
} from './Announcements.generated';
import { announcement as defaultAnnouncement } from './Announcements.mock';

jest.mock('src/lib/analytics');

const mutationSpy = jest.fn();
const push = jest.fn();
const accountListId = 'accountListId';
const router = {
  query: { accountListId },
  push,
  isReady: true,
};
const modalAnnouncement = {
  ...defaultAnnouncement,
  displayMethod: DisplayMethodEnum.Modal,
};

interface AnnouncementModalProps {
  announcement?: AnnouncementFragment;
}
const TestComponent: React.FC<AnnouncementModalProps> = ({
  announcement = defaultAnnouncement,
}) => {
  return (
    <I18nextProvider i18n={i18n}>
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <SnackbarProvider>
          <TestRouter router={router}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider<{
                Announcements: AnnouncementsQuery;
                ContactTags: ContactTagsQuery;
              }>
                mocks={{
                  Announcements: {
                    announcements: {
                      nodes: [announcement],
                    },
                  },
                  ContactTags: contactTagsMock,
                }}
                onCall={mutationSpy}
              >
                <Announcements />
              </GqlMockedProvider>
            </ThemeProvider>
          </TestRouter>
        </SnackbarProvider>
      </LocalizationProvider>
    </I18nextProvider>
  );
};

describe('Announcements', () => {
  it('should load and unload MaterialIconsStyles', async () => {
    const { findByText, unmount } = render(<TestComponent />);

    expect(await findByText(defaultAnnouncement.title)).toBeInTheDocument();

    await waitFor(() => {
      const MaterialIconsStyles = document.querySelector(
        'link[id="MaterialIconsStyles"]',
      );
      expect(MaterialIconsStyles).toBeInTheDocument();
    });

    unmount();

    await waitFor(() => {
      const MaterialIconsStyles = document.querySelector(
        'link[id="MaterialIconsStyles"]',
      );
      expect(MaterialIconsStyles).not.toBeInTheDocument();
    });
  });

  describe('Banner', () => {
    it('initial', async () => {
      const { getByRole, findByText, getByText } = render(<TestComponent />);

      expect(await findByText(defaultAnnouncement.title)).toBeInTheDocument();
      expect(getByText(defaultAnnouncement.body as string)).toBeInTheDocument();

      expect(getByRole('button', { name: 'Contacts' })).toBeInTheDocument();
      expect(
        getByRole('button', { name: 'Create Appeal' }),
      ).toBeInTheDocument();

      expect(
        getByRole('button', { name: 'Hide announcement' }),
      ).toBeInTheDocument();
    });

    it('should handle close', async () => {
      const { findByText, getByRole } = render(<TestComponent />);

      expect(await findByText(defaultAnnouncement.title)).toBeInTheDocument();
      userEvent.click(getByRole('button', { name: 'Hide announcement' }));

      await waitFor(() => {
        expect(mutationSpy).toHaveGraphqlOperation('AcknowledgeAnnouncement', {
          input: { announcementId: modalAnnouncement.id, actionId: undefined },
        });
      });
    });
  });

  describe('Modal', () => {
    it('initial', async () => {
      const { findByText, getByRole, getByText, getAllByRole } = render(
        <TestComponent announcement={modalAnnouncement} />,
      );

      expect(await findByText(defaultAnnouncement.title)).toBeInTheDocument();
      expect(getByText(defaultAnnouncement.body as string)).toBeInTheDocument();

      expect(getByRole('button', { name: 'Contacts' })).toBeInTheDocument();
      expect(
        getByRole('button', { name: 'Create Appeal' }),
      ).toBeInTheDocument();

      const closeButtons = getAllByRole('button', { name: 'Close' });
      expect(closeButtons).toHaveLength(2);
    });

    it('should handle close', async () => {
      const { findByText, getAllByRole } = render(
        <TestComponent announcement={modalAnnouncement} />,
      );

      expect(await findByText(defaultAnnouncement.title)).toBeInTheDocument();
      const closeButton = getAllByRole('button', { name: 'Close' })[0];

      userEvent.click(closeButton);

      await waitFor(() => {
        expect(mutationSpy).toHaveGraphqlOperation('AcknowledgeAnnouncement', {
          input: { announcementId: modalAnnouncement.id, actionId: undefined },
        });
      });
    });
  });

  describe('Modal and Banner actions', () => {
    test.each([
      { announcement: defaultAnnouncement, type: 'Banner' },
      { announcement: modalAnnouncement, type: 'Modal' },
    ])(
      'should redirect to the contacts page on the $type',
      async ({ announcement }) => {
        const { findByRole } = render(
          <TestComponent announcement={announcement} />,
        );

        const contactButton = await findByRole('button', {
          name: announcement.actions[0].label,
        });
        userEvent.click(contactButton);

        await waitFor(() => {
          expect(mutationSpy).toHaveGraphqlOperation(
            'AcknowledgeAnnouncement',
            {
              input: {
                announcementId: announcement.id,
                actionId: announcement.actions[0].id,
              },
            },
          );
        });

        expect(push).toHaveBeenCalledWith(
          `/accountLists/accountListId/${announcement.actions[0].args}`,
        );
      },
    );

    test.each([
      { announcement: defaultAnnouncement, type: 'Banner' },
      { announcement: modalAnnouncement, type: 'Modal' },
    ])(
      'should open create appeal modal on the $type',
      async ({ announcement }) => {
        const { findByRole, getByText } = render(
          <TestComponent announcement={announcement} />,
        );

        const button = await findByRole('button', {
          name: announcement.actions[1].label,
        });
        userEvent.click(button);

        await waitFor(() => {
          expect(mutationSpy).toHaveGraphqlOperation(
            'AcknowledgeAnnouncement',
            {
              input: {
                announcementId: announcement.id,
                actionId: announcement.actions[1].id,
              },
            },
          );
        });

        expect(push).not.toHaveBeenCalled();

        await waitFor(() => {
          expect(getByText('Add Appeal')).toBeInTheDocument();
        });
      },
    );

    test.each([
      { announcement: defaultAnnouncement, type: 'Banner' },
      { announcement: modalAnnouncement, type: 'Modal' },
    ])(
      'should track and dispatch the click on the $type',
      async ({ announcement }) => {
        const { findByRole, queryByText } = render(
          <TestComponent announcement={announcement} />,
        );

        const button = await findByRole('button', {
          name: announcement.actions[2].label,
        });
        userEvent.click(button);

        await waitFor(() => {
          expect(dispatch).toHaveBeenCalledWith(announcement.actions[2].args);
        });

        expect(mutationSpy).toHaveGraphqlOperation('AcknowledgeAnnouncement', {
          input: {
            announcementId: announcement.id,
            actionId: announcement.actions[2].id,
          },
        });

        expect(push).not.toHaveBeenCalled();

        await waitFor(() => {
          expect(queryByText('Add Appeal')).not.toBeInTheDocument();
        });
      },
    );
  });
});
