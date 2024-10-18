import React from 'react';
import { ThemeProvider } from '@emotion/react';
import { render, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { StatusEnum } from 'src/graphql/types.generated';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import {
  FormikHandleChange,
  SuggestedContactStatus,
} from './SuggestedContactStatus';
import { ContactStatusQuery } from './SuggestedContactStatus.generated';

const handleChange: FormikHandleChange = jest.fn();
const accountListId = 'abc';
const mutationSpy = jest.fn();

type ComponentsProps = {
  suggestedContactStatus: StatusEnum;
  contactIds: string[] | undefined;
  contactStatus?: StatusEnum | null;
  contactStatusQueryMock?: StatusEnum | null;
};

const Components = ({
  suggestedContactStatus,
  contactIds,
  contactStatus,
  contactStatusQueryMock,
}: ComponentsProps) => (
  <ThemeProvider theme={theme}>
    <I18nextProvider i18n={i18n}>
      <GqlMockedProvider<{
        ContactStatus: ContactStatusQuery;
      }>
        mocks={{
          ContactStatus: {
            contact: {
              status: contactStatusQueryMock || null,
            },
          },
        }}
        onCall={mutationSpy}
      >
        <SuggestedContactStatus
          suggestedContactStatus={suggestedContactStatus}
          changeContactStatus={false}
          handleChange={handleChange}
          accountListId={accountListId}
          contactIds={contactIds}
          contactStatus={contactStatus}
        />
      </GqlMockedProvider>
    </I18nextProvider>
  </ThemeProvider>
);

describe('SuggestedContactStatus', () => {
  it("doesn't render suggested contact status when there are multiple contacts", async () => {
    const { queryByRole } = render(
      <Components
        suggestedContactStatus={StatusEnum.ContactForAppointment}
        contactIds={['contact-1', 'contact-2']}
        contactStatus={StatusEnum.NeverContacted}
      />,
    );
    await waitFor(() => {
      expect(
        queryByRole('checkbox', { name: /^Change the contact's status/ }),
      ).not.toBeInTheDocument();
    });
  });

  it("doesn't render suggested contact status when suggested status is the same as the current status", async () => {
    const sameStatus = StatusEnum.ContactForAppointment;
    const { queryByRole } = render(
      <Components
        suggestedContactStatus={sameStatus}
        contactIds={['contact-1']}
        contactStatus={sameStatus}
      />,
    );
    await waitFor(() => {
      expect(
        queryByRole('checkbox', { name: /^Change the contact's status/ }),
      ).not.toBeInTheDocument();
    });
  });

  it("doesn't render suggested contact status when the current contact is a Prayer, Special or Financial Partner", async () => {
    const { queryByRole } = render(
      <Components
        suggestedContactStatus={StatusEnum.ContactForAppointment}
        contactIds={['contact-1']}
        contactStatus={StatusEnum.PartnerFinancial}
      />,
    );
    await waitFor(() => {
      expect(
        queryByRole('checkbox', { name: /^Change the contact's status/ }),
      ).not.toBeInTheDocument();
    });
  });

  it('renders suggested status when single contact and checks contact status with gql call', async () => {
    const { findByRole } = render(
      <Components
        suggestedContactStatus={StatusEnum.ContactForAppointment}
        contactIds={['contact-1']}
        contactStatusQueryMock={StatusEnum.NeverContacted}
      />,
    );

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('ContactStatus', {
        accountListId: accountListId,
        contactId: 'contact-1',
      }),
    );
    expect(
      await findByRole('checkbox', {
        name: "Change the contact's status to: Initiate for Appointment",
      }),
    ).toBeInTheDocument();
  });

  it('does not send a ContactStatus graphql request when the current contacts status is provided', async () => {
    const { findByRole } = render(
      <Components
        suggestedContactStatus={StatusEnum.ContactForAppointment}
        contactIds={['contact-1']}
        contactStatus={StatusEnum.NeverContacted}
        contactStatusQueryMock={StatusEnum.NeverContacted}
      />,
    );

    expect(
      await findByRole('checkbox', {
        name: "Change the contact's status to: Initiate for Appointment",
      }),
    ).toBeInTheDocument();
    expect(mutationSpy).not.toHaveGraphqlOperation('ContactStatus');
  });

  it('renders suggested status when the contact has no status', async () => {
    const { findByRole } = render(
      <Components
        suggestedContactStatus={StatusEnum.ContactForAppointment}
        contactIds={['contact-1']}
        contactStatus={null}
        contactStatusQueryMock={null}
      />,
    );

    expect(
      await findByRole('checkbox', {
        name: "Change the contact's status to: Initiate for Appointment",
      }),
    ).toBeInTheDocument();
  });
});
