import React from 'react';
import { MockedResponse } from '@apollo/client/testing';
import { ThemeProvider } from '@emotion/react';
import { render, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import TestWrapper from '__tests__/util/TestWrapper';
import LoadConstantsMock from 'src/components/Constants/LoadConstantsMock';
import { StatusEnum } from 'src/graphql/types.generated';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import { ContactStatusQueryMock } from '../../TaskModalMocks';
import {
  FormikHandleChange,
  SuggestedContactStatus,
} from './SuggestedContactStatus';

const handleChange: FormikHandleChange = jest.fn();
const accountListId = 'abc';

type ComponentsProps = {
  suggestedContactStatus: StatusEnum;
  contactIds: string[] | undefined;
  contactStatus?: StatusEnum | null;
  mocks?: MockedResponse[];
};

const Components = ({
  suggestedContactStatus,
  contactIds,
  contactStatus,
  mocks = [],
}: ComponentsProps) => (
  <ThemeProvider theme={theme}>
    <I18nextProvider i18n={i18n}>
      <TestWrapper mocks={[LoadConstantsMock(), ...mocks]}>
        <SuggestedContactStatus
          suggestedContactStatus={suggestedContactStatus}
          changeContactStatus={false}
          handleChange={handleChange}
          accountListId={accountListId}
          contactIds={contactIds}
          contactStatus={contactStatus}
        />
      </TestWrapper>
    </I18nextProvider>
  </ThemeProvider>
);

describe('SuggestedContactStatus', () => {
  it("doesn't render suggested contact status when there are multiple contacts", async () => {
    const { queryByText } = render(
      <Components
        suggestedContactStatus={StatusEnum.ContactForAppointment}
        contactIds={['contact-1', 'contact-2']}
        mocks={[
          ContactStatusQueryMock(
            accountListId,
            'contact-1',
            StatusEnum.NeverContacted,
          ),
        ]}
      />,
    );
    await waitFor(() => {
      expect(
        queryByText("Change the contact's status to:"),
      ).not.toBeInTheDocument();
    });
  });

  it("doesn't render suggested contact status when suggested status is the same as the current status", async () => {
    const sameStatus = StatusEnum.ContactForAppointment;
    const { queryByText } = render(
      <Components
        suggestedContactStatus={sameStatus}
        contactIds={['contact-1']}
        mocks={[ContactStatusQueryMock(accountListId, 'contact-1', sameStatus)]}
      />,
    );
    await waitFor(() => {
      expect(
        queryByText("Change the contact's status to:"),
      ).not.toBeInTheDocument();
      expect(queryByText('Initiate for Appointment')).not.toBeInTheDocument();
    });
  });

  it("doesn't render suggested contact status when the current contact is a Prayer, Special or Financial Partner", async () => {
    const { queryByText } = render(
      <Components
        suggestedContactStatus={StatusEnum.ContactForAppointment}
        contactIds={['contact-1']}
        mocks={[
          ContactStatusQueryMock(
            accountListId,
            'contact-1',
            StatusEnum.PartnerFinancial,
          ),
        ]}
      />,
    );
    await waitFor(() => {
      expect(
        queryByText("Change the contact's status to:"),
      ).not.toBeInTheDocument();
      expect(queryByText('Initiate for Appointment')).not.toBeInTheDocument();
    });
  });

  it('renders suggested status when single contact', async () => {
    const { getByText } = render(
      <Components
        suggestedContactStatus={StatusEnum.ContactForAppointment}
        contactIds={['contact-1']}
        mocks={[
          ContactStatusQueryMock(
            accountListId,
            'contact-1',
            StatusEnum.NeverContacted,
          ),
        ]}
      />,
    );

    await waitFor(() => {
      expect(getByText("Change the contact's status to:")).toBeInTheDocument();
      expect(getByText('Initiate for Appointment')).toBeInTheDocument();
    });
  });
});
