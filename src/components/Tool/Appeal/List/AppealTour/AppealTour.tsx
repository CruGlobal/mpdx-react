import React, { useContext, useMemo } from 'react';
import styled from '@emotion/styled';
import { Alert, AlertTitle, Box, Button, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import theme from 'src/theme';
import {
  AppealTourEnum,
  AppealsContext,
  AppealsType,
} from '../../AppealsContext/AppealsContext';

const StatisticsSummary = styled(Box)(() => ({
  display: 'flex',
  flexWrap: 'nowrap',
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(1),
  '@media (max-width: 550px)': {
    flexWrap: 'wrap',
  },
}));

const StatisticBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'color',
})<{ color: string }>(({ color }) => ({
  backgroundColor: color,
  textAlign: 'center',
  padding: theme.spacing(2),
  position: 'relative',
  width: '20%',
  '&:after': {
    content: '" "',
    width: '24px',
    height: '24px',
    position: 'absolute',
    right: '-12px',
    zIndex: '50',
    background: color,
    top: '50%',
    transform: 'translateY(-50%) rotate(45deg)',
  },
  '@media (max-width: 550px)': {
    width: '100%',
    padding: theme.spacing(1),
    '&:after': {
      width: '16px',
      height: '16px',
      top: '100%',
      right: '50%',
      transform: 'translate(50%, -50%) rotate(45deg)',
    },
  },
}));

type ActionButtonsProps = {
  nextTourStep: () => void;
  hideTour: () => void;
  tourStep: AppealTourEnum;
};
const ActionButtons = ({
  nextTourStep,
  hideTour,
  tourStep,
}: ActionButtonsProps) => {
  const { t } = useTranslation();
  return (
    <Box display={'flex'} mt={2}>
      <Box>
        {tourStep !== AppealTourEnum.Finish && (
          <Button
            onClick={() => {
              hideTour();
            }}
            variant="outlined"
            sx={{ marginRight: theme.spacing(2) }}
          >
            {t('Hide')}
          </Button>
        )}

        <Button
          onClick={() => {
            nextTourStep();
          }}
          variant="contained"
        >
          {tourStep === AppealTourEnum.Start && t('Start')}
          {tourStep === AppealTourEnum.Finish && t('Finished')}
          {tourStep === AppealTourEnum.ExportContacts && t('Export to CSV')}

          {tourStep !== AppealTourEnum.Start &&
            tourStep !== AppealTourEnum.ExportContacts &&
            tourStep !== AppealTourEnum.Finish &&
            t('Next')}
        </Button>
      </Box>
    </Box>
  );
};

type StatisticContainerProps = {
  color: string;
  statisticNumber: number;
  statisticName: string;
};
const StatisticContainer = ({
  color,
  statisticNumber,
  statisticName,
}: StatisticContainerProps) => {
  return (
    <StatisticBox color={color}>
      <Typography
        variant="h4"
        fontWeight="bold"
        color={theme.palette.common.white}
      >
        {statisticNumber ?? 0}
      </Typography>
      <Typography
        variant="body1"
        fontWeight="bold"
        color={theme.palette.common.white}
      >
        {statisticName ?? ''}
      </Typography>
    </StatisticBox>
  );
};

export const AppealTour: React.FC = () => {
  const { t } = useTranslation();
  const {
    tour,
    hideTour,
    nextTourStep,
    askedCountQueryResult,
    excludedCountQueryResult,
    committedCountQueryResult,
    givenCountQueryResult,
    receivedCountQueryResult,
  } = useContext(AppealsContext) as AppealsType;

  const { data: askedCount } = askedCountQueryResult;
  const { data: excludedCount } = excludedCountQueryResult;
  const { data: committedCount } = committedCountQueryResult;
  const { data: givenCount } = givenCountQueryResult;
  const { data: receivedCount } = receivedCountQueryResult;

  const tourInfo = useMemo(() => {
    switch (tour) {
      case AppealTourEnum.ReviewExcluded:
        return {
          title: t('Review Excluded'),
          text: t(
            'Go through your list of excluded contacts to see if they should be asked',
          ),
        };
      case AppealTourEnum.ReviewAsked:
        return {
          title: t('Review Asked'),
          text: t(
            'Go through your list of contacts to ask and ensure there are no contacts that should be excluded',
          ),
        };
      case AppealTourEnum.ExportContacts:
        return {
          title: t('Export Contacts'),
          text: t(
            'Export to CSV and send your appeal to reach out to your contacts',
          ),
        };
      case AppealTourEnum.Finish:
        return {
          title: t("You're all done"),
          text: t(
            'Send your appeal to your contacts and come back here later to add their commitments',
          ),
        };
      case AppealTourEnum.Start:
      default:
        return {
          title: t('Appeal created successfully'),
          text: t('Get started by reviewing your excluded contacts list.'),
        };
    }
  }, [tour]);

  if (!tour) {
    return null;
  }

  return (
    <Box data-testid="appealTour">
      <Alert severity="success" onClose={hideTour}>
        <AlertTitle>
          <Typography variant="h5">{tourInfo.title}</Typography>
        </AlertTitle>
        <Typography variant="body1">{tourInfo.text}</Typography>

        <ActionButtons
          nextTourStep={nextTourStep}
          hideTour={hideTour}
          tourStep={tour}
        />
      </Alert>
      <StatisticsSummary>
        <StatisticContainer
          color={theme.palette.statusDanger.main}
          statisticName={t('Excluded')}
          statisticNumber={excludedCount?.contacts.totalCount ?? 0}
        />
        <StatisticContainer
          color={theme.palette.mpdxGrayDark.main}
          statisticName={t('Asked')}
          statisticNumber={askedCount?.contacts.totalCount ?? 0}
        />
        <StatisticContainer
          color={theme.palette.progressBarYellow.main}
          statisticName={t('Committed')}
          statisticNumber={committedCount?.contacts.totalCount ?? 0}
        />
        <StatisticContainer
          color={theme.palette.progressBarYellow.main}
          statisticName={t('Received')}
          statisticNumber={givenCount?.contacts.totalCount ?? 0}
        />
        <StatisticContainer
          color={theme.palette.statusSuccess.main}
          statisticName={t('Given')}
          statisticNumber={receivedCount?.contacts.totalCount ?? 0}
        />
      </StatisticsSummary>
    </Box>
  );
};
