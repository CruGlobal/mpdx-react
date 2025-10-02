import React from 'react';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useGoalCalculatorConstants } from 'src/hooks/useGoalCalculatorConstants';
import { RightPanel } from './RightPanel';

const MonthlySavingsTable = styled('table')({
  width: '100%',
});

export const SavingsPanel: React.FC = () => {
  const { t } = useTranslation();
  const { goalMiscConstants } = useGoalCalculatorConstants();

  return (
    <RightPanel title={t('Emergency Savings Guide')}>
      <MonthlySavingsTable>
        <tbody>
          {goalMiscConstants?.RECOMMENDED_EMERGENCY_SAVINGS?.INDIVIDUALS
            ?.fee && (
            <tr>
              <td>{t('Individuals')}</td>
              <td>
                $
                {
                  goalMiscConstants.RECOMMENDED_EMERGENCY_SAVINGS.INDIVIDUALS
                    .fee
                }
                /{t('month')}
              </td>
            </tr>
          )}
          {goalMiscConstants?.RECOMMENDED_EMERGENCY_SAVINGS?.COUPLES?.fee && (
            <tr>
              <td>{t('Couples')}</td>
              <td>
                ${goalMiscConstants.RECOMMENDED_EMERGENCY_SAVINGS.COUPLES.fee}/
                {t('month')}
              </td>
            </tr>
          )}
          {goalMiscConstants?.RECOMMENDED_EMERGENCY_SAVINGS?.WITH_KIDS?.fee && (
            <tr>
              <td>{t('With kids')}</td>
              <td>
                ${goalMiscConstants.RECOMMENDED_EMERGENCY_SAVINGS.WITH_KIDS.fee}
                /{t('month')}
              </td>
            </tr>
          )}
        </tbody>
      </MonthlySavingsTable>
    </RightPanel>
  );
};
