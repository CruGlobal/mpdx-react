import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Box, Grid, IconButton, Skeleton, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AppealFieldsFragment } from 'pages/accountLists/[accountListId]/tools/GetAppeals.generated';
import { EditIcon } from 'src/components/Contacts/ContactDetails/ContactDetailsTab/StyledComponents';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import theme from 'src/theme';
import AppealProgressBar from '../AppealProgressBar';
import { EditAppealHeaderInfoModal } from './EditAppealHeaderInfoModal/EditAppealHeaderInfoModal';

export const appealHeaderInfoHeight = theme.spacing(9);

const HeaderBarContactWrap = styled(Box)(() => ({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
}));

const AppealInfoHeader = styled(Typography)(() => ({
  color: theme.palette.cruGrayMedium.main,
}));

const AppealInfo = styled(Typography)(() => ({
  display: 'inline',
  fontWeight: 'bold',
}));

const AppealInfoContainer = styled(Box)(() => ({
  display: 'flex',
  flexWrap: 'nowrap',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const GridContainer = styled(Grid)(() => ({
  height: appealHeaderInfoHeight,
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.cruGrayLight.main}`,
}));

export type AppealHeaderInfoProps = {
  appealInfo?: AppealFieldsFragment;
  loading: boolean;
};

export const AppealHeaderInfo: React.FC<AppealHeaderInfoProps> = ({
  appealInfo,
  loading,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  const [isEditAppealModalOpen, setIsEditAppealModalOpen] = useState(false);

  const name = appealInfo?.name || '';
  const amount = appealInfo?.amount || 0;
  const amountCurrency = appealInfo?.amountCurrency || 'USD';
  const given = appealInfo?.pledgesAmountProcessed || 0;
  const received = appealInfo?.pledgesAmountReceivedNotProcessed || 0;
  const committed = appealInfo?.pledgesAmountNotReceivedNotProcessed || 0;

  return (
    <>
      <GridContainer container>
        <Grid item xs={12} sm={7}>
          <HeaderBarContactWrap>
            <Grid item xs={7}>
              <AppealInfoHeader variant="subtitle2">
                {t('Name')}:
              </AppealInfoHeader>
              <AppealInfoContainer>
                {loading || !name ? (
                  <Skeleton
                    variant="text"
                    data-testid="appeal-name-skeleton"
                    style={{
                      display: 'inline',
                      width: 200,
                      fontSize: 24,
                    }}
                  />
                ) : (
                  <>
                    <AppealInfo variant="h5">{name}</AppealInfo>
                    <IconButton
                      onClick={() => setIsEditAppealModalOpen(true)}
                      aria-label={t('Edit Icon')}
                    >
                      <EditIcon />
                    </IconButton>
                  </>
                )}
              </AppealInfoContainer>
            </Grid>
            <Grid item xs={5}>
              <AppealInfoHeader variant="subtitle2">
                {t('Goal')}:
              </AppealInfoHeader>
              <AppealInfoContainer>
                {loading || !amount ? (
                  <Skeleton
                    variant="text"
                    data-testid="appeal-goal-skeleton"
                    style={{
                      display: 'inline',
                      width: 100,
                      fontSize: 24,
                    }}
                  />
                ) : (
                  <>
                    <AppealInfo variant="h5">
                      {currencyFormat(amount, amountCurrency, locale)}
                    </AppealInfo>
                    <IconButton
                      onClick={() => setIsEditAppealModalOpen(true)}
                      aria-label={t('Edit Icon')}
                    >
                      <EditIcon />
                    </IconButton>
                  </>
                )}
              </AppealInfoContainer>
            </Grid>
          </HeaderBarContactWrap>
        </Grid>
        <Grid xs={12} sm={5} item style={{ paddingTop: '10px' }}>
          <AppealProgressBar
            given={given}
            received={received}
            committed={committed}
            amount={amount}
            amountCurrency={amountCurrency}
          />
        </Grid>
      </GridContainer>

      {isEditAppealModalOpen && appealInfo && (
        <EditAppealHeaderInfoModal
          handleClose={() => setIsEditAppealModalOpen(false)}
          appealInfo={appealInfo}
        />
      )}
    </>
  );
};
