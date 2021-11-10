import React from 'react';
import { render, waitFor } from '@testing-library/react';
import LuxonUtils from '@date-io/luxon';
import userEvent from '@testing-library/user-event';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { gqlMock } from '../../../../__tests__/util/graphqlMocking';
import {
  ContactFilterStatusEnum,
  MultiselectFilter,
} from '../../../../graphql/types.generated';
import {
  mockDateRangeFilter,
  mockMultiselectFilterFeatured,
  mockMultiselectFilterNonFeatured,
  mockTextFilter,
} from './FilterPanel.mocks';
import { FilterPanel } from './FilterPanel';
import {
  FilterPanelGroupFragment,
  FilterPanelGroupFragmentDoc,
} from './FilterPanel.generated';

const onSelectedFiltersChanged = jest.fn();
const onClose = jest.fn();

const filterPanelDefaultMock = gqlMock<FilterPanelGroupFragment>(
  FilterPanelGroupFragmentDoc,
  {
    mocks: {
      name: 'Group 1',
      filters: [mockTextFilter, mockMultiselectFilterNonFeatured],
    },
  },
);
const filterPanelFeaturedMock = gqlMock<FilterPanelGroupFragment>(
  FilterPanelGroupFragmentDoc,
  {
    mocks: {
      name: 'Group 2',
      filters: [mockMultiselectFilterFeatured, mockDateRangeFilter],
    },
  },
);

describe('FilterPanel', () => {
  describe('Contacts', () => {
    it('default', async () => {
      const {
        getByTestId,
        getByText,
        queryByTestId,
        queryAllByTestId,
      } = render(
        <FilterPanel
          filters={[filterPanelDefaultMock, filterPanelFeaturedMock]}
          selectedFilters={{}}
          onClose={onClose}
          onSelectedFiltersChanged={onSelectedFiltersChanged}
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
      } = render(
        <MuiPickersUtilsProvider utils={LuxonUtils}>
          <FilterPanel
            filters={[filterPanelDefaultMock, filterPanelFeaturedMock]}
            selectedFilters={{}}
            onClose={onClose}
            onSelectedFiltersChanged={onSelectedFiltersChanged}
          />
        </MuiPickersUtilsProvider>,
      );

      await waitFor(() => expect(queryByTestId('LoadingState')).toBeNull());
      expect(queryByTestId('LoadingState')).toBeNull();
      expect(queryByTestId('ErrorState')).toBeNull();

      expect(queryAllByTestId('FilterGroup').length).toEqual(2);
      expect(getByTestId('FilterListItemShowAll')).toBeVisible();
      userEvent.click(getByTestId('FilterListItemShowAll'));
      userEvent.click(getByText(filterPanelDefaultMock.name));
      expect(getByText(filterPanelDefaultMock.filters[0].title)).toBeVisible();
      expect(getByText(filterPanelDefaultMock.filters[1].title)).toBeVisible();

      const option1 =
        (filterPanelDefaultMock.filters[1] as MultiselectFilter)?.options &&
        getByText(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          (filterPanelDefaultMock.filters[1] as MultiselectFilter)?.options[0]
            .name,
        );
      expect(option1).toBeVisible();
      userEvent.click(queryAllByTestId('CheckboxIcon')[0]);
      expect(option1).toBeVisible();
      await waitFor(() =>
        userEvent.click(getByTestId('CloseFilterGroupButton')),
      );
      expect(onSelectedFiltersChanged).toHaveBeenCalledWith({
        status: [ContactFilterStatusEnum.ContactForAppointment],
      });
    });

    it('should display a selected filter', async () => {
      const { getByText, queryByTestId, getAllByTestId, getAllByRole } = render(
        <MuiPickersUtilsProvider utils={LuxonUtils}>
          <FilterPanel
            filters={[filterPanelDefaultMock, filterPanelFeaturedMock]}
            selectedFilters={{
              status: [ContactFilterStatusEnum.ContactForAppointment],
            }}
            onClose={onClose}
            onSelectedFiltersChanged={onSelectedFiltersChanged}
          />
        </MuiPickersUtilsProvider>,
      );

      await waitFor(() => expect(queryByTestId('LoadingState')).toBeNull());
      expect(queryByTestId('LoadingState')).toBeNull();
      expect(queryByTestId('ErrorState')).toBeNull();

      expect(getAllByTestId('FilterGroup').length).toEqual(2);
      userEvent.click(getByText('Group 1 (1)'));
      expect(getByText(filterPanelDefaultMock.filters[0].title)).toBeVisible();
      expect(getByText(filterPanelDefaultMock.filters[1].title)).toBeVisible();

      expect(getByText('Group 1 (1)')).toBeVisible();

      expect(getAllByRole('checkbox')[0]).toBeChecked();
    });

    it('closes panel', async () => {
      const { queryByTestId, getByLabelText } = render(
        <FilterPanel
          filters={[]}
          selectedFilters={{}}
          onClose={onClose}
          onSelectedFiltersChanged={onSelectedFiltersChanged}
        />,
      );

      await waitFor(() => expect(queryByTestId('LoadingState')).toBeNull());
      expect(queryByTestId('LoadingState')).toBeNull();
      userEvent.click(getByLabelText('Close'));
      expect(onClose).toHaveBeenCalled();
    });

    it('clears filters', async () => {
      const { getByText, queryByTestId, queryAllByTestId } = render(
        <MuiPickersUtilsProvider utils={LuxonUtils}>
          <FilterPanel
            filters={[filterPanelDefaultMock, filterPanelFeaturedMock]}
            selectedFilters={{
              status: [ContactFilterStatusEnum.ContactForAppointment],
            }}
            onClose={onClose}
            onSelectedFiltersChanged={onSelectedFiltersChanged}
          />
        </MuiPickersUtilsProvider>,
      );

      await waitFor(() => expect(queryByTestId('LoadingState')).toBeNull());
      expect(queryByTestId('LoadingState')).toBeNull();
      expect(queryByTestId('ErrorState')).toBeNull();

      expect(queryAllByTestId('FilterGroup').length).toEqual(2);
      expect(getByText('Group 1 (1)')).toBeVisible();

      await waitFor(() => userEvent.click(getByText('Clear All')));
      expect(onSelectedFiltersChanged).toHaveBeenCalledWith({});
    });

    it('no filters', async () => {
      const { queryByTestId, queryAllByTestId } = render(
        <FilterPanel
          filters={[]}
          selectedFilters={{}}
          onClose={onClose}
          onSelectedFiltersChanged={onSelectedFiltersChanged}
        />,
      );

      await waitFor(() => expect(queryByTestId('LoadingState')).toBeNull());
      expect(queryByTestId('LoadingState')).toBeNull();
      expect(queryByTestId('ErrorState')).toBeNull();
      expect(queryAllByTestId('FilterGroup').length).toEqual(0);
      expect(queryByTestId('FilterListItemShowAll')).toBeNull();
    });
  });

  describe('Tasks', () => {
    it('default', async () => {
      const {
        getByTestId,
        getByText,
        queryByTestId,
        queryAllByTestId,
      } = render(
        <FilterPanel
          filters={[filterPanelDefaultMock, filterPanelFeaturedMock]}
          selectedFilters={{}}
          onClose={onClose}
          onSelectedFiltersChanged={onSelectedFiltersChanged}
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
      } = render(
        <MuiPickersUtilsProvider utils={LuxonUtils}>
          <FilterPanel
            filters={[filterPanelDefaultMock, filterPanelFeaturedMock]}
            selectedFilters={{}}
            onClose={onClose}
            onSelectedFiltersChanged={onSelectedFiltersChanged}
          />
        </MuiPickersUtilsProvider>,
      );

      await waitFor(() => expect(queryByTestId('LoadingState')).toBeNull());
      expect(queryByTestId('LoadingState')).toBeNull();
      expect(queryByTestId('ErrorState')).toBeNull();

      expect(queryAllByTestId('FilterGroup').length).toEqual(2);
      expect(getByTestId('FilterListItemShowAll')).toBeVisible();
      userEvent.click(getByTestId('FilterListItemShowAll'));
      userEvent.click(getByText(filterPanelDefaultMock.name));
      expect(getByText(filterPanelDefaultMock.filters[0].title)).toBeVisible();
      expect(getByText(filterPanelDefaultMock.filters[1].title)).toBeVisible();
      const option1 =
        (filterPanelDefaultMock.filters[1] as MultiselectFilter)?.options &&
        getByText(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          (filterPanelDefaultMock.filters[1] as MultiselectFilter).options[0]
            .name,
        );
      expect(option1).toBeVisible();
      userEvent.click(queryAllByTestId('CheckboxIcon')[0]);
      expect(option1).toBeVisible();
      await waitFor(() =>
        userEvent.click(getByTestId('CloseFilterGroupButton')),
      );

      expect(onSelectedFiltersChanged).toHaveBeenCalledWith({
        status: [ContactFilterStatusEnum.ContactForAppointment],
      });
    });

    it('closes panel', async () => {
      const { queryByTestId, getByLabelText } = render(
        <FilterPanel
          filters={[]}
          selectedFilters={{}}
          onClose={onClose}
          onSelectedFiltersChanged={onSelectedFiltersChanged}
        />,
      );

      await waitFor(() => expect(queryByTestId('LoadingState')).toBeNull());
      expect(queryByTestId('LoadingState')).toBeNull();
      userEvent.click(getByLabelText('Close'));
      expect(onClose).toHaveBeenCalled();
    });

    it('clears filters', async () => {
      const { getByText, queryByTestId, queryAllByTestId } = render(
        <MuiPickersUtilsProvider utils={LuxonUtils}>
          <FilterPanel
            filters={[filterPanelDefaultMock, filterPanelFeaturedMock]}
            selectedFilters={{
              status: [ContactFilterStatusEnum.ContactForAppointment],
            }}
            onClose={onClose}
            onSelectedFiltersChanged={onSelectedFiltersChanged}
          />
        </MuiPickersUtilsProvider>,
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
        <FilterPanel
          filters={[]}
          selectedFilters={{}}
          onClose={onClose}
          onSelectedFiltersChanged={onSelectedFiltersChanged}
        />,
      );

      await waitFor(() => expect(queryByTestId('LoadingState')).toBeNull());
      expect(queryByTestId('LoadingState')).toBeNull();
      expect(queryAllByTestId('FilterGroup').length).toEqual(0);
      expect(queryByTestId('FilterListItemShowAll')).toBeNull();
    });
  });
});
