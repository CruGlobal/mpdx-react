import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { loadConstantsMockData } from 'src/components/Constants/LoadConstantsMock';
import { StatusEnum } from 'src/graphql/types.generated';
import theme from '../../../../theme';
import { ContactPartnershipStatusLabel } from './ContactPartnershipStatusLabel';

const status = StatusEnum.PartnerPray;

describe('ContactPartnershipStatusLabel', () => {
  it('default', async () => {
    const { findByText } = render(
      <GqlMockedProvider>
        <ThemeProvider theme={theme}>
          <ContactPartnershipStatusLabel status={status} />
        </ThemeProvider>
      </GqlMockedProvider>,
    );
    expect(
      await findByText(
        loadConstantsMockData.constant.status?.find((s) => s.id === status)
          ?.value || '',
      ),
    ).toBeInTheDocument();
  });
});
