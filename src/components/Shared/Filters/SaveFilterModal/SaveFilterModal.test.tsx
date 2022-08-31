import { ThemeProvider } from '@mui/material';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import React from 'react';
import {
  gqlMock,
  GqlMockedProvider,
} from '../../../../../__tests__/util/graphqlMocking';
import theme from '../../../../theme';
import {
  UserOptionFragment,
  UserOptionFragmentDoc,
} from '../FilterPanel.generated';
import { SaveFilterModal } from './SaveFilterModal';
import { SaveFilterMutation } from './SaveFilterModal.generated';

//#region Mocks
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

jest.mock('next/router');

const handleClose = jest.fn();

const currentFilters = {
  anyTags: false,
  appeal: [
    '851769ba-b55d-45f3-b784-c4eca7ae99fd',
    '77491693-df83-46ec-b40b-39d07333f47e',
  ],
  church: ['Cool Church II'],
  city: ['Evansville'],
  contactInfoAddr: 'Yes',
  contactInfoEmail: 'Yes',
  contactInfoFacebook: 'No',
};

const savedGraphQLContactMock = gqlMock<UserOptionFragment>(
  UserOptionFragmentDoc,
  {
    mocks: {
      id: '7215b6a3-9085-4eb5-810d-01cdb6ccd997',
      key: 'graphql_saved_contacts_filter_GraphQL_Contact_Filter',
      value:
        '{"status":["ASK_IN_FUTURE","CONTACT_FOR_APPOINTMENT"],"accountListId":"08bb09d1-3b62-4690-9596-b625b8af4750"}',
    },
  },
);

const savedGraphQLTaskMock = gqlMock<UserOptionFragment>(
  UserOptionFragmentDoc,
  {
    mocks: {
      id: '7215b6a3-9085-4eb5-810d-01cdb6ccd997',
      key: 'graphql_saved_tasks_filter_GraphQL_Task_Filter',
      value:
        '{"status":["ASK_IN_FUTURE","CONTACT_FOR_APPOINTMENT"],"accountListId":"08bb09d1-3b62-4690-9596-b625b8af4750"}',
    },
  },
);

const savedFiltersMock = gqlMock<UserOptionFragment>(UserOptionFragmentDoc, {
  mocks: {
    id: '123',
    key: 'saved_contacts_filter_My_Cool_Filter',
    value:
      '{"any_tags":false,"account_list_id":"08bb09d1-3b62-4690-9596-b625b8af4750","params":{"status":"active,hidden,null,Never Contacted,Ask in Future,Cultivate Relationship,Contact for Appointment,Appointment Scheduled,Call for Decision,Partner - Financial,Partner - Special,Partner - Pray,Not Interested,Unresponsive,Never Ask,Research Abandoned,Expired Referral","pledge_received":"true","pledge_amount":"35.0,40.0","pledge_currency":"USD","pledge_frequency":"0.46153846153846,1.0","pledge_late_by":"30_60","newsletter":"no_value","referrer":"d5b1dab5-e3ae-417d-8f49-2abdd915515b","city":"Evansville","state":"FL","country":"United States","metro_area":"Cool","region":"Orange County","contact_info_email":"Yes","contact_info_phone":"No","contact_info_mobile":"No","contact_info_work_phone":"No","contact_info_addr":"Yes","contact_info_facebook":"No","opt_out":"No","church":"Cool Church II","appeal":"851769ba-b55d-45f3-b784-c4eca7ae99fd,77491693-df83-46ec-b40b-39d07333f47e","timezone":"America/Vancouver","locale":"English","donation":"first","donation_date":"2021-12-23..2021-12-23","next_ask":"2021-11-30..2021-12-22","user_ids":"787f286e-fe38-4055-b9fc-0177a0f55947","reverse_appeal":true, "contact_types": "person"},"tags":null,"exclude_tags":null,"wildcard_search":""}',
  },
});
//#endregion

describe('SaveFilterModal', () => {
  //#region SaveFilterModal | Contacts
  describe('Contacts', () => {
    beforeEach(() => {
      (useRouter as jest.Mock).mockReturnValue({
        route: '/contacts',
      });
    });
    it('renders modal', () => {
      const { getByText } = render(
        <ThemeProvider theme={theme}>
          <GqlMockedProvider<SaveFilterMutation>>
            <SaveFilterModal
              isOpen={true}
              handleClose={handleClose}
              currentFilters={currentFilters}
              currentSavedFilters={[savedGraphQLContactMock, savedFiltersMock]}
            />
          </GqlMockedProvider>
        </ThemeProvider>,
      );

      expect(getByText('Save Filter')).toBeVisible();
    });

    it('closes modal', () => {
      const { getByText, getByLabelText } = render(
        <ThemeProvider theme={theme}>
          <GqlMockedProvider<SaveFilterMutation>>
            <SaveFilterModal
              isOpen={true}
              handleClose={handleClose}
              currentFilters={currentFilters}
              currentSavedFilters={[savedGraphQLContactMock, savedFiltersMock]}
            />
          </GqlMockedProvider>
        </ThemeProvider>,
      );

      expect(getByText('Save Filter')).toBeVisible();
      userEvent.click(getByLabelText('Close'));
      expect(handleClose).toHaveBeenCalled();
    });

    it('saves filter', async () => {
      const mutationSpy = jest.fn();
      const { getByText, getByRole } = render(
        <ThemeProvider theme={theme}>
          <GqlMockedProvider<SaveFilterMutation> onCall={mutationSpy}>
            <SaveFilterModal
              isOpen={true}
              handleClose={handleClose}
              currentFilters={currentFilters}
              currentSavedFilters={[savedGraphQLContactMock, savedFiltersMock]}
            />
          </GqlMockedProvider>
        </ThemeProvider>,
      );

      expect(getByText('Save Filter')).toBeVisible();
      userEvent.type(
        getByRole('textbox', { hidden: true, name: 'Filter name' }),
        'My Cool Filter 2',
      );
      userEvent.click(getByText('Save'));
      await waitFor(() =>
        expect(mockEnqueue).toHaveBeenCalledWith('Filter saved successfully', {
          variant: 'success',
        }),
      );

      const { operation } = mutationSpy.mock.calls[0][0];
      expect(operation.variables.input.key).toEqual(
        'graphql_saved_contacts_filter_My_Cool_Filter_2',
      );
      expect(operation.variables.input.value).toEqual(
        JSON.stringify(currentFilters),
      );
      expect(handleClose).toHaveBeenCalled();
    });

    it('asks if you want save filter when filter with same name already exists', async () => {
      const mutationSpy = jest.fn();
      const { getByText, getByRole } = render(
        <ThemeProvider theme={theme}>
          <GqlMockedProvider<SaveFilterMutation> onCall={mutationSpy}>
            <SaveFilterModal
              isOpen={true}
              handleClose={handleClose}
              currentFilters={currentFilters}
              currentSavedFilters={[savedGraphQLContactMock, savedFiltersMock]}
            />
          </GqlMockedProvider>
        </ThemeProvider>,
      );

      expect(getByText('Save Filter')).toBeVisible();
      userEvent.type(
        getByRole('textbox', { hidden: true, name: 'Filter name' }),
        'My Cool Filter',
      );
      userEvent.click(getByText('Save'));
      await waitFor(() =>
        expect(
          getByText(
            'A filter with that name already exists. Do you wish to replace it?',
          ),
        ).toBeVisible(),
      );
      userEvent.click(getByText('Yes'));
      await waitFor(() =>
        expect(mockEnqueue).toHaveBeenCalledWith('Filter saved successfully', {
          variant: 'success',
        }),
      );

      const { operation } = mutationSpy.mock.calls[0][0];
      expect(operation.variables.input.key).toEqual(
        'graphql_saved_contacts_filter_My_Cool_Filter',
      );
      expect(operation.variables.input.value).toEqual(
        JSON.stringify(currentFilters),
      );
      expect(handleClose).toHaveBeenCalled();
    });
  });
  //#endregion

  //#region SaveFilterModal | Tasks
  describe('Tasks', () => {
    beforeEach(() => {
      (useRouter as jest.Mock).mockReturnValue({
        route: '/tasks',
      });
    });
    it('saves filter', async () => {
      const mutationSpy = jest.fn();
      const { getByText, getByRole } = render(
        <ThemeProvider theme={theme}>
          <GqlMockedProvider<SaveFilterMutation> onCall={mutationSpy}>
            <SaveFilterModal
              isOpen={true}
              handleClose={handleClose}
              currentFilters={currentFilters}
              currentSavedFilters={[savedGraphQLTaskMock, savedFiltersMock]}
            />
          </GqlMockedProvider>
        </ThemeProvider>,
      );

      expect(getByText('Save Filter')).toBeVisible();
      userEvent.type(
        getByRole('textbox', { hidden: true, name: 'Filter name' }),
        'My Cool Filter 2',
      );
      userEvent.click(getByText('Save'));
      await waitFor(() =>
        expect(mockEnqueue).toHaveBeenCalledWith('Filter saved successfully', {
          variant: 'success',
        }),
      );

      const { operation } = mutationSpy.mock.calls[0][0];
      expect(operation.variables.input.key).toEqual(
        'graphql_saved_tasks_filter_My_Cool_Filter_2',
      );
      expect(operation.variables.input.value).toEqual(
        JSON.stringify(currentFilters),
      );
      expect(handleClose).toHaveBeenCalled();
    });

    it('asks if you want save filter when filter with same name already exists', async () => {
      const mutationSpy = jest.fn();
      const { getByText, getByRole } = render(
        <ThemeProvider theme={theme}>
          <GqlMockedProvider<SaveFilterMutation> onCall={mutationSpy}>
            <SaveFilterModal
              isOpen={true}
              handleClose={handleClose}
              currentFilters={currentFilters}
              currentSavedFilters={[savedGraphQLTaskMock, savedFiltersMock]}
            />
          </GqlMockedProvider>
        </ThemeProvider>,
      );

      expect(getByText('Save Filter')).toBeVisible();
      userEvent.type(
        getByRole('textbox', { hidden: true, name: 'Filter name' }),
        'My Cool Filter',
      );
      userEvent.click(getByText('Save'));
      await waitFor(() =>
        expect(
          getByText(
            'A filter with that name already exists. Do you wish to replace it?',
          ),
        ).toBeVisible(),
      );
      userEvent.click(getByText('Yes'));
      await waitFor(() =>
        expect(mockEnqueue).toHaveBeenCalledWith('Filter saved successfully', {
          variant: 'success',
        }),
      );

      const { operation } = mutationSpy.mock.calls[0][0];
      expect(operation.variables.input.key).toEqual(
        'graphql_saved_tasks_filter_My_Cool_Filter',
      );
      expect(operation.variables.input.value).toEqual(
        JSON.stringify(currentFilters),
      );
      expect(handleClose).toHaveBeenCalled();
    });
  });
  //#endregion
});
