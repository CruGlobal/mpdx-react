import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { StatusEnum as ContactPartnershipStatusEnum } from 'src/graphql/types.generated';
import i18n from 'src/lib/i18n';
import { contactPartnershipStatus } from 'src/utils/contacts/contactPartnershipStatus';
import theme from '../../../../theme';
import { ContactPartnershipStatusLabel } from './ContactPartnershipStatusLabel';

describe('ContactPartnershipStatusLabel', () => {
  it('default', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <I18nextProvider i18n={i18n}>
          <ContactPartnershipStatusLabel
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
