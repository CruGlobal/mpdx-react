import React, { useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import {
  ContactFilterSetInput,
  ContactFilterStatusEnum,
  ReportContactFilterSetInput,
  TaskFilterSetInput,
} from 'src/graphql/types.generated';
import theme from 'src/theme';
import { ContactsProvider } from '../../Contacts/ContactsContext/ContactsContext';
import { FilterPanel, FilterPanelProps } from './FilterPanel';
import {
  FilterPanelGroupFragment,
  UserOptionFragment,
} from './FilterPanel.generated';
import {
  filterPanelDefaultMock,
  filterPanelFeaturedMock,
  filterPanelNoteSearchMock,
  filterPanelSlidersMock,
  filterPanelTagsMock,
  noteSearchSavedFilterMock,
  noteSearchSavedGraphQLFilterMock,
  savedFiltersMock,
  savedFiltersMockThree,
  savedFiltersMockTwo,
  savedGraphQLContactMock,
  savedGraphQLTaskMock,
} from './FilterPanel.mocks';

const onSelectedFiltersChanged = jest.fn();
const onClose = jest.fn();

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

const router = {
  query: {
    accountListId: 'account-list-1',
    contactId: 'contact-1',
  },
  isReady: true,
};

describe('FilterPanel', () => {
  type FilterInput = ContactFilterSetInput &
    TaskFilterSetInput &
    ReportContactFilterSetInput;

  interface Props {
    filters: FilterPanelGroupFragment[];
    defaultExpandedFilterGroups?: Set<string>;
    savedFilters: UserOptionFragment[];
    selectedFilters: FilterInput;
    onClose: () => void;
    onSelectedFiltersChanged: (selectedFilters: FilterInput) => void;
  }

  const ContactsProviderFilterWrapper: React.FC<Props> = ({
    filters,
    defaultExpandedFilterGroups = new Set(),
    savedFilters,
    selectedFilters,
    onClose,
    onSelectedFiltersChanged,
  }) => {
    return (
      <TestRouter router={router}>
        <ContactsProvider
          urlFilters={{}}
          activeFilters={{}}
          setActiveFilters={() => {}}
          starredFilter={{}}
          setStarredFilter={() => {}}
          filterPanelOpen={false}
          setFilterPanelOpen={() => {}}
          contactId={[]}
          searchTerm={'test'}
        >
          <FilterPanel
            filters={filters}
            defaultExpandedFilterGroups={defaultExpandedFilterGroups}
            savedFilters={savedFilters}
            selectedFilters={selectedFilters}
            onClose={onClose}
            onSelectedFiltersChanged={onSelectedFiltersChanged}
          />
        </ContactsProvider>
      </TestRouter>
    );
  };

  describe('Contacts', () => {
    it('default', async () => {
      const { getByTestId, getByText, queryByTestId, queryAllByTestId } =
        render(
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider>
                <ContactsProviderFilterWrapper
                  filters={[filterPanelDefaultMock, filterPanelFeaturedMock]}
                  savedFilters={[savedFiltersMock]}
                  selectedFilters={{}}
                  onClose={onClose}
                  onSelectedFiltersChanged={onSelectedFiltersChanged}
                />
              </GqlMockedProvider>
            </ThemeProvider>
          </LocalizationProvider>,
        );

      await waitFor(() => expect(queryByTestId('LoadingState')).toBeNull());
      expect(queryByTestId('LoadingState')).toBeNull();
      expect(queryByTestId('ErrorState')).toBeNull();
      expect(queryAllByTestId('FilterGroup').length).toEqual(2);
      expect(getByTestId('FilterListItemShowAll')).toBeVisible();

      expect(getByText(filterPanelFeaturedMock.name)).toBeVisible();
      expect(getByText('Saved Filters')).toBeVisible();
      expect(getByText('See More Filters')).toBeVisible();

      userEvent.click(getByTestId('FilterListItemShowAll'));

      expect(getByText('See Fewer Filters')).toBeVisible();
      expect(getByText(filterPanelDefaultMock.name)).toBeVisible();
      expect(getByText(filterPanelFeaturedMock.name)).toBeVisible();
      userEvent.click(getByTestId('FilterListItemShowAll'));

      expect(getByText('See More Filters')).toBeVisible();

      await waitFor(() =>
        expect(getByText(filterPanelDefaultMock.name)).not.toBeVisible(),
      );
      expect(getByText(filterPanelFeaturedMock.name)).toBeVisible();
    });

    it('opens and selects a filter', async () => {
      const {
        getByTestId,
        getByText,
        queryByTestId,
        queryAllByTestId,
        getByRole,
      } = render(
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider>
              <ContactsProviderFilterWrapper
                filters={[filterPanelDefaultMock, filterPanelFeaturedMock]}
                savedFilters={[savedFiltersMock]}
                selectedFilters={{}}
                onClose={onClose}
                onSelectedFiltersChanged={onSelectedFiltersChanged}
              />
            </GqlMockedProvider>
          </ThemeProvider>
        </LocalizationProvider>,
      );

      await waitFor(() => expect(queryByTestId('LoadingState')).toBeNull());
      expect(queryByTestId('LoadingState')).toBeNull();
      expect(queryByTestId('ErrorState')).toBeNull();

      expect(queryAllByTestId('FilterGroup').length).toEqual(2);
      expect(getByTestId('FilterListItemShowAll')).toBeVisible();
      userEvent.click(getByTestId('FilterListItemShowAll'));
      userEvent.click(getByText(filterPanelDefaultMock.name));

      userEvent.click(
        getByRole('button', {
          hidden: true,
          name: 'Group 1',
        }),
      );

      const statusSelect = getByRole('combobox', {
        hidden: true,
        name: 'Status',
      });
      userEvent.click(statusSelect);

      await waitFor(() =>
        expect(getByText('Contact for Appointment')).toBeInTheDocument(),
      );
      userEvent.click(
        await within(getByRole('presentation')).findByText(
          'Contact for Appointment',
        ),
      );
      expect(getByTestId('multiSelectFilter')).toBeInTheDocument();
      expect(onSelectedFiltersChanged).toHaveBeenCalledWith({
        status: [ContactFilterStatusEnum.ContactForAppointment],
      });
    });

    it('opens and uses a note search filter', async () => {
      const {
        getByTestId,
        getByText,
        queryByTestId,
        queryAllByTestId,
        getByRole,
        getAllByText,
      } = render(
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider>
              <ContactsProviderFilterWrapper
                filters={[filterPanelDefaultMock, filterPanelNoteSearchMock]}
                savedFilters={[savedFiltersMock]}
                selectedFilters={{}}
                onClose={onClose}
                onSelectedFiltersChanged={onSelectedFiltersChanged}
              />
            </GqlMockedProvider>
          </ThemeProvider>
        </LocalizationProvider>,
      );

      await waitFor(() => expect(queryByTestId('LoadingState')).toBeNull());
      expect(queryAllByTestId('FilterGroup').length).toEqual(2);
      expect(getByTestId('FilterListItemShowAll')).toBeVisible();
      userEvent.click(getByTestId('FilterListItemShowAll'));

      await waitFor(() =>
        expect(getByText('Search Notes')).toBeInTheDocument(),
      );
      userEvent.click(getByText(filterPanelNoteSearchMock.name));
      await waitFor(() => expect(getAllByText('Notes')).toHaveLength(2));
      userEvent.type(getByRole('textbox'), 'test');
      expect(onSelectedFiltersChanged).toHaveBeenCalledTimes(4);
      expect(
        onSelectedFiltersChanged.mock.calls[0][0].notes.wildcardNoteSearch,
      ).toEqual('t');
      expect(
        onSelectedFiltersChanged.mock.calls[1][0].notes.wildcardNoteSearch,
      ).toEqual('e');
      expect(
        onSelectedFiltersChanged.mock.calls[2][0].notes.wildcardNoteSearch,
      ).toEqual('s');
      expect(
        onSelectedFiltersChanged.mock.calls[3][0].notes.wildcardNoteSearch,
      ).toEqual('t');
    });

    it('should display a selected filter', async () => {
      const {
        getByTestId,
        getByText,
        getAllByText,
        queryByTestId,
        getAllByTestId,
      } = render(
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider>
              <ContactsProviderFilterWrapper
                filters={[filterPanelDefaultMock, filterPanelFeaturedMock]}
                savedFilters={[savedFiltersMock]}
                selectedFilters={{
                  status: [ContactFilterStatusEnum.ContactForAppointment],
                }}
                onClose={onClose}
                onSelectedFiltersChanged={onSelectedFiltersChanged}
              />
            </GqlMockedProvider>
          </ThemeProvider>
        </LocalizationProvider>,
      );

      await waitFor(() => expect(queryByTestId('LoadingState')).toBeNull());
      expect(queryByTestId('LoadingState')).toBeNull();
      expect(queryByTestId('ErrorState')).toBeNull();

      expect(getAllByTestId('FilterGroup').length).toEqual(2);
      userEvent.click(getByText('Group 1 (1)'));
      expect(
        getAllByText(filterPanelDefaultMock.filters[0].title),
      ).toHaveLength(2);
      expect(
        getAllByText(filterPanelDefaultMock.filters[1].title),
      ).toHaveLength(3);
      expect(getByTestId('multiSelectFilter')).toBeInTheDocument();
      expect(getByText('Group 1 (1)')).toBeVisible();
    });

    it('opens and selects a saved filter', async () => {
      const { getByTestId, getByText, queryByTestId, queryAllByTestId } =
        render(
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider>
                <ContactsProviderFilterWrapper
                  filters={[filterPanelDefaultMock, filterPanelFeaturedMock]}
                  savedFilters={[savedFiltersMock, savedGraphQLContactMock]}
                  selectedFilters={{}}
                  onClose={onClose}
                  onSelectedFiltersChanged={onSelectedFiltersChanged}
                />
              </GqlMockedProvider>
            </ThemeProvider>
          </LocalizationProvider>,
        );

      await waitFor(() => expect(queryByTestId('LoadingState')).toBeNull());
      expect(queryByTestId('LoadingState')).toBeNull();
      expect(queryByTestId('ErrorState')).toBeNull();

      expect(queryAllByTestId('FilterGroup').length).toEqual(2);
      expect(getByTestId('FilterListItemShowAll')).toBeVisible();
      userEvent.click(getByText('Saved Filters'));
      expect(getByText('My Cool Filter')).toBeVisible();
      expect(getByText('GraphQL Contact Filter')).toBeVisible();
      userEvent.click(getByText('My Cool Filter'));
      expect(onSelectedFiltersChanged).toHaveBeenCalledWith({
        anyTags: false,
        appeal: [
          '851769ba-b55d-45f3-b784-c4eca7ae99fd',
          '77491693-df83-46ec-b40b-39d07333f47e',
        ],
        church: ['Cool Church II'],
        city: ['Evansville', 'Woodstock'],
        contactInfoAddr: 'Yes',
        contactInfoEmail: 'Yes',
        contactInfoFacebook: 'No',
        contactInfoMobile: 'No',
        contactInfoPhone: 'No',
        contactInfoWorkPhone: 'No',
        contactChurch: ['test1', ' test2'],
        contactCity: ['test1'],
        contactCountry: ['test1', ' test2'],
        contactDesignationAccountId: ['test1', ' test2'],
        contactLikely: ['test1', ' test2'],
        contactMetroArea: ['test1', ' test2'],
        contactPledgeFrequency: ['test1', ' test2'],
        contactReferrer: ['test1', ' test2'],
        contactRegion: ['test1', ' test2'],
        contactState: ['test1'],
        contactTimezone: ['test1', ' test2'],
        completed: true,
        country: ['United States'],
        donation: ['first'],
        donationDate: {
          max: '2021-12-23',
          min: '2021-12-23',
        },
        excludeTags: null,
        locale: ['English'],
        metroArea: ['Cool'],
        newsletter: 'NO_VALUE',
        contactNewsletter: 'ALL',
        nextAsk: {
          max: '2021-12-22',
          min: '2021-11-30',
        },
        notes: { wildcardNoteSearch: 'note1' },
        optOut: 'No',
        overdue: true,
        pledgeAmount: ['35.0', '40.0'],
        pledgeCurrency: ['USD'],
        pledgeFrequency: ['0.46153846153846', '1.0'],
        pledgeLateBy: '30_60',
        pledgeReceived: 'RECEIVED',
        // old MPDX saved filters sometimes have primaryAddress field as this. If not accounted for will cause error.
        primaryAddress: 'primary, null',
        referrer: ['d5b1dab5-e3ae-417d-8f49-2abdd915515b'],
        region: ['Orange County'],
        reverseActivityType: true,
        reverseContactAppeal: true,
        reverseContactChurch: true,
        reverseContactCity: true,
        reverseContactCountry: true,
        reverseContactDesignationAccountId: true,
        reverseContactIds: true,
        reverseContactLikely: true,
        reverseContactMetroArea: true,
        reverseContactPledgeFrequency: true,
        reverseContactReferrer: true,
        reverseContactRegion: true,
        reverseContactState: true,
        reverseContactStatus: true,
        reverseContactTimezone: true,
        reverseContactType: true,
        reverseNextAction: true,
        reverseResult: true,
        reverseTags: true,
        reverseUserIds: true,
        reverseAlmaMater: false,
        reverseAppeal: true,
        state: ['FL'],
        status: [
          'ACTIVE',
          'HIDDEN',
          'NULL',
          'NEVER_CONTACTED',
          'ASK_IN_FUTURE',
          'CULTIVATE_RELATIONSHIP',
          'CONTACT_FOR_APPOINTMENT',
          'APPOINTMENT_SCHEDULED',
          'CALL_FOR_DECISION',
          'PARTNER_FINANCIAL',
          'PARTNER_SPECIAL',
          'PARTNER_PRAY',
          'NOT_INTERESTED',
          'UNRESPONSIVE',
          'NEVER_ASK',
          'RESEARCH_ABANDONED',
          'EXPIRED_REFERRAL',
        ],
        activityType: [
          'APPOINTMENT',
          'CALL',
          'EMAIL',
          'FACEBOOK_MESSAGE',
          'PRAYER_REQUEST',
          'TALK_TO_IN_PERSON',
          'TEXT_MESSAGE',
          'THANK',
          'NONE',
          'LETTER',
          'NEWSLETTER_PHYSICAL',
          'NEWSLETTER_EMAIL',
          'PRE_CALL_LETTER',
          'REMINDER_LETTER',
          'SUPPORT_LETTER',
          'TO_DO',
        ],
        nextAction: [
          'APPOINTMENT',
          'CALL',
          'EMAIL',
          'FACEBOOK_MESSAGE',
          'PRAYER_REQUEST',
          'TALK_TO_IN_PERSON',
          'TEXT_MESSAGE',
          'THANK',
          'NONE',
        ],
        result: [
          'ATTEMPTED',
          'ATTEMPTED_LEFT_MESSAGE',
          'COMPLETED',
          'DONE',
          'NONE',
          'RECEIVED',
        ],
        tags: null,
        timezone: ['America/Vancouver'],
        userIds: ['787f286e-fe38-4055-b9fc-0177a0f55947'],
        wildcardSearch: '',
      });
      expect(getByText('Filter')).toBeVisible();
    });

    it('opens and selects a saved filter Two', async () => {
      const { getByTestId, getByText, queryByTestId, queryAllByTestId } =
        render(
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider>
                <ContactsProviderFilterWrapper
                  filters={[filterPanelDefaultMock, filterPanelFeaturedMock]}
                  savedFilters={[savedFiltersMockTwo, savedGraphQLContactMock]}
                  selectedFilters={{}}
                  onClose={onClose}
                  onSelectedFiltersChanged={onSelectedFiltersChanged}
                />
              </GqlMockedProvider>
            </ThemeProvider>
          </LocalizationProvider>,
        );

      await waitFor(() => expect(queryByTestId('LoadingState')).toBeNull());
      expect(queryByTestId('LoadingState')).toBeNull();
      expect(queryByTestId('ErrorState')).toBeNull();

      expect(queryAllByTestId('FilterGroup').length).toEqual(2);
      expect(getByTestId('FilterListItemShowAll')).toBeVisible();
      userEvent.click(getByText('Saved Filters'));
      expect(getByText('My Cool Filter')).toBeVisible();
      expect(getByText('GraphQL Contact Filter')).toBeVisible();
      userEvent.click(getByText('My Cool Filter'));
      expect(onSelectedFiltersChanged).toHaveBeenCalledWith({
        anyTags: false,
        excludeTags: null,
        addressHistoric: true,
        addressValid: true,
        almaMater: ['test1', 'test2'],
        newsletter: 'EMAIL',
        contactNewsletter: 'EMAIL_ONLY',
        status: [
          'ACTIVE',
          'APPOINTMENT_SCHEDULED',
          'ASK_IN_FUTURE',
          'CALL_FOR_DECISION',
          'CONTACT_FOR_APPOINTMENT',
          'CULTIVATE_RELATIONSHIP',
          'EXPIRED_REFERRAL',
          'HIDDEN',
          'NEVER_ASK',
          'NEVER_CONTACTED',
          'NOT_INTERESTED',
          'NULL',
          'PARTNER_FINANCIAL',
          'PARTNER_PRAY',
          'PARTNER_SPECIAL',
          'RESEARCH_ABANDONED',
          'UNRESPONSIVE',
        ],
        activityType: [
          'APPOINTMENT',
          'CALL',
          'EMAIL',
          'FACEBOOK_MESSAGE',
          'LETTER',
          'NEWSLETTER_EMAIL',
          'NEWSLETTER_PHYSICAL',
          'NONE',
          'PRAYER_REQUEST',
          'PRE_CALL_LETTER',
          'REMINDER_LETTER',
          'SUPPORT_LETTER',
          'TALK_TO_IN_PERSON',
          'TEXT_MESSAGE',
          'THANK',
          'TO_DO',
        ],
        nextAction: [
          'APPOINTMENT',
          'CALL',
          'EMAIL',
          'FACEBOOK_MESSAGE',
          'PRAYER_REQUEST',
          'TALK_TO_IN_PERSON',
          'TEXT_MESSAGE',
          'THANK',
          'NONE',
        ],
        result: [
          'ATTEMPTED',
          'ATTEMPTED_LEFT_MESSAGE',
          'COMPLETED',
          'DONE',
          'NONE',
          'RECEIVED',
        ],
        pledgeReceived: 'NOT_RECEIVED',
        tags: null,
        wildcardSearch: '',
      });
      expect(getByText('Filter')).toBeVisible();
    });

    it('opens and selects a saved filter Three', async () => {
      const { getByTestId, getByText, queryByTestId, queryAllByTestId } =
        render(
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider>
                <ContactsProviderFilterWrapper
                  filters={[filterPanelDefaultMock, filterPanelFeaturedMock]}
                  savedFilters={[
                    savedFiltersMockThree,
                    savedGraphQLContactMock,
                  ]}
                  selectedFilters={{}}
                  onClose={onClose}
                  onSelectedFiltersChanged={onSelectedFiltersChanged}
                />
              </GqlMockedProvider>
            </ThemeProvider>
          </LocalizationProvider>,
        );

      await waitFor(() => expect(queryByTestId('LoadingState')).toBeNull());
      expect(queryByTestId('LoadingState')).toBeNull();
      expect(queryByTestId('ErrorState')).toBeNull();

      expect(queryAllByTestId('FilterGroup').length).toEqual(2);
      expect(getByTestId('FilterListItemShowAll')).toBeVisible();
      userEvent.click(getByText('Saved Filters'));
      expect(getByText('My Cool Filter')).toBeVisible();
      expect(getByText('GraphQL Contact Filter')).toBeVisible();
      userEvent.click(getByText('My Cool Filter'));
      expect(onSelectedFiltersChanged).toHaveBeenCalledWith({
        anyTags: false,
        excludeTags: null,
        addressLatLng: 'test1',
        appealStatus: 'test1',
        contactAppeal: 'test1',
        donationAmountRange: {
          min: 0,
          max: 2000.45,
        },
        newsletter: 'NONE',
        contactNewsletter: 'PHYSICAL',
        pledgeReceived: 'ANY',
        tags: null,
        wildcardSearch: '',
      });
      expect(getByText('Filter')).toBeVisible();
    });

    it('deletes saved filter', async () => {
      const mutationSpy = jest.fn();

      const { getByText, getByTestId, queryByTestId, queryAllByTestId } =
        render(
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider onCall={mutationSpy}>
                <ContactsProviderFilterWrapper
                  filters={[filterPanelDefaultMock, filterPanelFeaturedMock]}
                  savedFilters={[savedFiltersMockThree]}
                  selectedFilters={{}}
                  onClose={onClose}
                  onSelectedFiltersChanged={onSelectedFiltersChanged}
                />
              </GqlMockedProvider>
            </ThemeProvider>
          </LocalizationProvider>,
        );

      await waitFor(() => expect(queryByTestId('LoadingState')).toBeNull());

      expect(queryAllByTestId('FilterGroup').length).toEqual(2);
      expect(getByTestId('FilterListItemShowAll')).toBeVisible();
      userEvent.click(getByText('Saved Filters'));
      expect(getByText('My Cool Filter')).toBeVisible();

      expect(getByTestId('deleteSavedFilter')).toBeVisible();
      userEvent.click(getByTestId('deleteSavedFilter'));

      await waitFor(() =>
        expect(getByText('Delete Saved filter')).toBeVisible(),
      );
      userEvent.click(getByText('No'));
      expect(getByText('Delete Saved filter')).not.toBeVisible();
    });

    it('closes panel', async () => {
      const { queryByTestId, getByLabelText } = render(
        <GqlMockedProvider>
          <ContactsProviderFilterWrapper
            filters={[]}
            savedFilters={[savedFiltersMock]}
            selectedFilters={{}}
            onClose={onClose}
            onSelectedFiltersChanged={onSelectedFiltersChanged}
          />
        </GqlMockedProvider>,
      );

      await waitFor(() => expect(queryByTestId('LoadingState')).toBeNull());
      expect(queryByTestId('LoadingState')).toBeNull();
      userEvent.click(getByLabelText('Close'));
      expect(onClose).toHaveBeenCalled();
    });

    it('clears filters', async () => {
      const { getByText, queryByTestId, queryAllByTestId } = render(
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider>
              <ContactsProviderFilterWrapper
                filters={[filterPanelDefaultMock, filterPanelFeaturedMock]}
                savedFilters={[savedFiltersMock]}
                selectedFilters={{
                  status: [ContactFilterStatusEnum.ContactForAppointment],
                }}
                onClose={onClose}
                onSelectedFiltersChanged={onSelectedFiltersChanged}
              />
            </GqlMockedProvider>
          </ThemeProvider>
        </LocalizationProvider>,
      );

      await waitFor(() => expect(queryByTestId('LoadingState')).toBeNull());
      expect(queryByTestId('LoadingState')).toBeNull();
      expect(queryByTestId('ErrorState')).toBeNull();

      expect(queryAllByTestId('FilterGroup').length).toEqual(2);
      expect(getByText('Group 1 (1)')).toBeVisible();

      userEvent.click(getByText('Clear All'));
      expect(onSelectedFiltersChanged).toHaveBeenCalledWith({});
    });

    it('no filters', async () => {
      const { queryByTestId, queryAllByTestId } = render(
        <GqlMockedProvider>
          <ContactsProviderFilterWrapper
            filters={[]}
            savedFilters={[savedFiltersMock]}
            selectedFilters={{
              status: [ContactFilterStatusEnum.ContactForAppointment],
            }}
            onClose={onClose}
            onSelectedFiltersChanged={onSelectedFiltersChanged}
          />
        </GqlMockedProvider>,
      );

      await waitFor(() => expect(queryByTestId('LoadingState')).toBeNull());
      expect(queryByTestId('LoadingState')).toBeNull();
      expect(queryByTestId('ErrorState')).toBeNull();
      expect(queryAllByTestId('FilterGroup').length).toEqual(0);
      expect(queryByTestId('FilterListItemShowAll')).toBeNull();
    });
  });

  describe('Report Contacts', () => {
    it('default', async () => {
      const { getByTestId, getByText, queryByTestId, queryAllByTestId } =
        render(
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <ThemeProvider theme={theme}>
              <TestRouter router={router}>
                <GqlMockedProvider>
                  <ContactsProviderFilterWrapper
                    filters={[
                      filterPanelDefaultMock,
                      filterPanelFeaturedMock,
                      filterPanelSlidersMock,
                    ]}
                    savedFilters={[savedFiltersMock]}
                    selectedFilters={{}}
                    onClose={onClose}
                    onSelectedFiltersChanged={onSelectedFiltersChanged}
                  />
                </GqlMockedProvider>
              </TestRouter>
            </ThemeProvider>
          </LocalizationProvider>,
        );

      await waitFor(() => expect(queryByTestId('LoadingState')).toBeNull());
      expect(queryByTestId('LoadingState')).toBeNull();
      expect(queryByTestId('ErrorState')).toBeNull();
      expect(queryAllByTestId('FilterGroup')).toHaveLength(3);
      expect(getByTestId('FilterListItemShowAll')).toBeVisible();

      expect(getByText(filterPanelFeaturedMock.name)).toBeVisible();
      expect(getByText('Saved Filters')).toBeVisible();
      expect(getByText('See More Filters')).toBeVisible();

      userEvent.click(getByTestId('FilterListItemShowAll'));

      expect(getByText('See Fewer Filters')).toBeVisible();
      expect(getByText(filterPanelDefaultMock.name)).toBeVisible();
      expect(getByText(filterPanelFeaturedMock.name)).toBeVisible();
      userEvent.click(getByTestId('FilterListItemShowAll'));

      expect(getByText('See More Filters')).toBeVisible();

      await waitFor(() =>
        expect(getByText(filterPanelDefaultMock.name)).not.toBeVisible(),
      );
      expect(getByText(filterPanelFeaturedMock.name)).toBeVisible();
    });

    it('should automatically expand accordions', async () => {
      const { getByTestId, queryByTestId, getAllByTestId } = render(
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider>
              <ContactsProviderFilterWrapper
                filters={[
                  filterPanelDefaultMock,
                  filterPanelFeaturedMock,
                  filterPanelSlidersMock,
                ]}
                defaultExpandedFilterGroups={new Set(['Group 3'])}
                savedFilters={[savedFiltersMock]}
                selectedFilters={{
                  status: [ContactFilterStatusEnum.ContactForAppointment],
                }}
                onClose={onClose}
                onSelectedFiltersChanged={onSelectedFiltersChanged}
              />
            </GqlMockedProvider>
          </ThemeProvider>
        </LocalizationProvider>,
      );

      await waitFor(() => expect(queryByTestId('LoadingState')).toBeNull());
      expect(queryByTestId('LoadingState')).toBeNull();
      expect(queryByTestId('ErrorState')).toBeNull();

      expect(getAllByTestId('FilterGroup')).toHaveLength(3);
      expect(getByTestId('sliderFilter')).toBeInTheDocument();
      expect(queryByTestId('multiSelectFilter')).not.toBeInTheDocument();
    });
  });

  describe('Tasks', () => {
    it('default', async () => {
      const { getByTestId, getByText, queryByTestId, queryAllByTestId } =
        render(
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider>
                <ContactsProviderFilterWrapper
                  filters={[filterPanelDefaultMock, filterPanelFeaturedMock]}
                  savedFilters={[savedFiltersMock]}
                  selectedFilters={{}}
                  onClose={onClose}
                  onSelectedFiltersChanged={onSelectedFiltersChanged}
                />
              </GqlMockedProvider>
            </ThemeProvider>
          </LocalizationProvider>,
        );

      await waitFor(() => expect(queryByTestId('LoadingState')).toBeNull());
      expect(queryByTestId('LoadingState')).toBeNull();
      expect(queryByTestId('ErrorState')).toBeNull();
      expect(queryAllByTestId('FilterGroup').length).toEqual(2);
      expect(getByTestId('FilterListItemShowAll')).toBeVisible();

      expect(getByText(filterPanelFeaturedMock.name)).toBeVisible();

      expect(getByText('See More Filters')).toBeVisible();

      userEvent.click(getByTestId('FilterListItemShowAll'));

      expect(getByText('See Fewer Filters')).toBeVisible();
      expect(getByText(filterPanelFeaturedMock.name)).toBeVisible();
      expect(getByText(filterPanelDefaultMock.name)).toBeVisible();

      userEvent.click(getByTestId('FilterListItemShowAll'));

      expect(getByText('See More Filters')).toBeVisible();

      await waitFor(() =>
        expect(getByText(filterPanelDefaultMock.name)).not.toBeVisible(),
      );

      expect(getByText(filterPanelFeaturedMock.name)).toBeVisible();
    });

    it('opens and selects a filter', async () => {
      const {
        getByTestId,
        getByText,
        queryByTestId,
        queryAllByTestId,
        getByRole,
      } = render(
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider>
              <ContactsProviderFilterWrapper
                filters={[filterPanelDefaultMock, filterPanelFeaturedMock]}
                savedFilters={[savedFiltersMock]}
                selectedFilters={{}}
                onClose={onClose}
                onSelectedFiltersChanged={onSelectedFiltersChanged}
              />
            </GqlMockedProvider>
          </ThemeProvider>
        </LocalizationProvider>,
      );

      await waitFor(() => expect(queryByTestId('LoadingState')).toBeNull());
      expect(queryByTestId('LoadingState')).toBeNull();
      expect(queryByTestId('ErrorState')).toBeNull();

      expect(queryAllByTestId('FilterGroup').length).toEqual(2);
      expect(getByTestId('FilterListItemShowAll')).toBeVisible();
      userEvent.click(getByTestId('FilterListItemShowAll'));
      userEvent.click(getByText(filterPanelDefaultMock.name));

      userEvent.click(
        getByRole('button', {
          hidden: true,
          name: 'Group 1',
        }),
      );

      const statusSelect = getByRole('combobox', {
        hidden: true,
        name: 'Status',
      });
      userEvent.click(statusSelect);

      await waitFor(() =>
        expect(getByText('Contact for Appointment')).toBeInTheDocument(),
      );
      userEvent.click(
        await within(getByRole('presentation')).findByText(
          'Contact for Appointment',
        ),
      );

      expect(getByTestId('multiSelectFilter')).toBeInTheDocument();
      expect(onSelectedFiltersChanged).toHaveBeenCalledWith({
        status: [ContactFilterStatusEnum.ContactForAppointment],
      });
    });

    it('opens and selects a saved filter', async () => {
      const { getByTestId, getByText, queryByTestId, queryAllByTestId } =
        render(
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider>
                <ContactsProviderFilterWrapper
                  filters={[filterPanelDefaultMock, filterPanelFeaturedMock]}
                  savedFilters={[savedGraphQLTaskMock]}
                  selectedFilters={{}}
                  onClose={onClose}
                  onSelectedFiltersChanged={onSelectedFiltersChanged}
                />
              </GqlMockedProvider>
            </ThemeProvider>
          </LocalizationProvider>,
        );

      await waitFor(() => expect(queryByTestId('LoadingState')).toBeNull());
      expect(queryByTestId('LoadingState')).toBeNull();
      expect(queryByTestId('ErrorState')).toBeNull();

      expect(queryAllByTestId('FilterGroup').length).toEqual(2);
      expect(getByTestId('FilterListItemShowAll')).toBeVisible();
      userEvent.click(getByText('Saved Filters'));
      expect(getByText('GraphQL Task Filter')).toBeVisible();
      userEvent.click(getByText('GraphQL Task Filter'));
      expect(onSelectedFiltersChanged).toHaveBeenCalledWith({
        status: ['ASK_IN_FUTURE', 'CONTACT_FOR_APPOINTMENT'],
      });
      expect(getByText('Filter')).toBeVisible();
    });

    it('opens and selects a note Graph QL search saved filter', async () => {
      const { getByText, queryByTestId } = render(
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider>
              <ContactsProviderFilterWrapper
                filters={[filterPanelDefaultMock, filterPanelFeaturedMock]}
                savedFilters={[noteSearchSavedGraphQLFilterMock]}
                selectedFilters={{}}
                onClose={onClose}
                onSelectedFiltersChanged={onSelectedFiltersChanged}
              />
            </GqlMockedProvider>
          </ThemeProvider>
        </LocalizationProvider>,
      );

      await waitFor(() => expect(queryByTestId('LoadingState')).toBeNull());
      userEvent.click(getByText('Saved Filters'));
      expect(getByText('note search')).toBeVisible();
      userEvent.click(getByText('note search'));
      await waitFor(() =>
        expect(onSelectedFiltersChanged.mock.calls[2][0]).toEqual({
          notes: { wildcardNoteSearch: 'test' },
        }),
      );
    });

    it('opens and selects a note search saved filter', async () => {
      const { getByText, queryByTestId } = render(
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider>
              <ContactsProviderFilterWrapper
                filters={[filterPanelDefaultMock, filterPanelFeaturedMock]}
                savedFilters={[noteSearchSavedFilterMock]}
                selectedFilters={{}}
                onClose={onClose}
                onSelectedFiltersChanged={onSelectedFiltersChanged}
              />
            </GqlMockedProvider>
          </ThemeProvider>
        </LocalizationProvider>,
      );

      await waitFor(() => expect(queryByTestId('LoadingState')).toBeNull());
      userEvent.click(getByText('Saved Filters'));
      expect(getByText('note search')).toBeVisible();
      userEvent.click(getByText('note search'));
      await waitFor(() =>
        expect(onSelectedFiltersChanged.mock.calls[1][0]).toEqual({
          anyTags: false,
          notes: { wildcardNoteSearch: 'test note search' },
          tags: null,
          excludeTags: null,
          wildcardSearch: '',
        }),
      );
    });

    it('checks that filter names are set correctly', async () => {
      const { getByText, queryByTestId, getByDisplayValue } = render(
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider>
              <ContactsProviderFilterWrapper
                filters={[filterPanelDefaultMock, filterPanelNoteSearchMock]}
                savedFilters={[]}
                selectedFilters={{
                  status: [ContactFilterStatusEnum.ContactForAppointment],
                  notes: {
                    wildcardNoteSearch: 'Test 1',
                  },
                }}
                onClose={onClose}
                onSelectedFiltersChanged={onSelectedFiltersChanged}
              />
            </GqlMockedProvider>
          </ThemeProvider>
        </LocalizationProvider>,
      );

      await waitFor(() => expect(queryByTestId('LoadingState')).toBeNull());
      const searchNotes = getByText('Search Notes (1)');
      await waitFor(() => expect(searchNotes).toBeInTheDocument());
      userEvent.click(searchNotes);
      await waitFor(() =>
        expect(getByDisplayValue('Test 1')).toBeInTheDocument(),
      );

      const groupOne = getByText('Group 1 (1)');
      await waitFor(() => expect(groupOne).toBeInTheDocument());
      userEvent.click(groupOne);
      await waitFor(() =>
        expect(getByText('Contact for Appointment')).toBeInTheDocument(),
      );
    });

    it('closes panel', async () => {
      const { queryByTestId, getByLabelText } = render(
        <GqlMockedProvider>
          <ContactsProviderFilterWrapper
            filters={[]}
            savedFilters={[savedFiltersMock]}
            selectedFilters={{}}
            onClose={onClose}
            onSelectedFiltersChanged={onSelectedFiltersChanged}
          />
        </GqlMockedProvider>,
      );

      await waitFor(() => expect(queryByTestId('LoadingState')).toBeNull());
      expect(queryByTestId('LoadingState')).toBeNull();
      userEvent.click(getByLabelText('Close'));
      expect(onClose).toHaveBeenCalled();
    });

    it('clears filters', async () => {
      const { getByText, queryByTestId, queryAllByTestId } = render(
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider>
              <ContactsProviderFilterWrapper
                filters={[filterPanelDefaultMock, filterPanelFeaturedMock]}
                savedFilters={[savedFiltersMock]}
                selectedFilters={{
                  status: [ContactFilterStatusEnum.ContactForAppointment],
                }}
                onClose={onClose}
                onSelectedFiltersChanged={onSelectedFiltersChanged}
              />
            </GqlMockedProvider>
          </ThemeProvider>
        </LocalizationProvider>,
      );

      await waitFor(() => expect(queryByTestId('LoadingState')).toBeNull());
      expect(queryByTestId('LoadingState')).toBeNull();
      expect(queryByTestId('ErrorState')).toBeNull();

      expect(queryAllByTestId('FilterGroup').length).toEqual(2);
      expect(getByText('Group 1 (1)')).toBeVisible();

      userEvent.click(getByText('Clear All'));
      expect(onSelectedFiltersChanged).toHaveBeenCalledWith({});
    });

    it('no filters', async () => {
      const { queryByTestId, queryAllByTestId } = render(
        <GqlMockedProvider>
          <ContactsProviderFilterWrapper
            filters={[]}
            savedFilters={[]}
            selectedFilters={{}}
            onClose={onClose}
            onSelectedFiltersChanged={onSelectedFiltersChanged}
          />
        </GqlMockedProvider>,
      );

      await waitFor(() => expect(queryByTestId('LoadingState')).toBeNull());
      expect(queryByTestId('LoadingState')).toBeNull();
      expect(queryAllByTestId('FilterGroup').length).toEqual(0);
      expect(queryByTestId('FilterListItemShowAll')).toBeNull();
    });

    it('does not consider tags any/all as a filter', async () => {
      const ComponentWrapper: React.FC = () => {
        const [selectedFilters, setSelectedFilters] = useState<
          FilterPanelProps['selectedFilters']
        >({});

        return (
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider>
                <ContactsProviderFilterWrapper
                  filters={[filterPanelTagsMock]}
                  savedFilters={[savedFiltersMock]}
                  selectedFilters={selectedFilters}
                  onClose={onClose}
                  onSelectedFiltersChanged={setSelectedFilters}
                />
              </GqlMockedProvider>
            </ThemeProvider>
          </LocalizationProvider>
        );
      };

      const { getByRole } = render(<ComponentWrapper />);

      userEvent.click(
        within(getByRole('button', { name: /^Tags/ })).getByTestId(
          'ExpandMoreIcon',
        ),
      );

      userEvent.click(getByRole('button', { name: 'Any' }));
      expect(getByRole('button', { name: 'Clear All' })).toBeDisabled();

      userEvent.click(getByRole('button', { name: 'Tag 1' }));
      expect(getByRole('button', { name: 'Clear All' })).not.toBeDisabled();
    });

    it('hides tags filter when there are no options', async () => {
      const { queryByRole } = render(
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider>
              <ContactsProviderFilterWrapper
                filters={[]}
                savedFilters={[]}
                selectedFilters={{}}
                onClose={onClose}
                onSelectedFiltersChanged={() => {}}
              />
            </GqlMockedProvider>
          </ThemeProvider>
        </LocalizationProvider>,
      );

      expect(queryByRole('button', { name: /^Tags/ })).not.toBeInTheDocument();
    });
  });
});
