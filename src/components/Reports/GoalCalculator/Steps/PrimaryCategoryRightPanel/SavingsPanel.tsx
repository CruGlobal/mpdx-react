import React from 'react';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { RightPanel } from './RightPanel';

const MonthlySavingsTable = styled('table')({
  width: '100%',
});

export const SavingsPanel: React.FC = () => {
  const { t } = useTranslation();

  return (
    <RightPanel title={t('Emergency Savings Guide')}>
      <MonthlySavingsTable>
        <tbody>
          <tr>
            <td>{t('Individuals')}</td>
            <td>$50/{t('month')}</td>
          </tr>
          <tr>
            <td>{t('Couples')}</td>
            <td>$100/{t('month')}</td>
          </tr>
          <tr>
            <td>{t('With kids')}</td>
            <td>$150/{t('month')}</td>
          </tr>
        </tbody>
      </MonthlySavingsTable>
    </RightPanel>
  );
};
