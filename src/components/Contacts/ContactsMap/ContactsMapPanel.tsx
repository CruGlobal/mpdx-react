import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  IconButton,
  Typography,
  styled,
  Theme,
} from '@material-ui/core';
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Close, ExpandMore } from '@material-ui/icons';
import Image from 'next/image';
import { StatusEnum } from '../../../../graphql/types.generated';
import { Coordinates } from 'pages/accountLists/[accountListId]/contacts/map/map';
import theme from 'src/theme';

interface ContactMapsPanelProps {
  data: (Coordinates | undefined)[] | undefined;
  selected: Coordinates | null | undefined;
  setSelected: Dispatch<SetStateAction<Coordinates | null | undefined>>;
  panTo: (coords: {
    lat: number | null | undefined;
    lng: number | null | undefined;
  }) => void;
  onClose: () => void;
}

const StatusAccordion = styled(Accordion)(() => ({
  '&.MuiAccordion-root.Mui-expanded': {
    margin: '0',
  },
}));

const StatusHeader = styled(AccordionSummary)(() => ({
  minHeight: '58px !important',
  boxShadow: `0px 0px 1px 1px ${theme.palette.cruGrayMedium.main}`,
  '& .MuiAccordion-root.Mui-expanded': {
    margin: 'auto',
  },
  '& .MuiAccordionSummary-content.Mui-expanded': {
    margin: 0,
  },
}));

const ContactList = styled(AccordionDetails)(() => ({
  padding: 0,
  width: '100%',
}));

const ContactWrapper = styled(Box)(
  ({ theme, current }: { theme: Theme; current: boolean }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    borderBottom: `1px solid ${theme.palette.cruGrayMedium.main}`,
    alignItems: 'center',
    width: '100%',
    padding: theme.spacing(1),
    paddingLeft: theme.spacing(2),
    backgroundColor: current
      ? theme.palette.cruGrayLight.main
      : theme.palette.common.white,
    '&:hover': {
      backgroundColor: theme.palette.cruGrayLight.main,
      cursor: 'pointer',
    },
  }),
);

const CruFocus = styled(Typography)(({ theme }) => ({
  marginRight: theme.spacing(0.5),
  display: 'inline',
}));

const inactiveStatuses: (StatusEnum | null | undefined)[] = [
  StatusEnum.ExpiredReferral,
  StatusEnum.NeverAsk,
  StatusEnum.NotInterested,
  StatusEnum.ResearchAbandoned,
  StatusEnum.Unresponsive,
];

export const ContactsMapPanel: React.FC<ContactMapsPanelProps> = ({
  data,
  panTo,
  selected,
  setSelected,
  onClose,
}) => {
  const { t } = useTranslation();

  const [statusContactsMapOpen, setStatusContactsMapOpen] = useState(-1);

  const handleExpansionChange = (panel: React.SetStateAction<number>) => (
    _event: React.ChangeEvent<Record<string, unknown>>,
    newExpanded: boolean,
  ) => {
    setStatusContactsMapOpen(newExpanded ? panel : -1);
  };

  const panelData: {
    [key: string]: {
      title: string;
      imgUrl: string;
      data: (Coordinates | undefined)[] | undefined;
    };
  } = {
    AppointmentScheduled: {
      title: t('Appointment Scheduled'),
      imgUrl: '/images/pin_appt_scheduled.png',
      data: data?.filter(
        (contact) =>
          contact?.lat && contact?.status === StatusEnum.AppointmentScheduled,
      ),
    },
    AskInFuture: {
      title: t('Ask In Future'),
      imgUrl: '/images/pin_ask_in_future.png',
      data: data?.filter(
        (contact) => contact?.lat && contact?.status === StatusEnum.AskInFuture,
      ),
    },
    CallForDecision: {
      title: t('Call For Decision'),
      imgUrl: '/images/pin_call_for_decision.png',
      data: data?.filter(
        (contact) =>
          contact?.lat && contact?.status === StatusEnum.CallForDecision,
      ),
    },
    ContactForAppointment: {
      title: t('Contact For Appointment'),
      imgUrl: '/images/pin_contact_for_appt.png',
      data: data?.filter(
        (contact) =>
          contact?.lat && contact?.status === StatusEnum.ContactForAppointment,
      ),
    },
    CultivateRelationship: {
      title: t('Cultivate Relationship'),
      imgUrl: '/images/pin_cultivate_relationship.png',
      data: data?.filter(
        (contact) =>
          contact?.lat && contact?.status === StatusEnum.CultivateRelationship,
      ),
    },
    NeverContacted: {
      title: t('Never Contacted'),
      imgUrl: '/images/pin_never_contacted.png',
      data: data?.filter(
        (contact) =>
          contact?.lat && contact?.status === StatusEnum.NeverContacted,
      ),
    },
    PartnerFinancial: {
      title: t('Partner - Financial'),
      imgUrl: '/images/pin_partner_financial.png',
      data: data?.filter(
        (contact) =>
          contact?.lat && contact?.status === StatusEnum.PartnerFinancial,
      ),
    },
    PartnerPray: {
      title: t('Partner - Pray'),
      imgUrl: '/images/pin_partner_pray.png',
      data: data?.filter(
        (contact) => contact?.lat && contact?.status === StatusEnum.PartnerPray,
      ),
    },
    PartnerSpecial: {
      title: t('Partner - Special'),
      imgUrl: '/images/pin_partner_special.png',
      data: data?.filter(
        (contact) =>
          contact?.lat && contact?.status === StatusEnum.PartnerSpecial,
      ),
    },
    AllInactive: {
      title: t('All Inactive'),
      imgUrl: '/images/pin_grey.png',
      data: data?.filter(
        (contact) =>
          contact?.lat &&
          (inactiveStatuses.includes(contact?.status) || !contact.status),
      ),
    },
    NoAddress: {
      title: t('No Primary Address Set'),
      imgUrl: '/images/pin_inactive.png',
      data: data?.filter((contact) => !contact?.lat),
    },
  };

  const cardRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (selected) {
      setStatusContactsMapOpen(
        Object.values(panelData).findIndex((status) =>
          status.data?.find((contact) => contact?.id === selected.id),
        ),
      );
      setTimeout(
        () =>
          cardRef?.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          }),
        statusContactsMapOpen < 0 ? 1000 : 0,
      );
    }
  }, [selected]);

  return (
    <>
      <Box padding={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{t('Partners by Status')}</Typography>
          <IconButton onClick={onClose} aria-label={t('Close')}>
            <Close titleAccess={t('Close')} />
          </IconButton>
        </Box>
      </Box>
      <Box>
        {Object.entries(panelData).map(([status, entry], index) => (
          <>
            {entry.data && entry.data?.length > 0 && (
              <StatusAccordion
                key={status}
                expanded={statusContactsMapOpen === index}
                onChange={handleExpansionChange(index)}
              >
                <StatusHeader expandIcon={<ExpandMore />}>
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Image
                      alt={`${entry} Pin`}
                      src={entry.imgUrl}
                      width={21}
                      height={34}
                    />
                    <Typography
                      style={{ marginLeft: theme.spacing(1), fontWeight: 550 }}
                    >
                      {entry.data.length}
                    </Typography>
                    <Typography style={{ marginLeft: theme.spacing(1) }}>
                      {entry.title}
                    </Typography>
                  </Box>
                </StatusHeader>
                <ContactList>
                  <Box display="flex" flexDirection="column" width="100%">
                    {entry.data.map((contact) => (
                      <Box
                        key={contact?.id}
                        display="flex"
                        width="100%"
                        style={{
                          background: 'white',
                        }}
                      >
                        <ContactWrapper
                          current={selected?.id === contact?.id}
                          {...{
                            ref: selected?.id === contact?.id ? cardRef : null,
                          }}
                          onClick={() => {
                            if (contact?.lat) {
                              setSelected(contact);
                              panTo({
                                lat: contact?.lat,
                                lng: contact?.lng,
                              });
                            }
                          }}
                        >
                          <Box
                            display="flex"
                            flexDirection="column"
                            width="100%"
                          >
                            <Typography style={{ fontWeight: 550 }}>
                              {contact?.name}
                            </Typography>
                            {contact?.lat && contact?.lng && (
                              <>
                                <Typography>{contact?.street}</Typography>
                                <Typography>{`${contact?.city} ${contact?.state} ${contact?.postal}`}</Typography>
                                <Box>
                                  <CruFocus>{t('Source:')}</CruFocus>
                                  <CruFocus>{contact?.source}</CruFocus>
                                  <Typography display="inline">
                                    {contact?.date}
                                  </Typography>
                                </Box>
                              </>
                            )}
                          </Box>
                        </ContactWrapper>
                      </Box>
                    ))}
                  </Box>
                </ContactList>
              </StatusAccordion>
            )}
          </>
        ))}
      </Box>
    </>
  );
};
