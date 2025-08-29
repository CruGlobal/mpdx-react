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
import { TagChip } from 'src/components/Shared/TagChip/TagChip';
import { ReportsTagHistoriesAssociationEnum } from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import { dateFormatMonthOnly, dateFormatWithoutYear } from 'src/lib/intlFormat';
import { CoachingPeriodEnum } from '../CoachingDetail';
import { ContentContainer } from '../styledComponents/styledComponents';
import { useTagsSummaryQuery } from './TagsSummary.generated';

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
  const noTags = periods[0]?.tags.length === 0;

  return (
    <AnimatedCard>
      <CardHeader
        title={
          association === ReportsTagHistoriesAssociationEnum.Contacts
            ? t('Contact Tags')
            : t('Task Tags')
        }
      />
      <ContentContainer style={{ padding: noTags ? undefined : 0 }}>
        {noTags &&
          t('No tags added in last 6 {{period}}.', {
            period:
              period === CoachingPeriodEnum.Weekly ? t('weeks') : t('months'),
          })}
        {!noTags && loading && <MultilineSkeleton lines={4} />}
        {!noTags && !loading && (
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
                  {periods.slice(0, -1).map(({ startDate }) => (
                    <TableCell key={startDate}>
                      {period === CoachingPeriodEnum.Weekly
                        ? dateFormatWithoutYear(
                            DateTime.fromISO(startDate),
                            locale,
                          )
                        : dateFormatMonthOnly(
                            DateTime.fromISO(startDate),
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
                      <TagChip label={tag.name} selectType="none" />
                    </TableCell>
                    {periods.map((period) => (
                      <TableCell key={`${period.startDate}..${period.endDate}`}>
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
    </AnimatedCard>
  );
};
