import {
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import AnimatedCard from 'src/components/AnimatedCard';
import { MultilineSkeleton } from 'src/components/Shared/MultilineSkeleton';
import { ReportsTagHistoriesAssociationEnum } from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import { dateFormatWithoutYear } from 'src/lib/intlFormat';
import { CoachingPeriodEnum } from '../CoachingDetail';
import { useTagsSummaryQuery } from './TagsSummary.generated';

const ContentContainer = styled('div')(({ theme }) => ({
  padding: theme.spacing(2),
  overflowX: 'scroll',
}));

const StyledTable = styled(Table)(({ theme }) => ({
  'tr:last-child td': {
    paddingBottom: theme.spacing(2),
  },
  'th, td': {
    borderBottom: 'none',
    borderRight: `1px solid ${theme.palette.divider}`,
  },
  'th:last-child, td:last-child': {
    borderRight: 'none',
  },
}));

const TagText = styled('span')(({ theme }) => ({
  fontWeight: 'bold',
  backgroundColor: theme.palette.cruGrayLight.main,
  borderRadius: theme.spacing(1),
  padding: theme.spacing(0.25, 1),
}));

interface TagsSummaryProps {
  accountListId: string;
  period: CoachingPeriodEnum;
  association: ReportsTagHistoriesAssociationEnum;
}

export const TagsSummary: React.FC<TagsSummaryProps> = ({
  accountListId,
  period,
  association,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  const { data, loading } = useTagsSummaryQuery({
    variables: {
      accountListId,
      range: period === CoachingPeriodEnum.Weekly ? '6w' : '6m',
      association,
    },
  });
  const periods = data?.reportsTagHistories.periods ?? [];

  return (
    <AnimatedCard>
      <CardHeader
        title={
          association === ReportsTagHistoriesAssociationEnum.Contacts
            ? t('Contact Tags')
            : t('Task Tags')
        }
      />
      {periods[0]?.tags.length === 0 ? (
        <ContentContainer>
          {t('No tags added in last 6 {{period}}.', {
            period:
              period === CoachingPeriodEnum.Weekly ? t('weeks') : t('months'),
          })}
        </ContentContainer>
      ) : (
        <ContentContainer style={{ padding: 0 }}>
          {loading ? (
            <MultilineSkeleton lines={4} />
          ) : (
            <TableContainer sx={{ minWidth: 600 }}>
              <StyledTable
                size="small"
                aria-label={
                  association === ReportsTagHistoriesAssociationEnum.Contacts
                    ? t('contact tags summary table')
                    : t('task tags summary table')
                }
              >
                <TableHead>
                  <TableRow>
                    <TableCell>{t('Tag Name')}</TableCell>
                    {periods.slice(0, -1).map(({ endDate }) => (
                      <TableCell key={endDate}>
                        {dateFormatWithoutYear(
                          DateTime.fromISO(endDate),
                          locale,
                        )}
                      </TableCell>
                    ))}
                    <TableCell>{t('Total')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {periods[0].tags.map((tag) => (
                    <TableRow key={tag.id}>
                      <TableCell>
                        <TagText>{tag.name}</TagText>
                      </TableCell>
                      {periods.map((period) => (
                        <TableCell
                          key={`${period.startDate}..${period.endDate}`}
                        >
                          {period.tags.find(({ id }) => id === tag.id)?.count}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </StyledTable>
            </TableContainer>
          )}
        </ContentContainer>
      )}
    </AnimatedCard>
  );
};
