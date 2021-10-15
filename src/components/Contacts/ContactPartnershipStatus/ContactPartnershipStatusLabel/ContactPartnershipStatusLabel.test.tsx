import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@material-ui/core';
import theme from '../../../../theme';
import { StatusEnum as ContactPartnershipStatusEnum } from '../../../../../graphql/types.generated';
import { ContactPartnershipStatusLabel } from './ContactPartnershipStatusLabel';
import { contactPartnershipStatus } from 'src/utils/contacts/contactPartnershipStatus';

describe('ContactPartnershipStatusLabel', () => {
  it('default', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <ContactPartnershipStatusLabel
          status={ContactPartnershipStatusEnum.PartnerPray}
        />
      </ThemeProvider>,
    );
    expect(
      getByText(
        contactPartnershipStatus[ContactPartnershipStatusEnum.PartnerPray],
      ),
    ).not.toBeInTheDocument();
  });
});
