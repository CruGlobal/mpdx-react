import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { loadConstantsMockData } from 'src/components/Constants/LoadConstantsMock';
import { ContactPanelProvider } from 'src/components/common/ContactPanelProvider/ContactPanelProvider';
import { StatusEnum } from 'src/graphql/types.generated';
import i18n from 'src/lib/i18n';
import theme from '../../../theme';
import { ContactPartnershipStatus } from './ContactPartnershipStatus';

const defaultStatus = StatusEnum.PartnerFinancial;

interface TestComponentProps {
  pledgeAmount?: number | null;
  pledgeCurrency?: string | null;
  status?: StatusEnum;
}

const TestComponent: React.FC<TestComponentProps> = ({
  pledgeAmount = null,
  pledgeCurrency = null,
  status = defaultStatus,
}) => {
  return (
    <TestRouter>
      <GqlMockedProvider>
        <ThemeProvider theme={theme}>
          <I18nextProvider i18n={i18n}>
            <ContactPanelProvider>
              <ContactPartnershipStatus
                lateAt={null}
                pledgeStartDate={null}
                pledgeAmount={pledgeAmount}
                pledgeCurrency={pledgeCurrency}
                pledgeFrequency={null}
                pledgeReceived={false}
                status={status}
              />
            </ContactPanelProvider>
          </I18nextProvider>
        </ThemeProvider>
      </GqlMockedProvider>
    </TestRouter>
  );
};

describe('ContactPartnershipStatus', () => {
  it('default', async () => {
    const { findByText } = render(<TestComponent />);
    expect(
      await findByText(
        loadConstantsMockData.constant.status?.find(
          (s) => s.id === defaultStatus,
        )?.value || '',
      ),
    ).toBeInTheDocument();
  });

  it('render partner pray', async () => {
    const { findByText } = render(
      <TestComponent status={StatusEnum.PartnerPray} />,
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
        <TestComponent
          pledgeAmount={100}
          pledgeCurrency="USD"
          status={StatusEnum.PartnerPray}
        />,
      );
      expect(getByText('$100')).toBeInTheDocument();
    });

    it('does not render pledge amount when 0', () => {
      const { queryByText } = render(
        <TestComponent
          pledgeAmount={0}
          pledgeCurrency="USD"
          status={StatusEnum.PartnerPray}
        />,
      );
      expect(queryByText('$0')).not.toBeInTheDocument();
      expect(queryByText('0')).not.toBeInTheDocument();
    });
  });
});
