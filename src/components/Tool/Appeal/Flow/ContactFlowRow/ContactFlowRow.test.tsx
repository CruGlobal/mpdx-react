import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { I18nextProvider } from 'react-i18next';
import TestWrapper from '__tests__/util/TestWrapper';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import {
  AppealStatusEnum,
  AppealsContext,
  AppealsType,
} from '../../AppealsContext/AppealsContext';
import { AppealContactInfoFragment } from '../../AppealsContext/contacts.generated';
import { defaultContact } from '../../List/ContactRow/ContactRowMock';
import { ExcludedAppealContactInfoFragment } from '../../Shared/AppealExcludedContacts.generated';
import { defaultExcludedContacts } from '../../Shared/useGetExcludedReasons/useGetExcludedReasonsMock';
import { ContactFlowRow } from './ContactFlowRow';

const accountListId = 'account-list-1';
const appealId = 'appealId';
const onContactSelected = jest.fn();
const toggleSelectionById = jest.fn();
const isChecked = jest.fn().mockImplementation(() => false);

type ComponentsProps = {
  appealStatus?: AppealStatusEnum;
  contact?: AppealContactInfoFragment;
  excludedContacts?: ExcludedAppealContactInfoFragment[];
};
const Components = ({
  appealStatus = AppealStatusEnum.Processed,
  contact = defaultContact,
  excludedContacts = [],
}: ComponentsProps) => (
  <I18nextProvider i18n={i18n}>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <DndProvider backend={HTML5Backend}>
        <ThemeProvider theme={theme}>
          <TestWrapper>
            <AppealsContext.Provider
              value={
                {
                  appealId,
                  isRowChecked: isChecked,
                  toggleSelectionById,
                } as unknown as AppealsType
              }
            >
              <ContactFlowRow
                accountListId={accountListId}
                contact={contact}
                appealStatus={appealStatus}
                onContactSelected={onContactSelected}
                excludedContacts={excludedContacts}
              />
            </AppealsContext.Provider>
          </TestWrapper>
        </ThemeProvider>
      </DndProvider>
    </LocalizationProvider>
  </I18nextProvider>
);

describe('ContactFlowRow', () => {
  it('should display contact name and status', () => {
    const { getByText, getByTitle } = render(<Components />);
    expect(getByText(defaultContact.name)).toBeInTheDocument();
    expect(getByTitle('Star')).toBeInTheDocument();
  });

  it('should display contact as starred', () => {
    const { getByText, getByTitle } = render(
      <Components
        contact={{
          ...defaultContact,
          starred: true,
        }}
      />,
    );
    expect(getByText(defaultContact.name)).toBeInTheDocument();
    expect(getByTitle('Unstar')).toBeInTheDocument();
  });

  it('should call contact selected function', () => {
    const { getByText } = render(<Components />);
    userEvent.click(getByText(defaultContact.name));
    expect(getByText(defaultContact.name)).toBeInTheDocument();
    expect(onContactSelected).toHaveBeenCalledWith(
      defaultContact.id,
      true,
      true,
    );
  });

  it('should call check contact', async () => {
    const { getByRole } = render(<Components />);

    userEvent.click(getByRole('checkbox'));
    await waitFor(() => {
      expect(toggleSelectionById).toHaveBeenLastCalledWith(defaultContact.id);
    });
  });

  describe('Contact Row by status type', () => {
    it('Excluded', () => {
      const { getByText } = render(
        <Components appealStatus={AppealStatusEnum.Excluded} />,
      );
      expect(getByText('CA$500')).toBeInTheDocument();
      expect(getByText('Monthly')).toBeInTheDocument();
    });

    it('Asked', () => {
      const { getByText } = render(
        <Components appealStatus={AppealStatusEnum.Asked} />,
      );
      expect(getByText('CA$500')).toBeInTheDocument();
      expect(getByText('Monthly')).toBeInTheDocument();
    });

    it('Committed', () => {
      const { getByText } = render(
        <Components appealStatus={AppealStatusEnum.NotReceived} />,
      );
      expect(getByText('$3,000')).toBeInTheDocument();
      expect(getByText('(Aug 8, 2024)')).toBeInTheDocument();
    });

    it('Committed - with no pledges', () => {
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
      const { getByText } = render(
        <Components appealStatus={AppealStatusEnum.ReceivedNotProcessed} />,
      );
      expect(getByText('$3,000')).toBeInTheDocument();
      expect(getByText('(Aug 8, 2024)')).toBeInTheDocument();
    });

    it('Given', () => {
      const { getByText } = render(
        <Components appealStatus={AppealStatusEnum.Processed} />,
      );
      expect(getByText('$3,000 ($50) (Jun 25, 2019)')).toBeInTheDocument();
    });
  });

  describe('Edit/Add Pledge', () => {
    it('Open up Edit pledge modal', async () => {
      const { getByTestId, findByText } = render(
        <Components appealStatus={AppealStatusEnum.NotReceived} />,
      );

      userEvent.click(getByTestId('editPledgeButton'));

      expect(await findByText('Edit Commitment')).toBeInTheDocument();
    });

    it('Open up delete pledge modal', async () => {
      const { getByTestId, findByText } = render(
        <Components appealStatus={AppealStatusEnum.NotReceived} />,
      );

      userEvent.click(getByTestId('deletePledgeButton'));

      expect(await findByText('Remove Commitment')).toBeInTheDocument();
    });
  });

  describe('Excluded Reason', () => {
    it('should not display excluded reason if not excluded contact', async () => {
      const { queryByText } = render(
        <Components excludedContacts={defaultExcludedContacts} />,
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
