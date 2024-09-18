import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { LoadConstantsQuery } from 'src/components/Constants/LoadConstants.generated';
import { loadConstantsMockData } from 'src/components/Constants/LoadConstantsMock';
import { StatusEnum } from 'src/graphql/types.generated';
import i18n from 'src/lib/i18n';
import theme from '../../../../theme';
import { ContactPartnershipStatusLabel } from './ContactPartnershipStatusLabel';

const status = StatusEnum.PartnerPray;

describe('ContactPartnershipStatusLabel', () => {
  it('default', async () => {
    const { findByText } = render(
      <GqlMockedProvider<{
        LoadConstants: LoadConstantsQuery;
      }>
        mocks={{ LoadConstants: loadConstantsMockData }}
      >
        <ThemeProvider theme={theme}>
          <I18nextProvider i18n={i18n}>
            <ContactPartnershipStatusLabel status={status} />
          </I18nextProvider>
        </ThemeProvider>
      </GqlMockedProvider>,
    );
    expect(
      await findByText(
        loadConstantsMockData.constant.statuses?.find((s) => s.id === status)
          ?.value || '',
      ),
    ).toBeInTheDocument();
  });
});
