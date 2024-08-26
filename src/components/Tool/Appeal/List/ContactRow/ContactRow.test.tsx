import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
import { ContactRow } from './ContactRow';
import { defaultContact } from './ContactRowMock';

const accountListId = 'account-list-1';
const appealId = 'appealId';

const router = {
  query: { accountListId },
  isReady: true,
};

const setContactFocus = jest.fn();
const contactDetailsOpen = true;
const toggleSelectionById = jest.fn();
const isRowChecked = jest.fn();

type ComponentsProps = {
  appealStatus?: AppealStatusEnum;
  contact?: AppealContactInfoFragment;
};
const Components = ({
  appealStatus = AppealStatusEnum.Asked,
  contact = defaultContact,
}: ComponentsProps) => (
  <TestRouter router={router}>
    <GqlMockedProvider>
      <ThemeProvider theme={theme}>
        <AppealsWrapper>
          <AppealsContext.Provider
            value={
              {
                appealId,
                setContactFocus,
                isRowChecked,
                contactDetailsOpen,
                toggleSelectionById,
              } as unknown as AppealsType
            }
          >
            <ContactRow contact={contact} appealStatus={appealStatus} />
          </AppealsContext.Provider>
        </AppealsWrapper>
      </ThemeProvider>
    </GqlMockedProvider>
  </TestRouter>
);

describe('ContactsRow', () => {
  it('default', () => {
    const { getByText } = render(<Components />);

    expect(getByText('Test, Name')).toBeInTheDocument();
    expect(getByText('CA$500 Monthly')).toBeInTheDocument();
  });

  it('should render check event', async () => {
    const { getByRole } = render(<Components />);

    const checkbox = getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
    userEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it('should open contact on click', () => {
    isRowChecked.mockImplementationOnce((id) => id === defaultContact.id);

    const { getByTestId } = render(<Components />);

    expect(setContactFocus).not.toHaveBeenCalled();

    const rowButton = getByTestId('rowButton');
    userEvent.click(rowButton);

    expect(setContactFocus).toHaveBeenCalledWith(defaultContact.id);
  });

  it('should render contact select event', () => {
    isRowChecked.mockImplementationOnce((id) => id === defaultContact.id);

    const { getByTestId } = render(<Components />);

    expect(setContactFocus).not.toHaveBeenCalled();

    const rowButton = getByTestId('rowButton');
    userEvent.click(rowButton);

    expect(setContactFocus).toHaveBeenCalledWith(defaultContact.id);
  });

  describe('Contact Row by status type', () => {
    it('Excluded', () => {
      isRowChecked.mockImplementationOnce(() => true);

      const { getByText } = render(
        <Components appealStatus={AppealStatusEnum.Excluded} />,
      );

      expect(getByText('Reason')).toBeInTheDocument();
      expect(getByText('CA$500 Monthly')).toBeInTheDocument();
    });

    it('Asked', () => {
      isRowChecked.mockImplementationOnce(() => true);

      const { getByText, queryByText } = render(
        <Components appealStatus={AppealStatusEnum.Asked} />,
      );

      expect(queryByText('Reason')).not.toBeInTheDocument();
      expect(getByText('CA$500 Monthly')).toBeInTheDocument();
    });

    it('Committed', () => {
      isRowChecked.mockImplementationOnce(() => true);

      const { getByText, queryByText } = render(
        <Components appealStatus={AppealStatusEnum.NotReceived} />,
      );

      expect(queryByText('Reason')).not.toBeInTheDocument();
      expect(getByText('$3,000 (Aug 8, 2024)')).toBeInTheDocument();
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
      expect(getByText('$3,000 (Aug 8, 2024)')).toBeInTheDocument();
    });

    it('Given', () => {
      isRowChecked.mockImplementationOnce(() => true);

      const { getByText, queryByText } = render(
        <Components appealStatus={AppealStatusEnum.Processed} />,
      );

      expect(queryByText('Reason')).not.toBeInTheDocument();
      expect(getByText('$3,000 ($50) (Jun 25, 2019)')).toBeInTheDocument();
    });
  });
});
