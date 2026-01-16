import { EffectiveDateStep } from './EffectiveDateStep/EffectiveDateStep';
import { ReceiptStep } from './Receipt/Receipt';
import { SalaryCalculationStep } from './SalaryCalculation/SalaryCalculation';
import { SalaryCalculatorSectionEnum } from './SalaryCalculatorContext/Helper/sharedTypes';
import { useSalaryCalculator } from './SalaryCalculatorContext/SalaryCalculatorContext';
import { SummaryStep } from './Summary/Summary';
import { YourInformationStep } from './YourInformation/YourInformation';

export const CurrentStep: React.FC = () => {
  const { currentStep } = useSalaryCalculator();

  switch (currentStep) {
    case SalaryCalculatorSectionEnum.EffectiveDate:
      return <EffectiveDateStep />;
    case SalaryCalculatorSectionEnum.YourInformation:
      return <YourInformationStep />;
    case SalaryCalculatorSectionEnum.SalaryCalculation:
      return <SalaryCalculationStep />;
    case SalaryCalculatorSectionEnum.Summary:
      return <SummaryStep />;
    case SalaryCalculatorSectionEnum.Receipt:
      return <ReceiptStep />;
  }
};
