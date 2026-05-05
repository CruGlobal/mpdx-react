import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { loadConstantsMockData } from 'src/components/Constants/LoadConstantsMock';
import { ContactPanelProvider } from 'src/components/Shared/ContactPanelProvider/ContactPanelProvider';
import { StatusEnum } from 'src/graphql/types.generated';
import theme from '../../../theme';
import { ContactPartnershipStatus } from './ContactPartnershipStatus';

const defaultStatus = StatusEnum.PartnerFinancial;

interface TestComponentProps {
  pledgeAmount?: number | null;
  pledgeCurrency?: string | null;
  pledgeReceived?: boolean;
  status?: StatusEnum;
}

const TestComponent: React.FC<TestComponentProps> = ({
  pledgeAmount = null,
  pledgeCurrency = null,
  pledgeReceived = false,
  status = defaultStatus,
}) => {
  return (
    <TestRouter>
      <GqlMockedProvider>
        <ThemeProvider theme={theme}>
          <ContactPanelProvider>
            <ContactPartnershipStatus
              lateAt={null}
              pledgeStartDate={null}
              pledgeAmount={pledgeAmount}
              pledgeCurrency={pledgeCurrency}
              pledgeFrequency={null}
              pledgeReceived={pledgeReceived}
              status={status}
            />
          </ContactPanelProvider>
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

  it('does not render pledgeReceived status when pledge received is true', () => {
    const { queryByText } = render(<TestComponent pledgeReceived />);
    expect(queryByText('Commitment Not Received')).not.toBeInTheDocument();
  });

  it('does render pledgeReceived status when pledge received is false', () => {
    const { getByText } = render(<TestComponent />);
    expect(getByText('Commitment Not Received')).toBeInTheDocument();
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
