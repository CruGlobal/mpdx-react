import Image from 'next/image';
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';
import Close from '@mui/icons-material/Close';
import ExpandMore from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  IconButton,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { PhaseEnum, StatusEnum } from 'src/graphql/types.generated';
import { useContactPartnershipStatuses } from 'src/hooks/useContactPartnershipStatuses';
import theme from 'src/theme';
import { sourceToStr } from 'src/utils/sourceHelper';
import { Coordinates } from './coordinates';

interface ContactMapsPanelProps {
  data: Coordinates[] | undefined;
  selected: Coordinates | null;
  setSelected: Dispatch<SetStateAction<Coordinates | null>>;
  panTo: (coords: { lat: number; lng: number }) => void;
  onClose: () => void;
}

interface PanelItem {
  key: string;
  title: string;
  imgUrl: string;
  data: Coordinates[] | undefined;
}

const StatusAccordion = styled(Accordion)(() => ({
  '&.MuiAccordion-root.Mui-expanded': {
    margin: '0',
  },
}));

const StatusHeader = styled(AccordionSummary)(() => ({
  minHeight: '58px !important',
  boxShadow: `0px 0px 1px 1px ${theme.palette.mpdxGrayMedium.main}`,
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

const ContactWrapper = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'current',
})(({ current }: { current: boolean }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  borderBottom: `1px solid ${theme.palette.mpdxGrayMedium.main}`,
  alignItems: 'center',
  width: '100%',
  padding: theme.spacing(1),
  paddingLeft: theme.spacing(2),
  backgroundColor: current
    ? theme.palette.mpdxGrayLight.main
    : theme.palette.common.white,
  '&:hover': {
    backgroundColor: theme.palette.mpdxGrayLight.main,
    cursor: 'pointer',
  },
}));

const CruFocus = styled(Typography)(({ theme }) => ({
  marginRight: theme.spacing(0.5),
  display: 'inline',
}));

export const ContactsMapPanel: React.FC<ContactMapsPanelProps> = ({
  data,
  panTo,
  selected,
  setSelected,
  onClose,
}) => {
  const { t } = useTranslation();
  const { contactStatuses } = useContactPartnershipStatuses();

  const [statusContactsMapOpen, setStatusContactsMapOpen] = useState(-1);

  const handleExpansionChange =
    (panel: React.SetStateAction<number>) =>
    (_event: React.SyntheticEvent, newExpanded: boolean) => {
      setStatusContactsMapOpen(newExpanded ? panel : -1);
    };

  const inactiveStatuses: (StatusEnum | null | undefined)[] = Object.entries(
    contactStatuses,
  )
    .filter(([_, status]) => status.phase === PhaseEnum.Archive)
    .map(([statusKey]) => statusKey as StatusEnum);
  const statusesForMap: PanelItem[] = Object.entries(contactStatuses)
    .filter(
      ([_, status]) =>
        status.phase &&
        status.phase !== PhaseEnum.Archive &&
        status.phase !== PhaseEnum.FollowUp,
    )
    .map(([statusKey, status]) => {
      return {
        key: statusKey,
        title: status.name,
        imgUrl: `/images/pin_${statusKey.toLowerCase()}.png`,
        data: data?.filter(
          (contact) => contact?.lat && contact?.status === statusKey,
        ),
      };
    });

  const panelData: PanelItem[] = statusesForMap.concat([
    {
      key: 'AllInactive',
      title: t('All Inactive'),
      imgUrl: '/images/pin_grey.png',
      data: data?.filter(
        (contact) =>
          contact?.lat &&
          (inactiveStatuses.includes(contact?.status) || !contact.status),
      ),
    },
    {
      key: 'NoAddress',
      title: t('No Primary Address Set'),
      imgUrl: '/images/pin_inactive.png',
      data: data?.filter((contact) => !contact?.lat),
    },
  ]);

  const cardRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (selected) {
      setStatusContactsMapOpen(
        panelData.findIndex((status) =>
          status.data?.find((contact) => contact.id === selected.id),
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
        {panelData.map(
          (entry, index) =>
            entry.data &&
            entry.data?.length > 0 && (
              <StatusAccordion
                key={entry.key}
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
                        key={contact.id}
                        display="flex"
                        width="100%"
                        style={{
                          background: 'white',
                        }}
                      >
                        <ContactWrapper
                          current={selected?.id === contact.id}
                          {...{
                            ref: selected?.id === contact.id ? cardRef : null,
                          }}
                          onClick={() => {
                            if (
                              typeof contact.lat === 'number' &&
                              typeof contact.lng === 'number'
                            ) {
                              setSelected(contact);
                              panTo({
                                lat: contact.lat,
                                lng: contact.lng,
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
                              {contact.name}
                            </Typography>
                            {contact?.lat && contact?.lng && (
                              <>
                                <Typography>{contact?.street}</Typography>
                                <Typography>{`${contact?.city} ${contact?.state} ${contact?.postal}`}</Typography>
                                <Box>
                                  <CruFocus>{t('Source:')}</CruFocus>
                                  <CruFocus>
                                    {sourceToStr(t, contact?.source ?? '')}
                                  </CruFocus>
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
            ),
        )}
      </Box>
    </>
  );
};
