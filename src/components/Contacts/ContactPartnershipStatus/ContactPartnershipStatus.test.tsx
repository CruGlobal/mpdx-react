import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@material-ui/core';
import theme from '../../../theme';
import { StatusEnum as ContactPartnershipStatusEnum } from '../../../../graphql/types.generated';
import { ContactPartnershipStatus } from './ContactPartnershipStatus';
import { contactPartnershipStatus } from 'src/utils/contacts/contactPartnershipStatus';

describe('ContactPartnershipStatus', () => {
  it('default', () => {
    const { queryByText } = render(
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
      queryByText(
        contactPartnershipStatus[ContactPartnershipStatusEnum.PartnerFinancial],
      ),
    ).not.toBeInTheDocument();
  });

  it('render partner pray', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <ContactPartnershipStatus
          lateAt={null}
          isContactDetailOpen={false}
          pledgeAmount={null}
          pledgeCurrency={null}
          pledgeFrequency={null}
          status={ContactPartnershipStatusEnum.PartnerPray}
        />
      </ThemeProvider>,
    );
    expect(
      getByText(
        contactPartnershipStatus[ContactPartnershipStatusEnum.PartnerPray],
      ),
    ).toBeInTheDocument();
  });
});
