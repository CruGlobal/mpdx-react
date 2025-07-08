import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { AppealsWrapper } from 'pages/accountLists/[accountListId]/tools/appeals/AppealsWrapper';
import theme from 'src/theme';
import {
  AppealStatusEnum,
  AppealsContext,
  AppealsType,
} from '../../AppealsContext/AppealsContext';
import { AppealContactInfoFragment } from '../../AppealsContext/contacts.generated';
import { ExcludedAppealContactInfoFragment } from '../../Shared/AppealExcludedContacts.generated';
import { defaultExcludedContacts } from '../../Shared/useGetExcludedReasons/useGetExcludedReasonsMock';
import { ContactRow } from './ContactRow';
import { defaultContact } from './ContactRowMock';

const accountListId = 'account-list-1';
const appealId = 'appealId';

const router = {
  pathname:
    '/accountLists/[accountListId]/tools/appeals/appeal/[[...appealId]]',
  query: {
    accountListId,
    appealId: [appealId, 'list'],
  },
  isReady: true,
};
const contactUrl = `/accountLists/${accountListId}/tools/appeals/appeal/${appealId}/list/${defaultContact.id}`;

const contactDetailsOpen = true;
const toggleSelectionById = jest.fn();
const isRowChecked = jest.fn();

type ComponentsProps = {
  appealStatus?: AppealStatusEnum;
  contact?: AppealContactInfoFragment;
  excludedContacts?: ExcludedAppealContactInfoFragment[];
};
const Components = ({
  appealStatus = AppealStatusEnum.Asked,
  contact = defaultContact,
  excludedContacts = [],
}: ComponentsProps) => (
  <TestRouter router={router}>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <SnackbarProvider>
        <GqlMockedProvider>
          <ThemeProvider theme={theme}>
            <AppealsWrapper>
              <AppealsContext.Provider
                value={
                  {
                    appealId,
                    isRowChecked,
                    contactDetailsOpen,
                    toggleSelectionById,
                  } as unknown as AppealsType
                }
              >
                <ContactRow
                  contact={contact}
                  appealStatus={appealStatus}
                  excludedContacts={excludedContacts}
                />
              </AppealsContext.Provider>
            </AppealsWrapper>
          </ThemeProvider>
        </GqlMockedProvider>
      </SnackbarProvider>
    </LocalizationProvider>
  </TestRouter>
);

describe('ContactsRow', () => {
  it('default', () => {
    const { getByText } = render(<Components />);

    expect(getByText('Test, Name')).toBeInTheDocument();
    expect(getByText('CA$500')).toBeInTheDocument();
    expect(getByText('Monthly')).toBeInTheDocument();
  });

  it('should render check event', async () => {
    const { getByRole } = render(<Components />);

    const checkbox = getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
    userEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it('should render contact as a link', () => {
    const { getByTestId } = render(<Components />);

    const contact = getByTestId('rowButton');
    expect(contact).toBeInTheDocument();
    expect(contact).toHaveAttribute('href', contactUrl);
  });

  it('should open commitment modal', async () => {
    const { getByTestId, findByRole } = render(<Components />);

    const addCommitment = getByTestId('AddIcon');
    userEvent.click(addCommitment);
    expect(
      await findByRole('heading', { name: 'Add Commitment' }),
    ).toBeInTheDocument();
  });

  describe('Contact Row by status type', () => {
    it('Excluded', async () => {
      isRowChecked.mockImplementationOnce(() => true);

      const { getByText } = render(
        <Components appealStatus={AppealStatusEnum.Excluded} />,
      );

      expect(getByText('CA$500')).toBeInTheDocument();
      expect(getByText('Monthly')).toBeInTheDocument();
    });

    it('Asked', () => {
      isRowChecked.mockImplementationOnce(() => true);

      const { getByText } = render(
        <Components appealStatus={AppealStatusEnum.Asked} />,
      );

      expect(getByText('CA$500')).toBeInTheDocument();
      expect(getByText('Monthly')).toBeInTheDocument();
    });

    it('Committed', () => {
      isRowChecked.mockImplementationOnce(() => true);

      const { getByText } = render(
        <Components appealStatus={AppealStatusEnum.NotReceived} />,
      );

      expect(getByText('$3,000')).toBeInTheDocument();
      expect(getByText('(Aug 8, 2024)')).toBeInTheDocument();
    });

    it('Committed - with no pledges', () => {
      isRowChecked.mockImplementationOnce(() => true);

      const { getByText } = render(
        <Components
          appealStatus={AppealStatusEnum.NotReceived}
          contact={{
            ...defaultContact,
            pledges: [],
          }}
        />,
      );
      expect(getByText('$0')).toBeInTheDocument();
    });

    it('Received', () => {
      isRowChecked.mockImplementationOnce(() => true);

      const { getByText, queryByText } = render(
        <Components appealStatus={AppealStatusEnum.ReceivedNotProcessed} />,
      );

      expect(queryByText('Reason')).not.toBeInTheDocument();
      expect(getByText('$3,000')).toBeInTheDocument();
      expect(getByText('(Aug 8, 2024)')).toBeInTheDocument();
    });

    it('Given', () => {
      isRowChecked.mockImplementationOnce(() => true);

      const { getByText } = render(
        <Components appealStatus={AppealStatusEnum.Processed} />,
      );

      expect(getByText('$3,000 ($50) (Jun 25, 2019)')).toBeInTheDocument();
    });
  });

  describe('Excluded Reason', () => {
    it('should not display excluded reason if not excluded contact', async () => {
      const { queryByText } = render(
        <Components appealStatus={AppealStatusEnum.NotReceived} />,
      );

      expect(queryByText('Send Appeals?" set to No')).not.toBeInTheDocument();
    });

    it('should display excluded reason', async () => {
      const { findByText } = render(
        <Components
          excludedContacts={defaultExcludedContacts}
          appealStatus={AppealStatusEnum.Excluded}
        />,
      );

      expect(await findByText('Send Appeals?" set to No')).toBeInTheDocument();
    });
  });
});
