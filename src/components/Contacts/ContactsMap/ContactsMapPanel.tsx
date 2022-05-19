import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography,
  styled,
} from '@material-ui/core';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ExpandMore } from '@material-ui/icons';
import { StatusEnum } from '../../../../graphql/types.generated';
import { Coordinates } from 'pages/accountLists/[accountListId]/contacts/map/map';
import theme from 'src/theme';

interface ContactMapsPanelProps {
  data: (Coordinates | undefined)[] | undefined;
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

const ContactWrapper = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  borderBottom: `1px solid ${theme.palette.cruGrayMedium.main}`,
  alignItems: 'center',
  width: '100%',
  padding: theme.spacing(1),
  paddingLeft: theme.spacing(2),
  '&:hover': {
    backgroundColor: theme.palette.mpdxYellow.main,
  },
}));

export const ContactsMapPanel: React.FC<ContactMapsPanelProps> = ({ data }) => {
  const { t } = useTranslation();

  const [statusOpen, setStatusOpen] = useState(-1);

  const handleExpansionChange = (panel: React.SetStateAction<number>) => (
    _event: any,
    newExpanded: any,
  ) => {
    setStatusOpen(newExpanded ? panel : -1);
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
          (contact?.status === StatusEnum.ExpiredReferral ||
            contact?.status === StatusEnum.NeverAsk ||
            contact?.status === StatusEnum.NotInterested ||
            contact?.status === StatusEnum.ResearchAbandoned ||
            contact?.status === StatusEnum.Unresponsive ||
            !contact?.status),
      ),
    },
    NoAddress: {
      title: t('No Primary Address Set'),
      imgUrl: '/images/pin_inactive.png',
      data: data?.filter((contact) => !contact?.lat),
    },
  };

  return (
    <Box>
      {Object.entries(panelData).map(([status, entry], index) => (
        <>
          {entry.data && entry.data?.length > 0 && (
            <StatusAccordion
              key={status}
              expanded={statusOpen === index}
              onChange={handleExpansionChange(index)}
            >
              <StatusHeader expandIcon={<ExpandMore />}>
                <Box display="flex" justifyContent="center" alignItems="center">
                  <img alt={`${entry} Pin`} src={entry.imgUrl} />
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
                      <ContactWrapper>
                        <Box display="flex" flexDirection="column" width="100%">
                          <Typography style={{ fontWeight: 550 }}>
                            {contact?.name}
                          </Typography>
                          <Typography>{contact?.street}</Typography>
                          <Typography>{`${contact?.city} ${contact?.state} ${contact?.postal}`}</Typography>
                          <Box>
                            <Typography
                              display="inline"
                              style={{ marginRight: theme.spacing(0.5) }}
                            >
                              {t('Source:')}
                            </Typography>
                            <Typography
                              display="inline"
                              style={{ marginRight: theme.spacing(0.5) }}
                            >
                              {contact?.source}
                            </Typography>
                            <Typography display="inline">
                              {contact?.date}
                            </Typography>
                          </Box>
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
  );
};
