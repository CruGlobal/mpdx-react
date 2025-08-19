import React from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { styled } from '@mui/system';
import { useTranslation } from 'react-i18next';

const StyledHelperPanelBox = styled(Box)({
  padding: '16px',
});

const StyledNoticeTypography = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(2),
  color: theme.palette.error.main,
  fontStyle: 'italic',
}));

export const Contribution403bHelperPanel = () => {
  const { t } = useTranslation();
  return (
    <StyledHelperPanelBox>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                {t('403(b) / IRA Suggested Contribution Levels')}
              </TableCell>
              <TableCell align="right">{t('In SECA')}</TableCell>
              <TableCell align="right">{t('Out of SECA')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>{t('New Staff Goal')}</TableCell>
              <TableCell align="right">5%</TableCell>
              <TableCell align="right">8%</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t('Desired Goal 1-2 yrs')}</TableCell>
              <TableCell align="right">10%</TableCell>
              <TableCell align="right">12%</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t('Desired Goal 3-5 yrs')}</TableCell>
              <TableCell align="right">15%</TableCell>
              <TableCell align="right">18%</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <StyledNoticeTypography variant="body2">
        {t(
          'If you opted out of SECA, you should save more than this for retirement.',
        )}
      </StyledNoticeTypography>
    </StyledHelperPanelBox>
  );
};
