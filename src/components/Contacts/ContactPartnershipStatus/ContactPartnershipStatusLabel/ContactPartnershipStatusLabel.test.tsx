import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { contactPartnershipStatus } from 'src/utils/contacts/contactPartnershipStatus';
import { StatusEnum as ContactPartnershipStatusEnum } from '../../../../../graphql/types.generated';
import i18n from '../../../../lib/i18n';
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
