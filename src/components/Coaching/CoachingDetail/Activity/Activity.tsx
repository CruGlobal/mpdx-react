import NextLink from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined';
import ChatBubbleOutline from '@mui/icons-material/ChatBubbleOutline';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import MailOutline from '@mui/icons-material/MailOutline';
import MoneyOutlined from '@mui/icons-material/MoneyOutlined';
import PeopleOutline from '@mui/icons-material/PeopleOutline';
import SmartphoneOutlined from '@mui/icons-material/SmartphoneOutlined';
import {
  Button,
  ButtonGroup,
  CardHeader,
  Link as MuiLink,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { DateTime, DateTimeUnit } from 'luxon';
import { useTranslation } from 'react-i18next';
import AnimatedCard from 'src/components/AnimatedCard';
import HandoffLink from 'src/components/HandoffLink';
import {
  ActivityTypeEnum,
  Appeal,
  ContactFilterSetInput,
  ContactFilterStatusEnum,
  ResultEnum,
  TaskFilterSetInput,
} from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import {
  currencyFormat,
  dateFormat,
  dateFormatWithoutYear,
} from 'src/lib/intlFormat';
import {
  callActivityTypes,
  electronicActivityTypes,
} from 'src/utils/phases/taskActivityTypes';
import { MultilineSkeleton } from '../../../Shared/MultilineSkeleton';
import { AccountListTypeEnum, CoachingPeriodEnum } from '../CoachingDetail';
import { HelpButton } from '../HelpButton';
import { useCoachingDetailActivityQuery } from './Activity.generated';
import { AppealProgress } from './AppealProgress';

const Header = styled(Typography)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  '@media (max-width: 900px)': {
    flexDirection: 'column',
    alignItems: 'center',
  },
}));

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

const StatsRow = styled('div')(({ theme }) => ({
  display: 'flex',
  width: '100%',
  height: '68px',
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

interface LinkProps {
  accountListType: AccountListTypeEnum;
  children: React.ReactNode;
  href: string;
}

const Link: React.FC<LinkProps> = ({ accountListType, children, href }) =>
  // Only show links when the account list belongs to the user
  accountListType === AccountListTypeEnum.Own ? (
    <NextLink href={href} passHref>
      <MuiLink underline="none">{children}</MuiLink>
    </NextLink>
  ) : (
    <span>{children}</span>
  );

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
  const locale = useLocale();

  const periodUnit: DateTimeUnit =
    period === CoachingPeriodEnum.Weekly ? 'week' : 'month';
  const periodDuration =
    period === CoachingPeriodEnum.Weekly ? { weeks: 1 } : { months: 1 };
  const [start, setStart] = useState(DateTime.now().startOf(periodUnit));
  const end = useMemo(() => start.endOf(periodUnit), [start, periodUnit]);

  useEffect(() => {
    setStart(DateTime.now().startOf(periodUnit));
  }, [periodUnit]);

  const { data, loading } = useCoachingDetailActivityQuery({
    variables: {
      accountListId,
      dateRange: `${start.toISODate()}..${start.endOf(periodUnit).toISODate()}`,
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

  const tasksLink = (filter: TaskFilterSetInput) =>
    `/accountLists/${accountListId}/tasks?filters=${encodeURIComponent(
      JSON.stringify(filter),
    )}`;

  const taskBaseFilter: TaskFilterSetInput = {
    completedAt: {
      min: start.toISODate(),
      max: end.toISODate(),
    },
    completed: true,
  };
  const taskCallFilter: TaskFilterSetInput = {
    ...taskBaseFilter,
    activityType: callActivityTypes,
  };
  const taskElectronicFilter: TaskFilterSetInput = {
    ...taskBaseFilter,
    activityType: electronicActivityTypes,
  };

  return (
    <AnimatedCard>
      <CardHeader
        title={
          <Header variant="h6">
            <span>{t('Activity')}</span>
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
            <HelpButton articleVar="HS_COACHING_ACTIVITY" />
          </Header>
        }
      />
      <SectionsContainer>
        <ActivitySection data-testid="ActivitySectionContacts">
          <PeopleOutline sx={{ fontSize: '6rem' }} />
          <SectionTitle>{t('Contacts')}</SectionTitle>
          {loading ? (
            <MultilineSkeleton lines={2} width="90%" />
          ) : (
            <StatsRow>
              <StatsColumn>
                <Link
                  href={contactsLink({
                    status: [
                      ContactFilterStatusEnum.ContactForAppointment,
                      ContactFilterStatusEnum.NeverContacted,
                    ],
                  })}
                  accountListType={accountListType}
                >
                  <StatsText>
                    {data?.accountListAnalytics.contacts.active}
                  </StatsText>
                  <StatsColumnTitle>{t('Active')}</StatsColumnTitle>
                </Link>
              </StatsColumn>
              <StatsColumn>
                <Link
                  href={contactsLink({
                    status: [
                      ContactFilterStatusEnum.AskInFuture,
                      ContactFilterStatusEnum.ContactForAppointment,
                      ContactFilterStatusEnum.CultivateRelationship,
                      ContactFilterStatusEnum.NeverContacted,
                      ContactFilterStatusEnum.Null,
                    ],
                  })}
                  accountListType={accountListType}
                >
                  <StatsText>
                    {data?.accountListAnalytics.contacts.referralsOnHand}
                  </StatsText>
                  <StatsColumnTitle>{t('Referrals On-hand')}</StatsColumnTitle>
                </Link>
              </StatsColumn>
              <StatsColumn>
                <StatsText>
                  {data?.accountListAnalytics.contacts.referrals}
                </StatsText>
                <StatsColumnTitle>{t('Referrals Gained')}</StatsColumnTitle>
              </StatsColumn>
            </StatsRow>
          )}
        </ActivitySection>
        <ActivitySection data-testid="ActivitySectionAppointments">
          <CalendarMonthOutlined sx={{ fontSize: '6rem' }} />
          <SectionTitle>{t('Appointments')}</SectionTitle>
          {loading ? (
            <MultilineSkeleton lines={2} width="90%" />
          ) : (
            <StatsRow>
              <StatsColumn>
                <Link
                  href={tasksLink({
                    ...taskBaseFilter,
                    activityType: [
                      ActivityTypeEnum.AppointmentInPerson,
                      ActivityTypeEnum.AppointmentPhoneCall,
                      ActivityTypeEnum.AppointmentVideoCall,
                    ],
                  })}
                  accountListType={accountListType}
                >
                  <StatsText>
                    {data?.accountListAnalytics.appointments.completed}
                  </StatsText>
                  <StatsColumnTitle>{t('Completed')}</StatsColumnTitle>
                </Link>
              </StatsColumn>
            </StatsRow>
          )}
        </ActivitySection>
        <ActivitySection data-testid="ActivitySectionCorrespondence">
          <MailOutline sx={{ fontSize: '6rem' }} />
          <SectionTitle>{t('Correspondence')}</SectionTitle>
          {loading ? (
            <MultilineSkeleton lines={2} width="90%" />
          ) : (
            <>
              <StatsRow>
                <StatsColumn>
                  <Link
                    href={tasksLink({
                      ...taskBaseFilter,
                      activityType: [ActivityTypeEnum.InitiationLetter],
                    })}
                    accountListType={accountListType}
                  >
                    <StatsText>
                      {data?.accountListAnalytics.correspondence.precall}
                    </StatsText>
                    <StatsColumnTitle>{t('Pre-call')}</StatsColumnTitle>
                  </Link>
                </StatsColumn>
                <StatsColumn>
                  <Link
                    href={tasksLink({
                      ...taskBaseFilter,
                      activityType: [
                        ActivityTypeEnum.InitiationSpecialGiftAppeal,
                      ],
                    })}
                    accountListType={accountListType}
                  >
                    <StatsText>
                      {data?.accountListAnalytics.correspondence.supportLetters}
                    </StatsText>
                    <StatsColumnTitle>{t('Support')}</StatsColumnTitle>
                  </Link>
                </StatsColumn>
              </StatsRow>
              <StatsRow>
                <StatsColumn>
                  <Link
                    href={tasksLink({
                      ...taskBaseFilter,
                      activityType: [ActivityTypeEnum.PartnerCareThank],
                    })}
                    accountListType={accountListType}
                  >
                    <StatsText>
                      {data?.accountListAnalytics.correspondence.thankYous}
                    </StatsText>
                    <StatsColumnTitle>{t('Thank You')}</StatsColumnTitle>
                  </Link>
                </StatsColumn>
                <StatsColumn>
                  <Link
                    href={tasksLink({
                      ...taskBaseFilter,
                      activityType: [
                        ActivityTypeEnum.InitiationSpecialGiftAppeal,
                      ],
                    })}
                    accountListType={accountListType}
                  >
                    <StatsText>
                      {data?.accountListAnalytics.correspondence.reminders}
                    </StatsText>
                    <StatsColumnTitle>{t('Reminder')}</StatsColumnTitle>
                  </Link>
                </StatsColumn>
              </StatsRow>
            </>
          )}
        </ActivitySection>
        <ActivitySection data-testid="ActivitySectionPhone">
          <SmartphoneOutlined sx={{ fontSize: '6rem' }} />
          <SectionTitle>{t('Phone Calls')}</SectionTitle>
          {loading ? (
            <MultilineSkeleton lines={2} width="90%" />
          ) : (
            <>
              <StatsRow>
                <StatsColumn>
                  <Link
                    href={tasksLink({
                      ...taskCallFilter,
                      result: [
                        ResultEnum.Attempted,
                        ResultEnum.AttemptedLeftMessage,
                        ResultEnum.Completed,
                        ResultEnum.Done,
                      ],
                    })}
                    accountListType={accountListType}
                  >
                    <StatsText>
                      {data &&
                        data.accountListAnalytics.phone.attempted +
                          data.accountListAnalytics.phone.completed}
                    </StatsText>
                    <StatsColumnTitle>{t('Outgoing')}</StatsColumnTitle>
                  </Link>
                </StatsColumn>
                <StatsColumn>
                  <Link
                    href={tasksLink({
                      ...taskCallFilter,
                      result: [
                        ResultEnum.Received,
                        ResultEnum.Completed,
                        ResultEnum.Done,
                      ],
                    })}
                    accountListType={accountListType}
                  >
                    <StatsText>
                      {data &&
                        data.accountListAnalytics.phone.completed +
                          data.accountListAnalytics.phone.received}
                    </StatsText>
                    <StatsColumnTitle>{t('Talked To')}</StatsColumnTitle>
                  </Link>
                </StatsColumn>
                <StatsColumn>
                  <Link
                    href={tasksLink({
                      ...taskBaseFilter,
                      activityType: [
                        ActivityTypeEnum.InitiationPhoneCall,
                        ActivityTypeEnum.InitiationInPerson,
                      ],
                      nextAction: [
                        ActivityTypeEnum.AppointmentInPerson,
                        ActivityTypeEnum.AppointmentPhoneCall,
                        ActivityTypeEnum.AppointmentVideoCall,
                      ],
                    })}
                    accountListType={accountListType}
                  >
                    <StatsText>
                      {data?.accountListAnalytics.phone.appointments}
                    </StatsText>
                    <StatsColumnTitle>{t('Appts Produced')}</StatsColumnTitle>
                  </Link>
                </StatsColumn>
              </StatsRow>
              <StatsRow>
                <StatsColumn>
                  <Link
                    href={tasksLink({
                      ...taskCallFilter,
                      result: [ResultEnum.Completed, ResultEnum.Done],
                    })}
                    accountListType={accountListType}
                  >
                    <StatsText>
                      {data?.accountListAnalytics.phone.completed}
                    </StatsText>
                    <StatsColumnTitle>{t('Completed')}</StatsColumnTitle>
                  </Link>
                </StatsColumn>
                <StatsColumn>
                  <Link
                    href={tasksLink({
                      ...taskCallFilter,
                      result: [
                        ResultEnum.Attempted,
                        ResultEnum.AttemptedLeftMessage,
                      ],
                    })}
                    accountListType={accountListType}
                  >
                    <StatsText>
                      {data?.accountListAnalytics.phone.attempted}
                    </StatsText>
                    <StatsColumnTitle>{t('Attempted')}</StatsColumnTitle>
                  </Link>
                </StatsColumn>
                <StatsColumn>
                  <Link
                    href={tasksLink({
                      ...taskCallFilter,
                      result: [ResultEnum.Received],
                    })}
                    accountListType={accountListType}
                  >
                    <StatsText>
                      {data?.accountListAnalytics.phone.received}
                    </StatsText>
                    <StatsColumnTitle>{t('Received')}</StatsColumnTitle>
                  </Link>
                </StatsColumn>
              </StatsRow>
            </>
          )}
        </ActivitySection>
        <ActivitySection data-testid="ActivitySectionElectronic">
          <ChatBubbleOutline sx={{ fontSize: '6rem' }} />
          <SectionTitle>{t('Electronic Messages')}</SectionTitle>
          {loading ? (
            <MultilineSkeleton lines={2} width="90%" />
          ) : (
            <>
              <StatsRow>
                <StatsColumn>
                  <Link
                    href={tasksLink({
                      ...taskElectronicFilter,
                      result: [ResultEnum.Completed, ResultEnum.Done],
                    })}
                    accountListType={accountListType}
                  >
                    <StatsText>
                      {data?.accountListAnalytics.electronic.sent}
                    </StatsText>
                    <StatsColumnTitle>{t('Sent')}</StatsColumnTitle>
                  </Link>
                </StatsColumn>
                <StatsColumn>
                  <Link
                    href={tasksLink({
                      ...taskElectronicFilter,
                      result: [ResultEnum.Received],
                    })}
                    accountListType={accountListType}
                  >
                    <StatsText>
                      {data?.accountListAnalytics.electronic.received}
                    </StatsText>
                    <StatsColumnTitle>{t('Received')}</StatsColumnTitle>
                  </Link>
                </StatsColumn>
                <StatsColumn>
                  <Link
                    href={tasksLink({
                      ...taskElectronicFilter,
                      nextAction: [
                        ActivityTypeEnum.AppointmentInPerson,
                        ActivityTypeEnum.AppointmentPhoneCall,
                        ActivityTypeEnum.AppointmentVideoCall,
                      ],
                    })}
                    accountListType={accountListType}
                  >
                    <StatsText>
                      {data?.accountListAnalytics.electronic.appointments}
                    </StatsText>
                    <StatsColumnTitle>{t('Appts Produced')}</StatsColumnTitle>
                  </Link>
                </StatsColumn>
              </StatsRow>
              <StatsRow>
                <StatsColumn>
                  <StatsText>
                    <Link
                      href={tasksLink({
                        ...taskBaseFilter,
                        activityType: [
                          ActivityTypeEnum.InitiationEmail,
                          ActivityTypeEnum.FollowUpEmail,
                          ActivityTypeEnum.PartnerCareEmail,
                        ],
                        result: [ResultEnum.Completed, ResultEnum.Done],
                      })}
                      accountListType={accountListType}
                    >
                      {data?.accountListAnalytics.email.sent} {t('Sent')}
                    </Link>
                    {' / '}
                    <Link
                      href={tasksLink({
                        ...taskBaseFilter,
                        activityType: [
                          ActivityTypeEnum.InitiationEmail,
                          ActivityTypeEnum.FollowUpEmail,
                          ActivityTypeEnum.PartnerCareEmail,
                        ],
                        result: [ResultEnum.Received],
                      })}
                      accountListType={accountListType}
                    >
                      {data?.accountListAnalytics.email.received}{' '}
                      {t('Received')}
                    </Link>
                  </StatsText>
                  <StatsColumnTitle>{t('Email')}</StatsColumnTitle>
                </StatsColumn>
                <StatsColumn>
                  <StatsText>
                    <Link
                      href={tasksLink({
                        ...taskBaseFilter,
                        activityType: [
                          ActivityTypeEnum.InitiationSocialMedia,
                          ActivityTypeEnum.FollowUpSocialMedia,
                          ActivityTypeEnum.PartnerCareSocialMedia,
                        ],
                        result: [ResultEnum.Completed, ResultEnum.Done],
                      })}
                      accountListType={accountListType}
                    >
                      {data?.accountListAnalytics.facebook.sent} {t('Sent')}
                    </Link>
                    {' / '}
                    <Link
                      href={tasksLink({
                        ...taskBaseFilter,
                        activityType: [
                          ActivityTypeEnum.InitiationSocialMedia,
                          ActivityTypeEnum.FollowUpSocialMedia,
                          ActivityTypeEnum.PartnerCareSocialMedia,
                        ],
                        result: [ResultEnum.Received],
                      })}
                      accountListType={accountListType}
                    >
                      {data?.accountListAnalytics.facebook.received}{' '}
                      {t('Received')}
                    </Link>
                  </StatsText>
                  <StatsColumnTitle>{t('Facebook')}</StatsColumnTitle>
                </StatsColumn>
                <StatsColumn>
                  <StatsText>
                    <Link
                      href={tasksLink({
                        ...taskBaseFilter,
                        activityType: [
                          ActivityTypeEnum.InitiationTextMessage,
                          ActivityTypeEnum.FollowUpTextMessage,
                          ActivityTypeEnum.PartnerCareTextMessage,
                        ],
                        result: [ResultEnum.Completed, ResultEnum.Done],
                      })}
                      accountListType={accountListType}
                    >
                      {data?.accountListAnalytics.textMessage.sent} {t('Sent')}
                    </Link>
                    {' / '}
                    <Link
                      href={tasksLink({
                        ...taskBaseFilter,
                        activityType: [
                          ActivityTypeEnum.InitiationTextMessage,
                          ActivityTypeEnum.FollowUpTextMessage,
                          ActivityTypeEnum.PartnerCareTextMessage,
                        ],
                        result: [ResultEnum.Received],
                      })}
                      accountListType={accountListType}
                    >
                      {data?.accountListAnalytics.textMessage.received}{' '}
                      {t('Received')}
                    </Link>
                  </StatsText>
                  <StatsColumnTitle>{t('Text Message')}</StatsColumnTitle>
                </StatsColumn>
              </StatsRow>
            </>
          )}
        </ActivitySection>
        <ActivitySection data-testid="ActivitySectionAppeal">
          <MoneyOutlined sx={{ fontSize: '6rem' }} />
          <SectionTitle>
            {accountListType === AccountListTypeEnum.Own ? (
              <HandoffLink path="/tools/appeals">
                <MuiLink underline="none">{t('Primary Appeal')}</MuiLink>
              </HandoffLink>
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
                        <HandoffLink
                          path={`/tools/appeals/${primaryAppeal.id}`}
                        >
                          <MuiLink underline="none">
                            {primaryAppeal.name}
                          </MuiLink>
                        </HandoffLink>
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
      </SectionsContainer>
    </AnimatedCard>
  );
};
