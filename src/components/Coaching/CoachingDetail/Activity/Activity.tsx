import NextLink from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import MoneyOutlined from '@mui/icons-material/MoneyOutlined';
import PeopleOutline from '@mui/icons-material/PeopleOutline';
import {
  Button,
  ButtonGroup,
  CardHeader,
  Link,
  Skeleton,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import AnimatedCard from 'src/components/AnimatedCard';
import { StyledHeader } from 'src/components/Shared/styledComponents/StyledHeader';
import {
  Appeal,
  ContactFilterSetInput,
  ContactFilterStatusEnum,
  StatusEnum,
} from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import { useLocalizedConstants } from 'src/hooks/useLocalizedConstants';
import {
  currencyFormat,
  dateFormat,
  dateFormatWithoutYear,
} from 'src/lib/intlFormat';
import { MultilineSkeleton } from '../../../Shared/MultilineSkeleton';
import { AccountListTypeEnum, CoachingPeriodEnum } from '../CoachingDetail';
import { CoachingLink } from '../CoachingLink';
import { HelpButton } from '../HelpButton';
import { useCoachingDetailActivityQuery } from './Activity.generated';
import { AppealProgress } from './AppealProgress';

const PeriodText = styled('span')({
  textAlign: 'center',
  flex: 1,
});

const StyledButton = styled(Button)({
  width: '6rem',
});

const SectionsContainer = styled('div')({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  '@media (max-width: 1500px)': {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
  '@media (max-width: 1150px)': {
    gridTemplateColumns: '1fr',
  },
});

const ActivitySection = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  height: '280px',
  paddingTop: theme.spacing(2),
  // Only apply inner borders to the grid of sections
  borderRight: `1px solid ${theme.palette.cruGrayMedium.main}`,
  borderBottom: `1px solid ${theme.palette.cruGrayMedium.main}`,
  '@media (max-width: 1150px)': {
    // One column
    ':nth-of-type(n + 6)': {
      borderBottom: 'unset',
    },
    borderRight: 'unset',
  },
  '@media (min-width: 1151px) and (max-width: 1500px)': {
    // Two columns
    ':nth-of-type(n + 5)': {
      borderBottom: 'unset',
    },
    ':nth-of-type(2n)': {
      borderRight: 'unset',
    },
  },
  '@media (min-width: 1501px)': {
    // Three columns
    ':nth-of-type(n + 4)': {
      borderBottom: 'unset',
    },
    ':nth-of-type(3n)': {
      borderRight: 'unset',
    },
  },
}));

const SectionTitle = styled(Typography)({
  fontWeight: 'bold',
  flex: 1,
});

const SectionTitleNumber = styled(Typography)({
  fontWeight: 'bold',
  flex: 1,
  fontSize: '2rem',
});

const StatsLargeNumber = styled(Typography)({
  fontWeight: 'bold',
  fontSize: '6rem',
  lineHeight: '1.167',
  marginTop: '35px',
});

const StatsRow = styled('div')(({ theme }) => ({
  display: 'flex',
  width: '100%',
  maxHeight: '88px',
  ':nth-of-type(2)': {
    backgroundColor: theme.palette.cruGrayLight.main,
  },
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
  textAlign: 'center',
}));

const StatsColumn = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  flex: 1,
  padding: theme.spacing(0.5),
  borderLeft: `1px solid ${theme.palette.cruGrayMedium.main}`,
  ':first-of-type': {
    borderLeft: 'none',
  },
}));

const StatsColumnTitle = styled(Typography)({
  fontWeight: 'bold',
  fontSize: '0.9em',
});

const StatsText = styled(Typography)({
  fontSize: '0.9em',
});

interface ActivityProps {
  accountListId: string;
  accountListType: AccountListTypeEnum;
  period: CoachingPeriodEnum;
  currency?: string;
  primaryAppeal?: Pick<
    Appeal,
    | 'id'
    | 'name'
    | 'amount'
    | 'pledgesAmountNotReceivedNotProcessed'
    | 'pledgesAmountProcessed'
    | 'pledgesAmountReceivedNotProcessed'
  >;
}

export const Activity: React.FC<ActivityProps> = ({
  accountListId,
  accountListType,
  period,
  currency,
  primaryAppeal,
}) => {
  const { t } = useTranslation();
  const { getLocalizedContactStatus } = useLocalizedConstants();
  const locale = useLocale();

  const periodDuration =
    period === CoachingPeriodEnum.Weekly ? { weeks: 1 } : { months: 1 };
  const startDate = useMemo((): DateTime => {
    // The default startOf('week') is Monday. Subtract 1 day to start the week on Sunday.
    if (period === CoachingPeriodEnum.Weekly) {
      return DateTime.now().startOf('week').minus({ day: 1 });
    }
    return DateTime.now().startOf('month');
  }, [period]);
  const [start, setStart] = useState(startDate);
  const end = useMemo(
    () =>
      period === CoachingPeriodEnum.Weekly
        ? start.plus({ days: 6 }).endOf('day')
        : start.endOf('month'),
    [start, period],
  );

  useEffect(() => {
    setStart(startDate);
  }, [startDate]);

  const { data, loading } = useCoachingDetailActivityQuery({
    variables: {
      accountListId,
      dateRange: `${start.toISODate()}..${end.toISODate()}`,
    },
  });

  const formattedDate = useMemo(() => {
    const format =
      start.year === DateTime.now().year ? dateFormatWithoutYear : dateFormat;
    return `${format(start, locale)} - ${format(end, locale)}`;
  }, [start, end, locale]);

  const contactsLink = (filter: ContactFilterSetInput) =>
    `/accountLists/${accountListId}/contacts?filters=${encodeURIComponent(
      JSON.stringify(filter),
    )}`;

  return (
    <AnimatedCard>
      <CardHeader
        title={
          <StyledHeader variant="h6">
            <span>{t('Current Reality')}</span>
            <PeriodText data-testid="ActivityPeriod">
              {formattedDate}
            </PeriodText>
            <ButtonGroup>
              <StyledButton
                onClick={() => setStart(start.minus(periodDuration))}
              >
                <ChevronLeft />
                {t('Previous')}
              </StyledButton>
              <StyledButton
                onClick={() => setStart(start.plus(periodDuration))}
                disabled={end > DateTime.now()}
              >
                {t('Next')}
                <ChevronRight />
              </StyledButton>
            </ButtonGroup>
            <HelpButton articleVar="HELP_URL_COACHING_ACTIVITY" />
          </StyledHeader>
        }
      />
      <SectionsContainer>
        <ActivitySection data-testid="CurrentRealityConnections">
          <PeopleOutline sx={{ fontSize: '6rem' }} />
          <SectionTitle>{t('Connections Remaining')}</SectionTitle>
          <SectionTitleNumber>
            <CoachingLink
              href={contactsLink({
                status: [
                  ContactFilterStatusEnum.NeverContacted,
                  ContactFilterStatusEnum.AskInFuture,
                  ContactFilterStatusEnum.CultivateRelationship,
                ],
              })}
              accountListType={accountListType}
            >
              <StatsText sx={{ fontWeight: 'bold' }}>
                {
                  data?.accountListAnalytics.contactsByStatus
                    .connectionsRemaining
                }
              </StatsText>
            </CoachingLink>
          </SectionTitleNumber>
          {loading ? (
            <MultilineSkeleton lines={2} width="90%" />
          ) : (
            <StatsRow>
              <StatsColumn>
                <CoachingLink
                  href={contactsLink({
                    status: [
                      ContactFilterStatusEnum.Null,
                      ContactFilterStatusEnum.NeverContacted,
                    ],
                  })}
                  accountListType={accountListType}
                >
                  <StatsText>
                    {data?.accountListAnalytics.contactsByStatus.neverContacted}
                  </StatsText>
                  <StatsColumnTitle>
                    {getLocalizedContactStatus(StatusEnum.NeverContacted)}
                  </StatsColumnTitle>
                </CoachingLink>
              </StatsColumn>
              <StatsColumn>
                <CoachingLink
                  href={contactsLink({
                    status: [ContactFilterStatusEnum.AskInFuture],
                  })}
                  accountListType={accountListType}
                >
                  <StatsText>
                    {data?.accountListAnalytics.contactsByStatus.future}
                  </StatsText>
                  <StatsColumnTitle>
                    {getLocalizedContactStatus(StatusEnum.AskInFuture)}
                  </StatsColumnTitle>
                </CoachingLink>
              </StatsColumn>
              <StatsColumn>
                <CoachingLink
                  href={contactsLink({
                    status: [ContactFilterStatusEnum.CultivateRelationship],
                  })}
                  accountListType={accountListType}
                >
                  <StatsText>
                    {data?.accountListAnalytics.contactsByStatus.cultivate}
                  </StatsText>
                  <StatsColumnTitle>
                    {getLocalizedContactStatus(
                      StatusEnum.CultivateRelationship,
                    )}
                  </StatsColumnTitle>
                </CoachingLink>
              </StatsColumn>
            </StatsRow>
          )}
        </ActivitySection>
        <ActivitySection data-testid="CurrentRealityPartnerInitiations">
          <CalendarMonthOutlined sx={{ fontSize: '6rem' }} />
          <SectionTitle>{t('Partners Currently Initiating With')}</SectionTitle>
          <SectionTitleNumber>
            <CoachingLink
              href={contactsLink({
                status: [
                  ContactFilterStatusEnum.ContactForAppointment,
                  ContactFilterStatusEnum.AppointmentScheduled,
                  ContactFilterStatusEnum.CallForDecision,
                ],
              })}
              accountListType={accountListType}
            >
              <StatsText sx={{ fontWeight: 'bold' }}>
                {data?.accountListAnalytics.contactsByStatus.initiations}
              </StatsText>
            </CoachingLink>
          </SectionTitleNumber>
          {loading ? (
            <MultilineSkeleton lines={2} width="90%" />
          ) : (
            <StatsRow>
              <StatsColumn>
                <CoachingLink
                  href={contactsLink({
                    status: [ContactFilterStatusEnum.ContactForAppointment],
                  })}
                  accountListType={accountListType}
                >
                  <StatsText>
                    {
                      data?.accountListAnalytics.contactsByStatus
                        .contactForAppointment
                    }
                  </StatsText>
                  <StatsColumnTitle>
                    {getLocalizedContactStatus(
                      StatusEnum.ContactForAppointment,
                    )}
                  </StatsColumnTitle>
                </CoachingLink>
              </StatsColumn>
              <StatsColumn>
                <CoachingLink
                  href={contactsLink({
                    status: [ContactFilterStatusEnum.AppointmentScheduled],
                  })}
                  accountListType={accountListType}
                >
                  <StatsText>
                    {
                      data?.accountListAnalytics.contactsByStatus
                        .appointmentScheduled
                    }
                  </StatsText>
                  <StatsColumnTitle>
                    {getLocalizedContactStatus(StatusEnum.AppointmentScheduled)}
                  </StatsColumnTitle>
                </CoachingLink>
              </StatsColumn>
              <StatsColumn>
                <CoachingLink
                  href={contactsLink({
                    status: [ContactFilterStatusEnum.CallForDecision],
                  })}
                  accountListType={accountListType}
                >
                  <StatsText>
                    {
                      data?.accountListAnalytics.contactsByStatus
                        .callForDecision
                    }
                  </StatsText>
                  <StatsColumnTitle>
                    {getLocalizedContactStatus(StatusEnum.CallForDecision)}
                  </StatsColumnTitle>
                </CoachingLink>
              </StatsColumn>
            </StatsRow>
          )}
        </ActivitySection>
        <ActivitySection data-testid="ActivitySectionAppeal">
          <MoneyOutlined sx={{ fontSize: '6rem' }} />
          <SectionTitle>
            {accountListType === AccountListTypeEnum.Own ? (
              <Link
                component={NextLink}
                href={
                  primaryAppeal
                    ? `/accountLists/${accountListId}/tools/appeals/appeal/${primaryAppeal.id}`
                    : `/accountLists/${accountListId}/tools/appeals`
                }
                underline="none"
              >
                {t('Primary Appeal')}
              </Link>
            ) : (
              t('Primary Appeal')
            )}
          </SectionTitle>
          {loading ? (
            <MultilineSkeleton lines={2} width="90%" />
          ) : (
            <>
              <StatsRow>
                {primaryAppeal ? (
                  <StatsColumn>
                    <StatsText>
                      {currencyFormat(
                        primaryAppeal.pledgesAmountProcessed,
                        currency,
                        locale,
                      )}
                      {' / '}
                      {currencyFormat(
                        primaryAppeal.amount ?? 0,
                        currency,
                        locale,
                      )}
                    </StatsText>
                    <StatsColumnTitle>
                      {accountListType === AccountListTypeEnum.Own ? (
                        <Link
                          component={NextLink}
                          href={`/accountLists/${accountListId}/tools/appeals/appeal/${primaryAppeal.id}`}
                          underline="none"
                        >
                          {primaryAppeal.name}
                        </Link>
                      ) : (
                        primaryAppeal.name
                      )}
                    </StatsColumnTitle>
                  </StatsColumn>
                ) : (
                  <StatsColumn>{t('No Primary Appeal Set')}</StatsColumn>
                )}
              </StatsRow>
              <StatsRow sx={{ display: 'block' }}>
                <AppealProgress appeal={primaryAppeal} currency={currency} />
              </StatsRow>
            </>
          )}
        </ActivitySection>
        <ActivitySection data-testid="CurrentRealityPartnerFinancial">
          {loading ? (
            <Skeleton width="147px" height="147px" />
          ) : (
            <StatsLargeNumber>
              {data?.accountListAnalytics.contactsByStatus.financial}
            </StatsLargeNumber>
          )}
          <CoachingLink
            href={contactsLink({
              status: [ContactFilterStatusEnum.PartnerFinancial],
            })}
            accountListType={accountListType}
          >
            <SectionTitle>{t('Financial Partners')}</SectionTitle>
          </CoachingLink>
        </ActivitySection>
        <ActivitySection data-testid="CurrentRealityPartnerSpecial">
          {loading ? (
            <Skeleton width="147px" height="147px" />
          ) : (
            <StatsLargeNumber>
              {data?.accountListAnalytics.contactsByStatus.special}
            </StatsLargeNumber>
          )}
          <CoachingLink
            href={contactsLink({
              status: [ContactFilterStatusEnum.PartnerSpecial],
            })}
            accountListType={accountListType}
          >
            <SectionTitle>{t('Special Gift Partners')}</SectionTitle>
          </CoachingLink>
        </ActivitySection>
        <ActivitySection data-testid="CurrentRealityPartnerPrayer">
          {loading ? (
            <Skeleton width="147px" height="147px" />
          ) : (
            <StatsLargeNumber>
              {data?.accountListAnalytics.contactsByStatus.prayer}
            </StatsLargeNumber>
          )}
          <CoachingLink
            href={contactsLink({
              status: [ContactFilterStatusEnum.PartnerPray],
            })}
            accountListType={accountListType}
          >
            <SectionTitle>{t('Prayer Partners')}</SectionTitle>
          </CoachingLink>
        </ActivitySection>
      </SectionsContainer>
    </AnimatedCard>
  );
};
