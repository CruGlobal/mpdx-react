import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { LoadConstantsQuery } from 'src/components/Constants/LoadConstants.generated';
import { loadConstantsMockData } from 'src/components/Constants/LoadConstantsMock';
import { StatusEnum } from 'src/graphql/types.generated';
import i18n from 'src/lib/i18n';
import theme from '../../../theme';
import { ContactPartnershipStatus } from './ContactPartnershipStatus';

const status = StatusEnum.PartnerFinancial;

describe('ContactPartnershipStatus', () => {
  it('default', async () => {
    const { findByText } = render(
      <GqlMockedProvider<{
        LoadConstants: LoadConstantsQuery;
      }>
        mocks={{ LoadConstants: loadConstantsMockData }}
      >
        <ThemeProvider theme={theme}>
          <I18nextProvider i18n={i18n}>
            <ContactPartnershipStatus
              lateAt={null}
              contactDetailsOpen={false}
              pledgeAmount={null}
              pledgeCurrency={null}
              pledgeFrequency={null}
              pledgeReceived={false}
              status={status}
            />
          </I18nextProvider>
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

  it('render partner pray', async () => {
    const { findByText } = render(
      <GqlMockedProvider<{
        LoadConstants: LoadConstantsQuery;
      }>
        mocks={{ LoadConstants: loadConstantsMockData }}
      >
        <ThemeProvider theme={theme}>
          <I18nextProvider i18n={i18n}>
            <ContactPartnershipStatus
              lateAt={null}
              contactDetailsOpen={false}
              pledgeAmount={null}
              pledgeCurrency={null}
              pledgeFrequency={null}
              pledgeReceived={false}
              status={StatusEnum.PartnerPray}
            />
          </I18nextProvider>
        </ThemeProvider>
      </GqlMockedProvider>,
    );
    expect(
      await findByText(
        loadConstantsMockData.constant.status?.find(
          (s) => s.id === StatusEnum.PartnerPray,
        )?.value || '',
      ),
    ).toBeInTheDocument();
  });

  describe('pledge amount', () => {
    it('renders pledge amount', () => {
      const { getByText } = render(
        <GqlMockedProvider<{
          LoadConstants: LoadConstantsQuery;
        }>
          mocks={{ LoadConstants: loadConstantsMockData }}
        >
          <ThemeProvider theme={theme}>
            <I18nextProvider i18n={i18n}>
              <ContactPartnershipStatus
                lateAt={null}
                contactDetailsOpen={false}
                pledgeAmount={100}
                pledgeCurrency={'USD'}
                pledgeFrequency={null}
                pledgeReceived={false}
                status={StatusEnum.PartnerPray}
              />
            </I18nextProvider>
          </ThemeProvider>
        </GqlMockedProvider>,
      );
      expect(getByText('$100')).toBeInTheDocument();
    });

    it('does not render pledge amount when 0', () => {
      const { queryByText } = render(
        <GqlMockedProvider<{
          LoadConstants: LoadConstantsQuery;
        }>
          mocks={{ LoadConstants: loadConstantsMockData }}
        >
          <ThemeProvider theme={theme}>
            <I18nextProvider i18n={i18n}>
              <ContactPartnershipStatus
                lateAt={null}
                contactDetailsOpen={false}
                pledgeAmount={0}
                pledgeCurrency={'USD'}
                pledgeFrequency={null}
                pledgeReceived={false}
                status={StatusEnum.PartnerPray}
              />
            </I18nextProvider>
          </ThemeProvider>
        </GqlMockedProvider>,
      );
      expect(queryByText('$0')).not.toBeInTheDocument();
      expect(queryByText('0')).not.toBeInTheDocument();
    });
  });
});
