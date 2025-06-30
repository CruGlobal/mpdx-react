import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { ContactsProvider } from 'src/components/Contacts/ContactsContext/ContactsContext';
import { UrlFiltersProvider } from 'src/components/common/UrlFiltersProvider/UrlFiltersProvider';
import {
  ActivityTypeEnum,
  ContactFilterSetInput,
  ContactFilterStatusEnum,
  TaskFilterSetInput,
} from 'src/graphql/types.generated';
import theme from 'src/theme';
import { TableViewModeEnum } from '../Header/ListHeader';
import { FilterPanel } from './FilterPanel';
import {
  FilterPanelGroupFragment,
  UserOptionFragment,
} from './FilterPanel.generated';
import {
  filterPanelDefaultMock,
  filterPanelFeaturedMock,
  filterPanelNoteSearchMock,
  filterPanelRenameMock,
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

const onClose = jest.fn();

const routerReplace = jest.fn();
const mockEnqueue = jest.fn();
const mutationSpy = jest.fn();

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

const deserializeFilters = (filters: string) =>
  JSON.parse(decodeURIComponent(filters));

const router = {
  query: {
    accountListId: 'account-list-1',
    contactId: 'contact-1',
  },
  replace: routerReplace,
  isReady: true,
};

interface TestComponentProps {
  filters: FilterPanelGroupFragment[];
  defaultExpandedFilterGroups?: Set<string>;
  savedFilters: UserOptionFragment[];
  initialFilters?: ContactFilterSetInput & TaskFilterSetInput;
}

const TestComponent: React.FC<TestComponentProps> = ({
  filters,
  defaultExpandedFilterGroups = new Set(),
  savedFilters,
  initialFilters = {},
}) => (
  <TestRouter
    router={{
      ...router,
      query: {
        ...router.query,
        filters: encodeURIComponent(JSON.stringify(initialFilters)),
      },
    }}
  >
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <ThemeProvider theme={theme}>
        <GqlMockedProvider onCall={mutationSpy}>
          <UrlFiltersProvider>
            <ContactsProvider
              filterPanelOpen={false}
              setFilterPanelOpen={jest.fn()}
              viewMode={TableViewModeEnum.List}
              setViewMode={jest.fn()}
            >
              <FilterPanel
                filters={filters}
                defaultExpandedFilterGroups={defaultExpandedFilterGroups}
                savedFilters={savedFilters}
                onClose={onClose}
              />
            </ContactsProvider>
          </UrlFiltersProvider>
        </GqlMockedProvider>
      </ThemeProvider>
    </LocalizationProvider>
  </TestRouter>
);

describe('FilterPanel', () => {
  describe('Contacts', () => {
    it('default', async () => {
      const { getByTestId, getByText, queryByTestId, queryAllByTestId } =
        render(
          <TestComponent
            filters={[filterPanelDefaultMock, filterPanelFeaturedMock]}
            savedFilters={[savedFiltersMock]}
          />,
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
        <TestComponent
          filters={[filterPanelDefaultMock, filterPanelFeaturedMock]}
          savedFilters={[savedFiltersMock]}
        />,
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
      expect(
        deserializeFilters(routerReplace.mock.lastCall[0].query.filters),
      ).toEqual({
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
        <TestComponent
          filters={[filterPanelDefaultMock, filterPanelNoteSearchMock]}
          savedFilters={[savedFiltersMock]}
        />,
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
      expect(
        deserializeFilters(routerReplace.mock.lastCall[0].query.filters),
      ).toEqual({
        notes: { wildcardNoteSearch: 'test' },
      });
    });

    it('should display a selected filter', async () => {
      const {
        getByTestId,
        getByText,
        getAllByText,
        queryByTestId,
        getAllByTestId,
      } = render(
        <TestComponent
          filters={[filterPanelDefaultMock, filterPanelFeaturedMock]}
          savedFilters={[savedFiltersMock]}
          initialFilters={{
            status: [ContactFilterStatusEnum.ContactForAppointment],
          }}
        />,
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
          <TestComponent
            filters={[filterPanelDefaultMock, filterPanelFeaturedMock]}
            savedFilters={[savedFiltersMock, savedGraphQLContactMock]}
          />,
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
      await waitFor(() =>
        expect(
          deserializeFilters(routerReplace.mock.lastCall[0].query.filters),
        ).toEqual({
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
            ContactFilterStatusEnum.NeverContacted,
            ContactFilterStatusEnum.Active,
            ContactFilterStatusEnum.Hidden,
            ContactFilterStatusEnum.Null,
            ContactFilterStatusEnum.PartnerFinancial,
            ContactFilterStatusEnum.AppointmentScheduled,
          ],
          activityType: [
            ActivityTypeEnum.AppointmentInPerson,
            ActivityTypeEnum.PartnerCareSocialMedia,
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
        }),
      );
      expect(getByTestId('FilterPanelActiveFilters').textContent).toBe(
        'Filter (46 active)',
      );
    });

    it('opens and selects a saved filter Two', async () => {
      const { getByTestId, getByText, queryByTestId, queryAllByTestId } =
        render(
          <TestComponent
            filters={[filterPanelDefaultMock, filterPanelFeaturedMock]}
            savedFilters={[savedFiltersMockTwo, savedGraphQLContactMock]}
          />,
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
      expect(
        deserializeFilters(routerReplace.mock.lastCall[0].query.filters),
      ).toEqual({
        excludeTags: null,
        addressHistoric: true,
        addressValid: true,
        almaMater: ['test1', 'test2'],
        newsletter: 'EMAIL',
        contactNewsletter: 'EMAIL_ONLY',
        status: Object.values(ContactFilterStatusEnum),
        activityType: Object.values(ActivityTypeEnum),
        nextAction: Object.values(ActivityTypeEnum),
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
      expect(getByTestId('FilterPanelActiveFilters').textContent).toBe(
        'Filter (10 active)',
      );
    });

    it('opens and selects a saved filter Three', async () => {
      const { getByTestId, getByText, queryByTestId, queryAllByTestId } =
        render(
          <TestComponent
            filters={[filterPanelDefaultMock, filterPanelFeaturedMock]}
            savedFilters={[savedFiltersMockThree, savedGraphQLContactMock]}
          />,
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
      expect(
        deserializeFilters(routerReplace.mock.lastCall[0].query.filters),
      ).toEqual({
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
      expect(getByTestId('FilterPanelActiveFilters').textContent).toBe(
        'Filter (7 active)',
      );
    });

    it('deletes saved filter', async () => {
      const { getByText, getByTestId, queryByTestId, queryAllByTestId } =
        render(
          <TestComponent
            filters={[filterPanelDefaultMock, filterPanelFeaturedMock]}
            savedFilters={[savedFiltersMockThree]}
          />,
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
        <TestComponent filters={[]} savedFilters={[savedFiltersMock]} />,
      );

      await waitFor(() => expect(queryByTestId('LoadingState')).toBeNull());
      expect(queryByTestId('LoadingState')).toBeNull();
      userEvent.click(getByLabelText('Close'));
      expect(onClose).toHaveBeenCalled();
    });

    it('clears filters', async () => {
      const { getByText, queryByTestId, queryAllByTestId } = render(
        <TestComponent
          filters={[filterPanelDefaultMock, filterPanelFeaturedMock]}
          savedFilters={[savedFiltersMock]}
          initialFilters={{
            status: [ContactFilterStatusEnum.ContactForAppointment],
          }}
        />,
      );

      await waitFor(() => expect(queryByTestId('LoadingState')).toBeNull());
      expect(queryByTestId('LoadingState')).toBeNull();
      expect(queryByTestId('ErrorState')).toBeNull();

      expect(queryAllByTestId('FilterGroup').length).toEqual(2);
      expect(getByText('Group 1 (1)')).toBeVisible();

      userEvent.click(getByText('Clear All'));
      expect(routerReplace.mock.lastCall[0].query.filters).toBeUndefined();
    });

    it('no filters', async () => {
      const { queryByTestId, queryAllByTestId } = render(
        <TestComponent
          filters={[]}
          savedFilters={[savedFiltersMock]}
          initialFilters={{
            status: [ContactFilterStatusEnum.ContactForAppointment],
          }}
        />,
      );

      await waitFor(() => expect(queryByTestId('LoadingState')).toBeNull());
      expect(queryByTestId('LoadingState')).toBeNull();
      expect(queryByTestId('ErrorState')).toBeNull();
      expect(queryAllByTestId('FilterGroup').length).toEqual(0);
      expect(queryByTestId('FilterListItemShowAll')).toBeNull();
    });

    it('displays renamed filter names', async () => {
      const { getByText, queryByTestId, getAllByText } = render(
        <TestComponent
          filters={[filterPanelRenameMock, filterPanelFeaturedMock]}
          savedFilters={[savedFiltersMock]}
        />,
      );

      await waitFor(() => expect(queryByTestId('LoadingState')).toBeNull());
      expect(queryByTestId('LoadingState')).toBeNull();
      expect(queryByTestId('ErrorState')).toBeNull();

      userEvent.click(getByText('See More Filters'));
      userEvent.click(getByText('Connecting Partner'));
      await waitFor(() =>
        expect(getAllByText('Connecting Partner')).toHaveLength(4),
      );
    });
  });

  describe('Report Contacts', () => {
    it('default', async () => {
      const { getByTestId, getByText, queryByTestId, queryAllByTestId } =
        render(
          <TestRouter router={router}>
            <TestComponent
              filters={[
                filterPanelDefaultMock,
                filterPanelFeaturedMock,
                filterPanelSlidersMock,
              ]}
              savedFilters={[savedFiltersMock]}
            />
          </TestRouter>,
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
        <TestComponent
          filters={[
            filterPanelDefaultMock,
            filterPanelFeaturedMock,
            filterPanelSlidersMock,
          ]}
          defaultExpandedFilterGroups={new Set(['Group 3'])}
          savedFilters={[savedFiltersMock]}
          initialFilters={{
            status: [ContactFilterStatusEnum.ContactForAppointment],
          }}
        />,
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
          <TestComponent
            filters={[filterPanelDefaultMock, filterPanelFeaturedMock]}
            savedFilters={[savedFiltersMock]}
          />,
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
        <TestComponent
          filters={[filterPanelDefaultMock, filterPanelFeaturedMock]}
          savedFilters={[savedFiltersMock]}
        />,
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
      expect(
        deserializeFilters(routerReplace.mock.lastCall[0].query.filters),
      ).toEqual({
        status: [ContactFilterStatusEnum.ContactForAppointment],
      });
    });

    it('opens and selects a saved filter', async () => {
      const { getByTestId, getByText, queryByTestId, queryAllByTestId } =
        render(
          <TestComponent
            filters={[filterPanelDefaultMock, filterPanelFeaturedMock]}
            savedFilters={[savedGraphQLTaskMock]}
          />,
        );

      await waitFor(() => expect(queryByTestId('LoadingState')).toBeNull());
      expect(queryByTestId('LoadingState')).toBeNull();
      expect(queryByTestId('ErrorState')).toBeNull();

      expect(queryAllByTestId('FilterGroup').length).toEqual(2);
      expect(getByTestId('FilterListItemShowAll')).toBeVisible();
      userEvent.click(getByText('Saved Filters'));
      expect(getByText('GraphQL Task Filter')).toBeVisible();
      userEvent.click(getByText('GraphQL Task Filter'));
      expect(
        deserializeFilters(routerReplace.mock.lastCall[0].query.filters),
      ).toEqual({
        status: [
          ContactFilterStatusEnum.AskInFuture,
          ContactFilterStatusEnum.ContactForAppointment,
        ],
      });
      expect(getByTestId('FilterPanelActiveFilters').textContent).toBe(
        'Filter (1 active)',
      );
    });

    it('opens and selects a note Graph QL search saved filter', async () => {
      const { getByText, queryByTestId } = render(
        <TestComponent
          filters={[filterPanelDefaultMock, filterPanelFeaturedMock]}
          savedFilters={[noteSearchSavedGraphQLFilterMock]}
        />,
      );

      await waitFor(() => expect(queryByTestId('LoadingState')).toBeNull());
      userEvent.click(getByText('Saved Filters'));
      expect(getByText('note search')).toBeVisible();
      userEvent.click(getByText('note search'));
      await waitFor(() =>
        expect(
          deserializeFilters(routerReplace.mock.lastCall[0].query.filters),
        ).toEqual({
          notes: { wildcardNoteSearch: 'test' },
        }),
      );
    });

    it('opens and selects a note search saved filter', async () => {
      const { getByText, queryByTestId } = render(
        <TestComponent
          filters={[filterPanelDefaultMock, filterPanelFeaturedMock]}
          savedFilters={[noteSearchSavedFilterMock]}
        />,
      );

      await waitFor(() => expect(queryByTestId('LoadingState')).toBeNull());
      userEvent.click(getByText('Saved Filters'));
      expect(getByText('note search')).toBeVisible();
      userEvent.click(getByText('note search'));
      await waitFor(() =>
        expect(
          deserializeFilters(routerReplace.mock.lastCall[0].query.filters),
        ).toEqual({
          notes: { wildcardNoteSearch: 'test note search' },
          tags: null,
          excludeTags: null,
          wildcardSearch: '',
        }),
      );
    });

    it('checks that filter names are set correctly', async () => {
      const { getByText, queryByTestId, getByDisplayValue } = render(
        <TestComponent
          filters={[filterPanelDefaultMock, filterPanelNoteSearchMock]}
          savedFilters={[]}
          initialFilters={{
            status: [ContactFilterStatusEnum.ContactForAppointment],
            notes: {
              wildcardNoteSearch: 'Test 1',
            },
          }}
        />,
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
        <TestComponent filters={[]} savedFilters={[savedFiltersMock]} />,
      );

      await waitFor(() => expect(queryByTestId('LoadingState')).toBeNull());
      expect(queryByTestId('LoadingState')).toBeNull();
      userEvent.click(getByLabelText('Close'));
      expect(onClose).toHaveBeenCalled();
    });

    it('clears filters', async () => {
      const { getByText, queryByTestId, queryAllByTestId } = render(
        <TestComponent
          filters={[filterPanelDefaultMock, filterPanelFeaturedMock]}
          savedFilters={[savedFiltersMock]}
          initialFilters={{
            status: [ContactFilterStatusEnum.ContactForAppointment],
          }}
        />,
      );

      await waitFor(() => expect(queryByTestId('LoadingState')).toBeNull());
      expect(queryByTestId('LoadingState')).toBeNull();
      expect(queryByTestId('ErrorState')).toBeNull();

      expect(queryAllByTestId('FilterGroup').length).toEqual(2);
      expect(getByText('Group 1 (1)')).toBeVisible();

      userEvent.click(getByText('Clear All'));
      expect(routerReplace.mock.lastCall[0].query.filters).toBeUndefined();
    });

    it('no filters', async () => {
      const { queryByTestId, queryAllByTestId } = render(
        <TestComponent filters={[]} savedFilters={[]} />,
      );

      await waitFor(() => expect(queryByTestId('LoadingState')).toBeNull());
      expect(queryByTestId('LoadingState')).toBeNull();
      expect(queryAllByTestId('FilterGroup').length).toEqual(0);
      expect(queryByTestId('FilterListItemShowAll')).toBeNull();
    });

    it('does not consider tags any/all as a filter', async () => {
      const { getByRole } = render(
        <TestComponent
          filters={[filterPanelTagsMock]}
          savedFilters={[savedFiltersMock]}
        />,
      );

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
        <TestComponent filters={[]} savedFilters={[]} />,
      );

      expect(queryByRole('button', { name: /^Tags/ })).not.toBeInTheDocument();
    });
  });
});
