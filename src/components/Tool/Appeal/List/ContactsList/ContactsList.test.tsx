import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { AppealsWrapper } from 'pages/accountLists/[accountListId]/tools/appeals/AppealsWrapper';
import theme from 'src/theme';
import { AppealQuery } from '../../AppealDetails/AppealsMainPanel/AppealInfo.generated';
import {
  AppealStatusEnum,
  AppealsContext,
  AppealsType,
} from '../../AppealsContext/AppealsContext';
import { appealInfo } from '../../appealMockData';
import { ContactsList } from './ContactsList';

const accountListId = 'account-list-1';

const getContactUrl = jest.fn().mockReturnValue({
  contactUrl: `/contacts/123`,
});
const contactDetailsOpen = true;
const toggleSelectionById = jest.fn();
const isRowChecked = jest.fn();

const defaultAppealQuery: AppealQuery = {
  appeal: {
    ...appealInfo,
  },
};
const defaultContactsQueryResult = {
  data: { contacts: { nodes: [] } },
  loading: false,
};
type ComponentsProps = {
  appealInfoLoading?: boolean;
  appealStatus?: AppealStatusEnum;
  contactsQueryResult?: object;
};
const Components = ({
  appealInfoLoading = false,
  appealStatus = AppealStatusEnum.Asked,
  contactsQueryResult = defaultContactsQueryResult,
}: ComponentsProps) => {
  const activeFilters = { appealStatus };
  const router = {
    query: { accountListId, filters: JSON.stringify(activeFilters) },
    isReady: true,
  };
  return (
    <TestRouter router={router}>
      <GqlMockedProvider>
        <ThemeProvider theme={theme}>
          <AppealsWrapper>
            <AppealsContext.Provider
              value={
                {
                  contactsQueryResult,
                  listAppealStatus: appealStatus,
                  getContactUrl,
                  isRowChecked,
                  contactDetailsOpen,
                  toggleSelectionById,
                } as unknown as AppealsType
              }
            >
              <ContactsList
                appealInfo={defaultAppealQuery}
                appealInfoLoading={appealInfoLoading}
              />
            </AppealsContext.Provider>
          </AppealsWrapper>
        </ThemeProvider>
      </GqlMockedProvider>
    </TestRouter>
  );
};

describe('ContactsRow', () => {
  describe('NullState Message', () => {
    it('shows no contacts on Given', () => {
      const { getByText } = render(
        <Components appealStatus={AppealStatusEnum.Processed} />,
      );

      expect(
        getByText('No donations yet towards this appeal'),
      ).toBeInTheDocument();
    });

    it('shows no contacts on Excluded', () => {
      const { getByText } = render(
        <Components appealStatus={AppealStatusEnum.Excluded} />,
      );

      expect(
        getByText('No contacts have been excluded from this appeal'),
      ).toBeInTheDocument();
    });

    it('shows no contacts on Asked', () => {
      const { getByText } = render(<Components />);

      expect(
        getByText('All contacts for this appeal have committed to this appeal'),
      ).toBeInTheDocument();
    });

    it('shows no contacts on Committed', () => {
      const { getByText } = render(
        <Components appealStatus={AppealStatusEnum.NotReceived} />,
      );

      expect(
        getByText(
          'There are no contacts for this appeal that have not been received.',
        ),
      ).toBeInTheDocument();
    });

    it('shows no contacts on Received', () => {
      const { getByText } = render(
        <Components appealStatus={AppealStatusEnum.ReceivedNotProcessed} />,
      );

      expect(
        getByText(
          'No gifts have been received and not yet processed to this appeal',
        ),
      ).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('Given', () => {
      const { queryByText } = render(
        <Components appealStatus={AppealStatusEnum.Processed} />,
      );
      expect(queryByText('Reason')).not.toBeInTheDocument();
    });

    it('Excluded', () => {
      const { getByText } = render(
        <Components appealStatus={AppealStatusEnum.Excluded} />,
      );
      expect(getByText('Reason')).toBeInTheDocument();
    });

    it('Asked', () => {
      const { queryByText } = render(<Components />);
      expect(queryByText('Reason')).not.toBeInTheDocument();
    });

    it('Committed', () => {
      const { queryByText } = render(
        <Components appealStatus={AppealStatusEnum.NotReceived} />,
      );
      expect(queryByText('Reason')).not.toBeInTheDocument();
    });

    it('Received', () => {
      const { queryByText } = render(
        <Components appealStatus={AppealStatusEnum.ReceivedNotProcessed} />,
      );
      expect(queryByText('Reason')).not.toBeInTheDocument();
    });
  });
});
