import { useTranslation } from 'react-i18next';
import { DirectionButtons } from '../../Shared/DirectionButtons';

interface CalculationProps {
  handleNext: () => void;
}

export const Calculation: React.FC<CalculationProps> = ({ handleNext }) => {
  const { t } = useTranslation();

  return (
    <div>
      {t('Calculation Step Content')}
      <DirectionButtons handleNext={handleNext} />
    </div>
  );
};
