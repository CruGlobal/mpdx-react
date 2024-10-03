import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { fireEvent, render, waitFor, within } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { I18nextProvider } from 'react-i18next';
import { VirtuosoMockContext } from 'react-virtuoso';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { ContactsQuery } from 'pages/accountLists/[accountListId]/contacts/Contacts.generated';
import { AppealsWrapper } from 'pages/accountLists/[accountListId]/tools/appeals/AppealsWrapper';
import { PledgeStatusEnum, StatusEnum } from 'src/graphql/types.generated';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import { AppealsContext, AppealsType } from '../AppealsContext/AppealsContext';
import { UpdateAccountListPledgeMutation } from '../Modals/PledgeModal/ContactPledge.generated';
import { appealInfo } from '../appealMockData';
import { ContactFlow, ContactFlowProps } from './ContactFlow';

const accountListId = 'accountListId';
const appealId = 'appealId';
const onContactSelected = jest.fn();
const defaultContact = {
  id: '123',
  name: 'Test Person',
  status: StatusEnum.NotInterested,
  primaryAddress: {
    id: 'address',
    updatedAt: new Date('2021-06-21T03:40:05-06:00').toISOString(),
  },
  pledges: [
    {
      id: 'pledgeId',
      amount: 1500,
      amountCurrency: 'USD',
      appeal: {
        id: appealId,
      },
      expectedDate: '2020-11-27',
      status: 'NOT_RECEIVED',
    },
  ],
};
const router = {
  query: { accountListId },
  isReady: true,
};

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

interface ComponentsProps {
  contact?: any;
  updatedPledgeStatus?: PledgeStatusEnum;
  contactFlowProps?: ContactFlowProps;
}

const defaultContactFlowProps = {
  accountListId,
  selectedFilters: {},
  onContactSelected,
  searchTerm: '',
  appealInfo: {
    appeal: appealInfo,
  },
  appealInfoLoading: false,
};

const mutationSpy = jest.fn();

const Components = ({
  contact = defaultContact,
  updatedPledgeStatus = PledgeStatusEnum.NotReceived,
  contactFlowProps = defaultContactFlowProps,
}: ComponentsProps) => (
  <I18nextProvider i18n={i18n}>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <SnackbarProvider>
        <DndProvider backend={HTML5Backend}>
          <ThemeProvider theme={theme}>
            <TestRouter router={router}>
              <GqlMockedProvider<{
                Contacts: ContactsQuery;
                UpdateAccountListPledge: UpdateAccountListPledgeMutation;
              }>
                mocks={{
                  Contacts: {
                    contacts: {
                      nodes: [contact],
                      pageInfo: { endCursor: 'Mg', hasNextPage: false },
                      totalCount: 1,
                    },
                  },
                  UpdateAccountListPledge: {
                    updateAccountListPledge: {
                      pledge: {
                        id: 'pledgeId',
                        status: updatedPledgeStatus,
                      },
                    },
                  },
                }}
                onCall={mutationSpy}
              >
                <AppealsWrapper>
                  <AppealsContext.Provider
                    value={
                      {
                        accountListId,
                        appealId: appealId,
                        sanitizedFilters: {},
                        isRowChecked: jest.fn(),
                        toggleSelectionById: jest.fn(),
                      } as unknown as AppealsType
                    }
                  >
                    <VirtuosoMockContext.Provider
                      value={{ viewportHeight: 300, itemHeight: 100 }}
                    >
                      <ContactFlow {...contactFlowProps} />
                    </VirtuosoMockContext.Provider>
                  </AppealsContext.Provider>
                </AppealsWrapper>
              </GqlMockedProvider>
            </TestRouter>
          </ThemeProvider>
        </DndProvider>
      </SnackbarProvider>
    </LocalizationProvider>
  </I18nextProvider>
);

describe('ContactFlow', () => {
  it('default', async () => {
    const { getByRole, findByRole } = render(<Components />);

    expect(
      await findByRole('heading', { name: 'Excluded' }),
    ).toBeInTheDocument();
    expect(getByRole('heading', { name: 'Asked' })).toBeInTheDocument();
    expect(getByRole('heading', { name: 'Committed' })).toBeInTheDocument();
    expect(getByRole('heading', { name: 'Received' })).toBeInTheDocument();
    expect(getByRole('heading', { name: 'Given' })).toBeInTheDocument();
  });

  describe('Excluded Drag and Drop functionality', () => {
    it('Excluded to Asked', async () => {
      const { getAllByText, getByTestId, findByRole } = render(<Components />);

      await waitFor(() =>
        expect(getAllByText(defaultContact.name)[0]).toBeInTheDocument(),
      );

      const contactBox = getAllByText(defaultContact.name)[0];
      const column = within(getByTestId('contactsFlowAsked')).getByTestId(
        'contact-flow-drop-zone',
      );

      fireEvent.dragStart(contactBox);
      fireEvent.dragEnter(column);
      fireEvent.dragOver(column);
      fireEvent.drop(column);

      expect(
        await findByRole('heading', { name: 'Add Contact' }),
      ).toBeInTheDocument();

      expect(getByTestId('AddExcludedContactModal')).toHaveTextContent(
        'You will not be able to exclude this contact once you add them to this appeal.',
      );
    });

    it('should not allow the contact to be dragged to the column it came from', async () => {
      const { getAllByText, getByTestId } = render(<Components />);

      await waitFor(() =>
        expect(getAllByText(defaultContact.name)[0]).toBeInTheDocument(),
      );

      const contactBox = getAllByText(defaultContact.name)[0];
      const columnAsked = within(getByTestId('contactsFlowAsked')).getByTestId(
        'contact-flow-drop-zone',
      );
      const columnExcluded = within(
        getByTestId('contactsFlowExcluded'),
      ).getByTestId('contact-flow-drop-zone');

      fireEvent.dragStart(contactBox);
      fireEvent.dragEnter(columnAsked);
      fireEvent.dragOver(columnAsked);
      fireEvent.dragEnter(columnExcluded);
      fireEvent.dragOver(columnExcluded);
      fireEvent.drop(columnExcluded);

      await waitFor(() =>
        expect(mockEnqueue).not.toHaveBeenCalledWith(
          'Unable to move Excluded Contact here. If you want to add this Excluded contact to this appeal, please add them to Asked.',
          {
            variant: 'warning',
          },
        ),
      );
    });

    it('Excluded to Committed', async () => {
      const { getAllByText, getByTestId, queryByRole } = render(<Components />);

      await waitFor(() =>
        expect(getAllByText(defaultContact.name)[0]).toBeInTheDocument(),
      );

      const contactBox = getAllByText(defaultContact.name)[0];
      const column = within(getByTestId('contactsFlowCommitted')).getByTestId(
        'contact-flow-drop-zone',
      );

      fireEvent.dragStart(contactBox);
      fireEvent.dragEnter(column);
      fireEvent.dragOver(column);
      fireEvent.drop(column);

      await waitFor(() =>
        expect(mockEnqueue).toHaveBeenCalledWith(
          'Unable to move Excluded Contact here. If you want to add this Excluded contact to this appeal, please add them to Asked.',
          {
            variant: 'warning',
          },
        ),
      );

      expect(
        queryByRole('heading', { name: 'Add Contact' }),
      ).not.toBeInTheDocument();
    });

    it('Excluded to Given', async () => {
      const { getAllByText, getByTestId, queryByRole } = render(<Components />);

      await waitFor(() =>
        expect(getAllByText(defaultContact.name)[0]).toBeInTheDocument(),
      );

      const contactBox = getAllByText(defaultContact.name)[0];
      const column = within(getByTestId('contactsFlowGiven')).getByTestId(
        'contact-flow-drop-zone',
      );

      fireEvent.dragStart(contactBox);
      fireEvent.dragEnter(column);
      fireEvent.dragOver(column);
      fireEvent.drop(column);

      await waitFor(() =>
        expect(mockEnqueue).toHaveBeenCalledWith(
          'Unable to move Excluded Contact here. If you want to add this Excluded contact to this appeal, please add them to Asked.',
          {
            variant: 'warning',
          },
        ),
      );

      expect(
        queryByRole('heading', { name: 'Add Contact' }),
      ).not.toBeInTheDocument();
    });
  });

  describe('Asked Drag and Drop functionality', () => {
    it('Asked to Excluded', async () => {
      const { getAllByText, getByTestId, findByRole } = render(<Components />);

      await waitFor(() =>
        expect(getAllByText(defaultContact.name)[1]).toBeInTheDocument(),
      );

      const contactBox = getAllByText(defaultContact.name)[1];
      const column = within(getByTestId('contactsFlowExcluded')).getByTestId(
        'contact-flow-drop-zone',
      );

      fireEvent.dragStart(contactBox);
      fireEvent.dragEnter(column);
      fireEvent.dragOver(column);
      fireEvent.drop(column);

      expect(
        await findByRole('heading', { name: 'Remove Contact' }),
      ).toBeInTheDocument();
    });

    it('Asked to Committed', async () => {
      const { getAllByText, getByTestId, findByRole } = render(<Components />);

      await waitFor(() =>
        expect(getAllByText(defaultContact.name)[1]).toBeInTheDocument(),
      );

      const contactBox = getAllByText(defaultContact.name)[1];
      const column = within(getByTestId('contactsFlowCommitted')).getByTestId(
        'contact-flow-drop-zone',
      );

      fireEvent.dragStart(contactBox);
      fireEvent.dragEnter(column);
      fireEvent.dragOver(column);
      fireEvent.drop(column);

      expect(
        await findByRole('heading', { name: 'Add Commitment' }),
      ).toBeInTheDocument();
    });

    it('Asked to Received', async () => {
      const { getAllByText, getByTestId, findByRole } = render(<Components />);

      await waitFor(() =>
        expect(getAllByText(defaultContact.name)[1]).toBeInTheDocument(),
      );

      const contactBox = getAllByText(defaultContact.name)[1];
      const column = within(getByTestId('contactsFlowReceived')).getByTestId(
        'contact-flow-drop-zone',
      );

      fireEvent.dragStart(contactBox);
      fireEvent.dragEnter(column);
      fireEvent.dragOver(column);
      fireEvent.drop(column);

      expect(
        await findByRole('heading', { name: 'Add Commitment' }),
      ).toBeInTheDocument();
    });

    it('Asked to Given', async () => {
      const { getAllByText, getByTestId, findByRole } = render(<Components />);

      await waitFor(() =>
        expect(getAllByText(defaultContact.name)[1]).toBeInTheDocument(),
      );

      const contactBox = getAllByText(defaultContact.name)[1];
      const column = within(getByTestId('contactsFlowGiven')).getByTestId(
        'contact-flow-drop-zone',
      );

      fireEvent.dragStart(contactBox);
      fireEvent.dragEnter(column);
      fireEvent.dragOver(column);
      fireEvent.drop(column);

      expect(
        await findByRole('heading', { name: 'Update Donations' }),
      ).toBeInTheDocument();
    });
  });

  describe('Committed Drag and Drop functionality', () => {
    it('Committed to Excluded', async () => {
      const { getAllByText, getByTestId, findByRole } = render(<Components />);

      await waitFor(() =>
        expect(getAllByText(defaultContact.name)[2]).toBeInTheDocument(),
      );

      const contactBox = getAllByText(defaultContact.name)[2];
      const column = within(getByTestId('contactsFlowExcluded')).getByTestId(
        'contact-flow-drop-zone',
      );

      fireEvent.dragStart(contactBox);
      fireEvent.dragEnter(column);
      fireEvent.dragOver(column);
      fireEvent.drop(column);

      expect(
        await findByRole('heading', { name: 'Remove Contact' }),
      ).toBeInTheDocument();
    });

    it('Committed to Asked', async () => {
      const { getAllByText, getByTestId, findByRole } = render(<Components />);

      await waitFor(() =>
        expect(getAllByText(defaultContact.name)[2]).toBeInTheDocument(),
      );

      const contactBox = getAllByText(defaultContact.name)[2];
      const column = within(getByTestId('contactsFlowAsked')).getByTestId(
        'contact-flow-drop-zone',
      );

      fireEvent.dragStart(contactBox);
      fireEvent.dragEnter(column);
      fireEvent.dragOver(column);
      fireEvent.drop(column);

      expect(
        await findByRole('heading', { name: 'Remove Commitment' }),
      ).toBeInTheDocument();
    });

    it('Committed to Received when pledge status on the server equals NotReceived', async () => {
      const { getAllByText, getByTestId } = render(
        <Components updatedPledgeStatus={PledgeStatusEnum.NotReceived} />,
      );

      await waitFor(() =>
        expect(getAllByText(defaultContact.name)[2]).toBeInTheDocument(),
      );

      const contactBox = getAllByText(defaultContact.name)[2];
      const column = within(getByTestId('contactsFlowReceived')).getByTestId(
        'contact-flow-drop-zone',
      );

      fireEvent.dragStart(contactBox);
      fireEvent.dragEnter(column);
      fireEvent.dragOver(column);
      fireEvent.drop(column);

      await waitFor(() =>
        expect(mockEnqueue).toHaveBeenCalledWith(
          'Unable to move contact to the "Received" column as gift has not been received by Cru. Status set to "Committed".',
          {
            variant: 'warning',
          },
        ),
      );
    });

    it('Committed to Received when pledge status on the server equals Processed', async () => {
      const { getAllByText, getByTestId } = render(
        <Components updatedPledgeStatus={PledgeStatusEnum.Processed} />,
      );

      await waitFor(() =>
        expect(getAllByText(defaultContact.name)[2]).toBeInTheDocument(),
      );

      const contactBox = getAllByText(defaultContact.name)[2];
      const column = within(getByTestId('contactsFlowReceived')).getByTestId(
        'contact-flow-drop-zone',
      );

      fireEvent.dragStart(contactBox);
      fireEvent.dragEnter(column);
      fireEvent.dragOver(column);
      fireEvent.drop(column);

      await waitFor(() =>
        expect(mockEnqueue).toHaveBeenCalledWith(
          'Unable to move contact here as this gift is already processed.',
          {
            variant: 'warning',
          },
        ),
      );
    });

    it('Committed to Given', async () => {
      const { getAllByText, getByTestId, findByRole } = render(<Components />);

      await waitFor(() =>
        expect(getAllByText(defaultContact.name)[2]).toBeInTheDocument(),
      );

      const contactBox = getAllByText(defaultContact.name)[2];
      const column = within(getByTestId('contactsFlowGiven')).getByTestId(
        'contact-flow-drop-zone',
      );

      fireEvent.dragStart(contactBox);
      fireEvent.dragEnter(column);
      fireEvent.dragOver(column);
      fireEvent.drop(column);

      expect(
        await findByRole('heading', { name: 'Update Donations' }),
      ).toBeInTheDocument();
    });
  });

  describe('Received Drag and Drop functionality', () => {
    it('Received to Excluded', async () => {
      const { getAllByText, getByTestId, findByRole } = render(<Components />);

      await waitFor(() =>
        expect(getAllByText(defaultContact.name)[3]).toBeInTheDocument(),
      );

      const contactBox = getAllByText(defaultContact.name)[3];
      const column = within(getByTestId('contactsFlowExcluded')).getByTestId(
        'contact-flow-drop-zone',
      );

      fireEvent.dragStart(contactBox);
      fireEvent.dragEnter(column);
      fireEvent.dragOver(column);
      fireEvent.drop(column);

      expect(
        await findByRole('heading', { name: 'Remove Contact' }),
      ).toBeInTheDocument();
    });

    it('Received to Asked', async () => {
      const { getAllByText, getByTestId, findByRole } = render(<Components />);

      await waitFor(() =>
        expect(getAllByText(defaultContact.name)[3]).toBeInTheDocument(),
      );

      const contactBox = getAllByText(defaultContact.name)[3];
      const column = within(getByTestId('contactsFlowAsked')).getByTestId(
        'contact-flow-drop-zone',
      );

      fireEvent.dragStart(contactBox);
      fireEvent.dragEnter(column);
      fireEvent.dragOver(column);
      fireEvent.drop(column);

      expect(
        await findByRole('heading', { name: 'Remove Commitment' }),
      ).toBeInTheDocument();
    });

    it('Received to Committed when pledge status on the server equals NotReceived', async () => {
      const { getAllByText, getByTestId } = render(
        <Components
          updatedPledgeStatus={PledgeStatusEnum.ReceivedNotProcessed}
        />,
      );

      await waitFor(() =>
        expect(getAllByText(defaultContact.name)[3]).toBeInTheDocument(),
      );

      const contactBox = getAllByText(defaultContact.name)[3];
      const column = within(getByTestId('contactsFlowCommitted')).getByTestId(
        'contact-flow-drop-zone',
      );

      fireEvent.dragStart(contactBox);
      fireEvent.dragEnter(column);
      fireEvent.dragOver(column);
      fireEvent.drop(column);

      await waitFor(() =>
        expect(mockEnqueue).toHaveBeenCalledWith(
          'Unable to move contact to the "Committed" column as part of the pledge has been Received.',
          {
            variant: 'warning',
          },
        ),
      );
    });

    it('Received to Committed when pledge status on the server equals Processed', async () => {
      const { getAllByText, getByTestId } = render(
        <Components updatedPledgeStatus={PledgeStatusEnum.Processed} />,
      );

      await waitFor(() =>
        expect(getAllByText(defaultContact.name)[3]).toBeInTheDocument(),
      );

      const contactBox = getAllByText(defaultContact.name)[3];
      const column = within(getByTestId('contactsFlowCommitted')).getByTestId(
        'contact-flow-drop-zone',
      );

      fireEvent.dragStart(contactBox);
      fireEvent.dragEnter(column);
      fireEvent.dragOver(column);
      fireEvent.drop(column);

      await waitFor(() =>
        expect(mockEnqueue).toHaveBeenCalledWith(
          'Unable to move contact here as this gift is already processed.',
          {
            variant: 'warning',
          },
        ),
      );
    });

    it('Received to Given', async () => {
      const { getAllByText, getByTestId, findByRole } = render(<Components />);

      await waitFor(() =>
        expect(getAllByText(defaultContact.name)[3]).toBeInTheDocument(),
      );

      const contactBox = getAllByText(defaultContact.name)[3];
      const column = within(getByTestId('contactsFlowGiven')).getByTestId(
        'contact-flow-drop-zone',
      );

      fireEvent.dragStart(contactBox);
      fireEvent.dragEnter(column);
      fireEvent.dragOver(column);
      fireEvent.drop(column);

      expect(
        await findByRole('heading', { name: 'Update Donations' }),
      ).toBeInTheDocument();
    });
  });

  describe('Given Drag and Drop functionality', () => {
    it('Given to Excluded', async () => {
      const { getAllByText, getByTestId, findByRole } = render(<Components />);

      await waitFor(() =>
        expect(getAllByText(defaultContact.name)[4]).toBeInTheDocument(),
      );

      const contactBox = getAllByText(defaultContact.name)[4];
      const column = within(getByTestId('contactsFlowExcluded')).getByTestId(
        'contact-flow-drop-zone',
      );

      fireEvent.dragStart(contactBox);
      fireEvent.dragEnter(column);
      fireEvent.dragOver(column);
      fireEvent.drop(column);

      expect(
        await findByRole('heading', { name: 'Remove Contact' }),
      ).toBeInTheDocument();
    });

    it('Given to Asked', async () => {
      const { getAllByText, getByTestId, findByRole } = render(<Components />);

      await waitFor(() =>
        expect(getAllByText(defaultContact.name)[4]).toBeInTheDocument(),
      );

      const contactBox = getAllByText(defaultContact.name)[4];
      const column = within(getByTestId('contactsFlowAsked')).getByTestId(
        'contact-flow-drop-zone',
      );

      fireEvent.dragStart(contactBox);
      fireEvent.dragEnter(column);
      fireEvent.dragOver(column);
      fireEvent.drop(column);

      expect(
        await findByRole('heading', { name: 'Remove Commitment' }),
      ).toBeInTheDocument();
    });

    it('Given to Committed', async () => {
      const { getAllByText, getByTestId } = render(
        <Components updatedPledgeStatus={PledgeStatusEnum.Processed} />,
      );

      await waitFor(() =>
        expect(getAllByText(defaultContact.name)[4]).toBeInTheDocument(),
      );

      const contactBox = getAllByText(defaultContact.name)[4];
      const column = within(getByTestId('contactsFlowCommitted')).getByTestId(
        'contact-flow-drop-zone',
      );

      fireEvent.dragStart(contactBox);
      fireEvent.dragEnter(column);
      fireEvent.dragOver(column);
      fireEvent.drop(column);

      await waitFor(() =>
        expect(mockEnqueue).toHaveBeenCalledWith(
          'Unable to move contact here as this gift is already processed.',
          {
            variant: 'warning',
          },
        ),
      );
    });

    it('Given to Received', async () => {
      const { getAllByText, getByTestId } = render(
        <Components updatedPledgeStatus={PledgeStatusEnum.Processed} />,
      );

      await waitFor(() =>
        expect(getAllByText(defaultContact.name)[4]).toBeInTheDocument(),
      );

      const contactBox = getAllByText(defaultContact.name)[4];
      const column = within(getByTestId('contactsFlowReceived')).getByTestId(
        'contact-flow-drop-zone',
      );

      fireEvent.dragStart(contactBox);
      fireEvent.dragEnter(column);
      fireEvent.dragOver(column);
      fireEvent.drop(column);

      await waitFor(() =>
        expect(mockEnqueue).toHaveBeenCalledWith(
          'Unable to move contact here as this gift is already processed.',
          {
            variant: 'warning',
          },
        ),
      );
    });
  });
});
