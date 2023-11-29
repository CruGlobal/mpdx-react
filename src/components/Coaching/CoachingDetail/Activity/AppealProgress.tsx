import { Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { Appeal } from '../../../../../graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat, percentageFormat } from 'src/lib/intlFormat';

const Amounts = styled('div')(({ theme }) => ({
  fontSize: '0.9em',
  paddingBottom: theme.spacing(0.5),
  textAlign: 'right',
}));

const ProcessedText = styled('span')(({ theme }) => ({
  color: theme.palette.progressBarYellow.main,
}));

const ReceivedText = styled('span')(({ theme }) => ({
  color: theme.palette.progressBarOrange.main,
}));

const CommittedText = styled('span')(({ theme }) => ({
  color: theme.palette.progressBarGray.main,
}));

const ProgressWrapper = styled('div')(({ theme }) => ({
  padding: `${theme.spacing(0.5)} ${theme.spacing(1)}`,
}));

const ProgressBar = styled('div')(({ theme }) => ({
  width: '100%',
  height: '24px',
  overflowX: 'hidden',
  textAlign: 'left',
  whiteSpace: 'nowrap',
  borderRadius: '10px',
  backgroundColor: theme.palette.cruGrayDark.main,
}));

const ProgressSegment = styled('div')({
  display: 'inline-block',
  height: '100%',
});

interface AppealProgressProps {
  appeal?: Pick<
    Appeal,
    | 'amount'
    | 'pledgesAmountNotReceivedNotProcessed'
    | 'pledgesAmountProcessed'
    | 'pledgesAmountReceivedNotProcessed'
  >;
  currency?: string;
}

export const AppealProgress: React.FC<AppealProgressProps> = ({
  appeal,
  currency,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  const processed = appeal?.pledgesAmountProcessed ?? 0;
  const received = processed + (appeal?.pledgesAmountReceivedNotProcessed ?? 0);
  const committed =
    received + (appeal?.pledgesAmountNotReceivedNotProcessed ?? 0);
  const max = appeal?.amount ?? 1;
  const processedFraction = processed / max;
  const receivedFraction = received / max;
  const committedFraction = committed / max;

  return (
    <ProgressWrapper>
      <Amounts data-testid="AppealProgressAmounts">
        <Tooltip title={t('given')} arrow>
          <ProcessedText>
            {currencyFormat(processed, currency, locale)} (
            {percentageFormat(processedFraction, locale)})
          </ProcessedText>
        </Tooltip>
        {' / '}
        <Tooltip title={t('received')} arrow>
          <ReceivedText>
            {currencyFormat(received, currency, locale)} (
            {percentageFormat(receivedFraction, locale)})
          </ReceivedText>
        </Tooltip>
        {' / '}
        <Tooltip title={t('committed')} arrow>
          <CommittedText>
            {currencyFormat(committed, currency, locale)} (
            {percentageFormat(committedFraction, locale)})
          </CommittedText>
        </Tooltip>
      </Amounts>
      <ProgressBar>
        <ProgressSegment
          data-testid="AppealProgressSegmentProcessed"
          sx={(theme) => ({
            width: `${(processedFraction * 100).toFixed(2)}%`,
            backgroundColor: theme.palette.progressBarYellow.main,
          })}
        />
        <ProgressSegment
          data-testid="AppealProgressSegmentReceived"
          sx={(theme) => ({
            width: `${(receivedFraction * 100).toFixed(2)}%`,
            backgroundColor: theme.palette.progressBarOrange.main,
          })}
        />
        <ProgressSegment
          data-testid="AppealProgressSegmentCommitted"
          sx={(theme) => ({
            width: `${(committedFraction * 100).toFixed(2)}%`,
            backgroundColor: theme.palette.progressBarGray.main,
          })}
        />
      </ProgressBar>
    </ProgressWrapper>
  );
};
