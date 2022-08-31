import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@mui/material';
import { I18nextProvider } from 'react-i18next';
import theme from '../../../../theme';
import { StatusEnum as ContactPartnershipStatusEnum } from '../../../../../graphql/types.generated';
import i18n from '../../../../lib/i18n';
import { ContactPartnershipStatusLabel } from './ContactPartnershipStatusLabel';
import { contactPartnershipStatus } from 'src/utils/contacts/contactPartnershipStatus';

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
