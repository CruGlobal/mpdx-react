import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import LuxonUtils from '@date-io/luxon';
import { GqlMockedProvider } from '../../../../__tests__/util/graphqlMocking';
import { ContactFilters } from './ContactFilters';
import { ContactFiltersQuery } from './ContactFilters.generated';
import {
  ContactFiltersDefaultMock,
  ContactFiltersEmptyMock,
  ContactFiltersErrorMock,
} from './ContactFilters.mocks';

const accountListId = '111';

describe('ContactFilters', () => {
  it('default', async () => {
    const { getByTestId, getByText, queryByTestId, queryAllByTestId } = render(
      <GqlMockedProvider<ContactFiltersQuery>
        mocks={{ ContactFilters: ContactFiltersDefaultMock }}
      >
        <ContactFilters
          accountListId={accountListId}
          onClose={() => {}}
          selectedFilters={{}}
          onSelectedFiltersChanged={() => {}}
        />
      </GqlMockedProvider>,
    );

    await waitFor(() => expect(queryByTestId('LoadingState')).toBeNull());
    expect(queryByTestId('LoadingState')).toBeNull();
    expect(queryByTestId('ErrorState')).toBeNull();
    expect(queryAllByTestId('FilterGroup').length).toEqual(2);
    expect(getByTestId('FilterListItemShowAll')).toBeVisible();

    expect(
      getByText(
        ContactFiltersDefaultMock.accountList.contactFilterGroups[1].name,
      ),
    ).toBeVisible();

    expect(getByText('See More Filters')).toBeVisible();

    userEvent.click(getByTestId('FilterListItemShowAll'));

    expect(getByText('See Fewer Filters')).toBeVisible();
    expect(
      getByText(
        ContactFiltersDefaultMock.accountList.contactFilterGroups[0].name,
      ),
    ).toBeVisible();
    expect(
      getByText(
        ContactFiltersDefaultMock.accountList.contactFilterGroups[1].name,
      ),
    ).toBeVisible();

    userEvent.click(getByTestId('FilterListItemShowAll'));

    expect(getByText('See More Filters')).toBeVisible();

    await waitFor(() =>
      expect(
        getByText(
          ContactFiltersDefaultMock.accountList.contactFilterGroups[0].name,
        ),
      ).not.toBeVisible(),
    );

    expect(
      getByText(
        ContactFiltersDefaultMock.accountList.contactFilterGroups[1].name,
      ),
    ).toBeVisible();
  });

  it('opens and selects a filter', async () => {
    const { getByTestId, getByText, queryByTestId, queryAllByTestId } = render(
      <MuiPickersUtilsProvider utils={LuxonUtils}>
        <GqlMockedProvider<ContactFiltersQuery>
          mocks={{ ContactFilters: ContactFiltersDefaultMock }}
        >
          <ContactFilters
            accountListId={accountListId}
            onClose={() => {}}
            selectedFilters={{}}
            onSelectedFiltersChanged={() => {}}
          />
        </GqlMockedProvider>
      </MuiPickersUtilsProvider>,
    );

    await waitFor(() => expect(queryByTestId('LoadingState')).toBeNull());
    expect(queryByTestId('LoadingState')).toBeNull();
    expect(queryByTestId('ErrorState')).toBeNull();

    expect(queryAllByTestId('FilterGroup').length).toEqual(2);
    expect(getByTestId('FilterListItemShowAll')).toBeVisible();
    userEvent.click(getByTestId('FilterListItemShowAll'));
    userEvent.click(
      getByText(
        ContactFiltersDefaultMock.accountList.contactFilterGroups[0].name,
      ),
    );
    expect(
      getByText(
        ContactFiltersDefaultMock.accountList.contactFilterGroups[0].filters[0]
          .title,
      ),
    ).toBeVisible();
    expect(
      getByText(
        ContactFiltersDefaultMock.accountList.contactFilterGroups[0].filters[1]
          .title,
      ),
    ).toBeVisible();
    const option1 =
      ContactFiltersDefaultMock.accountList.contactFilterGroups[0].filters[1]
        ?.options &&
      getByText(
        ContactFiltersDefaultMock.accountList.contactFilterGroups[0].filters[1]
          .options[0].name,
      );
    expect(option1).toBeVisible();
    userEvent.click(queryAllByTestId('CheckboxIcon')[0]);
    expect(option1).toBeVisible();
    await waitFor(() => userEvent.click(getByTestId('CloseFilterGroupButton')));

    expect(getByText('Group 1 (1)')).toBeVisible();
  });

  it('clears filters', async () => {
    const { getByTestId, getByText, queryByTestId, queryAllByTestId } = render(
      <MuiPickersUtilsProvider utils={LuxonUtils}>
        <GqlMockedProvider<ContactFiltersQuery>
          mocks={{ ContactFilters: ContactFiltersDefaultMock }}
        >
          <ContactFilters
            accountListId={accountListId}
            onClose={() => {}}
            selectedFilters={{}}
            onSelectedFiltersChanged={() => {}}
          />
        </GqlMockedProvider>
      </MuiPickersUtilsProvider>,
    );

    await waitFor(() => expect(queryByTestId('LoadingState')).toBeNull());
    expect(queryByTestId('LoadingState')).toBeNull();
    expect(queryByTestId('ErrorState')).toBeNull();

    expect(queryAllByTestId('FilterGroup').length).toEqual(2);
    expect(getByTestId('FilterListItemShowAll')).toBeVisible();
    userEvent.click(getByTestId('FilterListItemShowAll'));
    userEvent.click(
      getByText(
        ContactFiltersDefaultMock.accountList.contactFilterGroups[0].name,
      ),
    );

    userEvent.click(queryAllByTestId('CheckboxIcon')[0]);

    await waitFor(() => userEvent.click(getByTestId('CloseFilterGroupButton')));

    expect(getByText('Group 1 (1)')).toBeVisible();

    userEvent.click(getByText('Clear All'));
    expect(getByText('Group 1')).toBeVisible();
    expect(getByText('Filter')).toBeVisible();
  });

  it('no filters', async () => {
    const { queryByTestId, queryAllByTestId } = render(
      <GqlMockedProvider<ContactFiltersQuery>
        mocks={{ ContactFilters: ContactFiltersEmptyMock }}
      >
        <ContactFilters
          accountListId={accountListId}
          onClose={() => {}}
          selectedFilters={{}}
          onSelectedFiltersChanged={() => {}}
        />
      </GqlMockedProvider>,
    );

    await waitFor(() => expect(queryByTestId('LoadingState')).toBeNull());
    expect(queryByTestId('LoadingState')).toBeNull();
    //expect(queryByTestId('ErrorState')).toBeNull();
    expect(queryAllByTestId('FilterGroup').length).toEqual(0);
    expect(queryByTestId('FilterListItemShowAll')).toBeNull();
  });

  it('loading indicator', async () => {
    const { getByTestId, queryByTestId, queryAllByTestId } = render(
      <GqlMockedProvider<ContactFiltersQuery>>
        <ContactFilters
          accountListId={accountListId}
          onClose={() => {}}
          selectedFilters={{}}
          onSelectedFiltersChanged={() => {}}
        />
      </GqlMockedProvider>,
    );

    expect(getByTestId('LoadingState')).toBeVisible();
    expect(queryByTestId('ErrorText')).toBeNull();
    expect(queryAllByTestId('FilterGroup').length).toEqual(0);
    expect(queryByTestId('FilterListItemShowAll')).toBeNull();
  });

  it('error loading filters', async () => {
    const { getByTestId, queryByTestId, queryAllByTestId } = render(
      <GqlMockedProvider<ContactFiltersQuery>
        mocks={{ ContactFilters: ContactFiltersErrorMock }}
      >
        <ContactFilters
          accountListId={accountListId}
          onClose={() => {}}
          selectedFilters={{}}
          onSelectedFiltersChanged={() => {}}
        />
      </GqlMockedProvider>,
    );

    await waitFor(() => expect(queryByTestId('LoadingState')).toBeNull());
    expect(queryByTestId('LoadingState')).toBeNull();
    expect(getByTestId('ErrorState')).toBeVisible();
    expect(queryAllByTestId('FilterGroup').length).toEqual(0);
    expect(queryByTestId('FilterListItemShowAll')).toBeNull();
  });
});
