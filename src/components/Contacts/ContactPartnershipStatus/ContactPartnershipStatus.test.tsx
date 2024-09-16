import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { StatusEnum as ContactPartnershipStatusEnum } from 'src/graphql/types.generated';
import i18n from 'src/lib/i18n';
import { contactPartnershipStatus } from 'src/utils/contacts/contactPartnershipStatus';
import theme from '../../../theme';
import { ContactPartnershipStatus } from './ContactPartnershipStatus';

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

  describe('pledge amount', () => {
    it('renders pledge amount', () => {
      const { getByText } = render(
        <ThemeProvider theme={theme}>
          <I18nextProvider i18n={i18n}>
            <ContactPartnershipStatus
              lateAt={null}
              contactDetailsOpen={false}
              pledgeAmount={100}
              pledgeCurrency={'USD'}
              pledgeFrequency={null}
              pledgeReceived={false}
              status={ContactPartnershipStatusEnum.PartnerPray}
            />
          </I18nextProvider>
        </ThemeProvider>,
      );
      expect(getByText('$100')).toBeInTheDocument();
    });

    it('does not render pledge amount when 0', () => {
      const { queryByText } = render(
        <ThemeProvider theme={theme}>
          <I18nextProvider i18n={i18n}>
            <ContactPartnershipStatus
              lateAt={null}
              contactDetailsOpen={false}
              pledgeAmount={0}
              pledgeCurrency={'USD'}
              pledgeFrequency={null}
              pledgeReceived={false}
              status={ContactPartnershipStatusEnum.PartnerPray}
            />
          </I18nextProvider>
        </ThemeProvider>,
      );
      expect(queryByText('$0')).not.toBeInTheDocument();
      expect(queryByText('0')).not.toBeInTheDocument();
    });
  });
});
