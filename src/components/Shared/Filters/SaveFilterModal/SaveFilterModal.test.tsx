import { ThemeProvider } from '@material-ui/core';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import React from 'react';
import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import theme from '../../../../theme';
import { SaveFilterModal } from './SaveFilterModal';
import { SaveFilterMutation } from './SaveFilterModal.generated';

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

describe('SaveFilterModal', () => {
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
});
