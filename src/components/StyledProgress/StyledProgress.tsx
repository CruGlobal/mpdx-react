import React, { ReactElement } from 'react';
import { Box, Skeleton, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { percentageFormat } from '../../lib/intlFormat';
import MinimalSpacingTooltip from '../Shared/MinimalSpacingTooltip';

const ProgressBoxContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'barHeight',
})<{ barHeight: number }>(({ barHeight, theme }) => ({
  width: '100%',
  height: barHeight + 8,
  border: '2px solid #999999',
  borderRadius: '50px',
  padding: '2px',
  position: 'relative',
  marginBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
}));

const ProgressBar = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'barHeight' && prop !== 'isPrimary',
})<{ barHeight: number; isPrimary: boolean }>(({ barHeight, isPrimary }) => ({
  position: 'absolute',
  left: '2px',
  height: barHeight,
  minWidth: barHeight,
  maxWidth: '99.6%',
  borderRadius: barHeight,
  transition: 'width 1s ease-out',
  width: '0%',
  background: isPrimary
    ? 'linear-gradient(180deg, #FFE67C 0%, #FFCF07 100%)'
    : 'initial',
  border: isPrimary ? 'none' : '5px solid #FFCF07',
}));

const StyledSkeleton = styled(Skeleton, {
  shouldForwardProp: (prop) => prop !== 'barHeight',
})<{ barHeight: number }>(({ barHeight }) => ({
  borderRadius: barHeight,
  height: barHeight,
  transform: 'none',
}));

const InlineTypography = styled(Typography)(() => ({
  display: 'inline',
}));

const BelowDetailsBox = styled(Box)(() => ({
  position: 'absolute',
  right: '5px',
}));

interface Props {
  loading?: boolean;
  primary?: number;
  secondary?: number;
  receivedBelow?: string;
  committedBelow?: string;
  barHeight?: number;
}

const StyledProgress = ({
  loading,
  primary = 0,
  secondary = 0,
  receivedBelow = '',
  committedBelow = '',
  barHeight = 46,
}: Props): ReactElement => {
  const locale = useLocale();
  const { t } = useTranslation();
  return (
    <ProgressBoxContainer barHeight={barHeight}>
      {loading ? (
        <StyledSkeleton
          data-testid="styledProgressLoading"
          barHeight={barHeight}
          animation="wave"
        />
      ) : (
        <>
          <ProgressBar
            style={{
              width: `calc(${percentageFormat(secondary, locale).replace(
                '\xa0',
                '',
              )} - 4px)`,
            }}
            isPrimary={false}
            barHeight={barHeight}
            data-testid="styledProgressSecondary"
          />
          <ProgressBar
            style={{
              width: `calc(${percentageFormat(primary, locale).replace(
                '\xa0',
                '',
              )} - 4px)`,
            }}
            isPrimary={true}
            barHeight={barHeight}
            data-testid="styledProgressPrimary"
          />
        </>
      )}
      <BelowDetailsBox>
        {receivedBelow && (
          <MinimalSpacingTooltip title={t('Received Below Goal')} arrow>
            <InlineTypography>{receivedBelow}</InlineTypography>
          </MinimalSpacingTooltip>
        )}
        {committedBelow && receivedBelow && (
          <InlineTypography>{' / '}</InlineTypography>
        )}
        {committedBelow && (
          <MinimalSpacingTooltip title={t('Committed Below Goal')} arrow>
            <InlineTypography>{committedBelow}</InlineTypography>
          </MinimalSpacingTooltip>
        )}
      </BelowDetailsBox>
    </ProgressBoxContainer>
  );
};

export default StyledProgress;
