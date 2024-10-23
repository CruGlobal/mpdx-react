import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from '../../../../../../theme';
import ExportEmail from './ExportEmail';
import {
  correctEmailsForExport,
  getEmailNewsletterContactsMocks,
} from './ExportEmailMocks';
import { GetEmailNewsletterContactsQuery } from './GetNewsletterContacts.generated';

const accountListId = '111';
const handleClose = jest.fn();

const Components = () => (
  <ThemeProvider theme={theme}>
    <GqlMockedProvider<{
      GetEmailNewsletterContacts: GetEmailNewsletterContactsQuery;
    }>
      mocks={{
        GetEmailNewsletterContacts: getEmailNewsletterContactsMocks,
      }}
    >
      <ExportEmail accountListId={accountListId} handleClose={handleClose} />
    </GqlMockedProvider>
  </ThemeProvider>
);
describe('LogNewsletter', () => {
  it('default', () => {
    const { queryByText } = render(<Components />);
    expect(queryByText('Digital Newsletter List')).toBeInTheDocument();
  });

  it('creates emailList string', async () => {
    const { queryByTestId } = render(<Components />);
    await waitFor(() => expect(queryByTestId('emailList')).not.toBeNull());
    expect(queryByTestId('emailList')).toHaveValue(correctEmailsForExport);
  });

  it('copies emailList to clipboard', async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn(),
      },
    });
    const { queryByTestId, getByText } = render(<Components />);
    await waitFor(() => expect(queryByTestId('emailList')).not.toBeNull());
    userEvent.click(getByText('Copy All'));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      correctEmailsForExport,
    );
  });
});
