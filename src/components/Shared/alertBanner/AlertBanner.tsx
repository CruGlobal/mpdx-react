import React, { useEffect, useState } from 'react';
import { Alert } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

interface AlertBannerProps {
  text: string;
  severity?: 'error' | 'info' | 'success' | 'warning';
  localStorageName: string;
}
const AlertBox = styled(Alert)({
  position: 'fixed',
  top: '64px',
  width: '100%',
  zIndex: '10',
  ['@media (max-width:1126px)']: {
    top: '73px',
  },
  ['@media (max-width:900px)']: {
    top: '65px',
  },
  ['@media (max-width:600px)']: {
    top: '57px',
  },
});

export const AlertBanner: React.FC<AlertBannerProps> = ({
  text,
  severity = 'warning',
  localStorageName,
}) => {
  const { t } = useTranslation();
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if (!window?.localStorage) return;
    const isClosed = window.localStorage.getItem(
      `alert-${localStorageName}-closed`,
    );
    if (!isClosed && isClosed !== 'true') setShowAlert(true);
  }, []);

  const closeAlert = () => {
    window.localStorage.setItem(`alert-${localStorageName}-closed`, 'true');
    setShowAlert(false);
  };

  return showAlert ? (
    <AlertBox onClose={() => closeAlert()} severity={severity}>
      {t(text)}
    </AlertBox>
  ) : null;
};
