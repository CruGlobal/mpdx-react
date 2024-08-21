import React, { useEffect } from 'react';
import styled from '@emotion/styled';
import { Alert, AlertTitle, Box, Button, Typography } from '@mui/material';
import { TFunction, useTranslation } from 'react-i18next';
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
  padding: `${theme.spacing(2)} ${theme.spacing(2)}`,
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
    padding: `${theme.spacing(1)} ${theme.spacing(1)}`,
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
  t: TFunction;
};
const ActionButtons = ({
  nextTourStep,
  hideTour,
  tourStep,
  t,
}: ActionButtonsProps) => {
  return (
    <Box display={'flex'} sx={{ marginTop: theme.spacing(2) }}>
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
  const [tourTitle, setTourTitle] = React.useState<string>('');
  const [tourText, setTourText] = React.useState<string>('');
  const {
    tour,
    hideTour,
    nextTourStep,
    askedCountQuery,
    excludedCountQuery,
    committedCountQuery,
    givenCountQuery,
    receivedCountQuery,
  } = React.useContext(AppealsContext) as AppealsType;

  const { data: askedCount } = askedCountQuery;
  const { data: excludedCount } = excludedCountQuery;
  const { data: committedCount } = committedCountQuery;
  const { data: givenCount } = givenCountQuery;
  const { data: receivedCount } = receivedCountQuery;

  useEffect(() => {
    switch (tour) {
      case AppealTourEnum.Start:
        setTourTitle(t('Appeal created successfully'));
        setTourText(t('Get started by reviewing your excluded contacts list.'));
        break;
      case AppealTourEnum.ReviewExcluded:
        setTourTitle(t('Review Excluded'));
        setTourText(
          t(
            'Go through your list of excluded contacts to see if they should be asked',
          ),
        );
        break;
      case AppealTourEnum.ReviewAsked:
        setTourTitle(t('Review Asked'));
        setTourText(
          t(
            'Go through your list of contacts to ask and ensure there are no contacts that should be excluded',
          ),
        );
        break;
      case AppealTourEnum.ExportContacts:
        setTourTitle(t('Export Contacts'));
        setTourText(
          t('Export to CSV and send your appeal to reach out to your contacts'),
        );
        break;
      default:
        break;
    }
  }, [tour]);

  if (!tour) {
    return null;
  }

  return (
    <Box data-testid="appealTour">
      <Alert severity="success" onClose={hideTour}>
        <AlertTitle>
          <Typography variant="h5">{tourTitle}</Typography>
        </AlertTitle>
        <Typography variant="body1">{tourText}</Typography>

        <ActionButtons
          t={t}
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
          color={theme.palette.cruGrayDark.main}
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
