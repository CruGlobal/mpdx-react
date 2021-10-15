import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@material-ui/core';
import theme from '../../../../theme';
import { ContactLateStatusEnum } from '../ContactLateStatusLabel/ContactLateStatusLabel';
import { ContactPartnershipStatusIcon } from './ContactPartnershipStatusIcon';

describe('ContactPartnershipStatusIcon', () => {
  it('is late less than 30 days', () => {
    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <ContactPartnershipStatusIcon
          lateStatusEnum={ContactLateStatusEnum.LateLessThirty}
        />
      </ThemeProvider>,
    );
    expect(
      getByRole('img', {
        name: 'Late Less Than Thirty',
      }),
    ).toBeVisible();
  });

  it('is On Time', () => {
    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <ContactPartnershipStatusIcon
          lateStatusEnum={ContactLateStatusEnum.OnTime}
        />
      </ThemeProvider>,
    );
    expect(
      getByRole('img', {
        name: 'On Time',
      }),
    ).toBeVisible();
  });
});
