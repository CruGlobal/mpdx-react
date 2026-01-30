import { EffectiveDateStep } from './EffectiveDateStep/EffectiveDateStep';
import { ReceiptStep } from './Receipt/Receipt';
import { SalaryCalculationStep } from './SalaryCalculation/SalaryCalculation';
import { useSalaryCalculator } from './SalaryCalculatorContext/SalaryCalculatorContext';
import { SummaryStep } from './Summary/Summary';
import { YourInformationStep } from './YourInformation/YourInformation';

export const CurrentStep: React.FC = () => {
  const { currentIndex } = useSalaryCalculator();

  const steps = [
    <EffectiveDateStep key="effective-date" />,
    <YourInformationStep key="your-information" />,
    <SalaryCalculationStep key="salary-calculation" />,
    <SummaryStep key="summary" />,
    <ReceiptStep key="receipt" />,
  ];

  return steps[currentIndex] ?? null;
};
