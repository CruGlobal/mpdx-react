import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { AppealFieldsFragment } from 'pages/accountLists/[accountListId]/tools/GetAppeals.generated';
import { AppealsWrapper } from 'pages/accountLists/[accountListId]/tools/appeals/AppealsWrapper';
import theme from 'src/theme';
import { appealInfo } from '../../appealMockData';
import { EditAppealHeaderInfoModal } from './EditAppealHeaderInfoModal';

const accountListId = 'abc';
const router = {
  query: { accountListId },
  isReady: true,
};
const handleClose = jest.fn();
const mutationSpy = jest.fn();

const Components = ({
  appeal = appealInfo,
}: {
  appeal?: AppealFieldsFragment;
}) => (
  <SnackbarProvider>
    <DndProvider backend={HTML5Backend}>
      <ThemeProvider theme={theme}>
        <TestRouter router={router}>
          <GqlMockedProvider onCall={mutationSpy}>
            <AppealsWrapper>
              <EditAppealHeaderInfoModal
                appealInfo={appeal}
                handleClose={handleClose}
              />
            </AppealsWrapper>
          </GqlMockedProvider>
        </TestRouter>
      </ThemeProvider>
    </DndProvider>
  </SnackbarProvider>
);

describe('EditAppealHeaderInfoModal', () => {
  it('should show errors', () => {
    const { getByRole, getByTestId } = render(
      <Components
        appeal={{
          ...appealInfo,
          name: '',
        }}
      />,
    );

    userEvent.clear(getByRole('spinbutton', { name: /goal/i }));
    userEvent.tab();

    expect(getByRole('textbox', { name: /name/i })).toHaveValue('');
    expect(getByRole('spinbutton', { name: /goal/i })).toHaveValue(null);

    expect(getByTestId('nameError')).toBeInTheDocument();
    expect(getByTestId('amountError')).toBeInTheDocument();
  });

  it('default', () => {
    const { getByRole } = render(<Components />);

    expect(getByRole('textbox', { name: /name/i })).toHaveValue('Test Appeal');
    expect(getByRole('spinbutton', { name: /goal/i })).toHaveValue(100);
  });

  it('should edit fields and save appeal', async () => {
    const { getByRole } = render(<Components />);

    const name = getByRole('textbox', { name: /name/i });
    const amount = getByRole('spinbutton', { name: /goal/i });

    userEvent.clear(name);
    userEvent.type(name, 'New Appeal Name');
    userEvent.clear(amount);
    userEvent.type(amount, '500');

    userEvent.click(getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(mutationSpy).toHaveGraphqlOperation('UpdateAppeal', {
        input: {
          accountListId,
          attributes: {
            id: '1',
            name: 'New Appeal Name',
            amount: 500,
          },
        },
      });
    });
  });

  it('should show amount error', async () => {
    const { getByRole, getByText, queryByText } = render(<Components />);

    const name = getByRole('textbox', { name: /name/i });
    const amount = getByRole('spinbutton', { name: /goal/i });

    userEvent.clear(name);
    userEvent.type(name, 'New Appeal Name');
    userEvent.clear(amount);

    userEvent.type(amount, '100');
    userEvent.clear(amount);

    await waitFor(() =>
      expect(getByText(/please enter a goal/i)).toBeInTheDocument(),
    );

    userEvent.clear(amount);
    userEvent.type(amount, '-100');

    await waitFor(() =>
      expect(
        getByText(/must use a positive number for appeal amount/i),
      ).toBeInTheDocument(),
    );
    userEvent.clear(amount);
    userEvent.type(amount, '400');
    await waitFor(() =>
      expect(
        queryByText(/must use a positive number for appeal amount/i),
      ).not.toBeInTheDocument(),
    );

    userEvent.click(getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(mutationSpy).toHaveGraphqlOperation('UpdateAppeal', {
        input: {
          accountListId,
          attributes: {
            id: '1',
            name: 'New Appeal Name',
            amount: 400,
          },
        },
      });
    });
  });
});
