import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@material-ui/core';
import theme from '../../../theme';
import { StatusEnum as ContactPartnershipStatusEnum } from '../../../../graphql/types.generated';
import { ContactPartnershipStatus } from './ContactPartnershipStatus';
import { contactPartnershipStatus } from 'src/utils/contacts/contactPartnershipStatus';

describe('ContactPartnershipStatusLabel', () => {
  it('default', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <ContactPartnershipStatus
          lateAt={null}
          isContactDetailOpen={false}
          pledgeAmount={null}
          pledgeCurrency={null}
          pledgeFrequency={null}
          status={ContactPartnershipStatusEnum.PartnerFinancial}
        />
      </ThemeProvider>,
    );
    expect(
      getByText(
        contactPartnershipStatus[ContactPartnershipStatusEnum.PartnerFinancial],
      ),
    ).toBeInTheDocument();
  });
});
