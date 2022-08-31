import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@mui/material';
import { I18nextProvider } from 'react-i18next';
import theme from '../../../theme';
import { StatusEnum as ContactPartnershipStatusEnum } from '../../../../graphql/types.generated';
import i18n from '../../../lib/i18n';
import { ContactPartnershipStatus } from './ContactPartnershipStatus';
import { contactPartnershipStatus } from 'src/utils/contacts/contactPartnershipStatus';

describe('ContactPartnershipStatus', () => {
  it('default', () => {
    const { queryByText } = render(
      <ThemeProvider theme={theme}>
        <I18nextProvider i18n={i18n}>
          <ContactPartnershipStatus
            lateAt={null}
            contactDetailsOpen={false}
            pledgeAmount={null}
            pledgeCurrency={null}
            pledgeFrequency={null}
            pledgeReceived={false}
            status={ContactPartnershipStatusEnum.PartnerFinancial}
          />
        </I18nextProvider>
      </ThemeProvider>,
    );
    expect(
      queryByText(
        contactPartnershipStatus[ContactPartnershipStatusEnum.PartnerFinancial],
      ),
    ).toBeInTheDocument();
  });

  it('render partner pray', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <I18nextProvider i18n={i18n}>
          <ContactPartnershipStatus
            lateAt={null}
            contactDetailsOpen={false}
            pledgeAmount={null}
            pledgeCurrency={null}
            pledgeFrequency={null}
            pledgeReceived={false}
            status={ContactPartnershipStatusEnum.PartnerPray}
          />
        </I18nextProvider>
      </ThemeProvider>,
    );
    expect(
      getByText(
        contactPartnershipStatus[ContactPartnershipStatusEnum.PartnerPray],
      ),
    ).toBeInTheDocument();
  });
});
