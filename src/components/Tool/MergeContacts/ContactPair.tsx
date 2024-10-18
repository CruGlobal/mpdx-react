import React, { useState } from 'react';
import {
  mdiArrowDownBold,
  mdiArrowLeftBold,
  mdiArrowRightBold,
  mdiArrowUpBold,
  mdiCloseThick,
} from '@mdi/js';
import { Icon } from '@mdi/react';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  IconButton,
  Link,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { DateTime } from 'luxon';
import { TFunction, Trans, useTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';
import { SetContactFocus } from 'pages/accountLists/[accountListId]/tools/useToolsHelper';
import { useLocale } from 'src/hooks/useLocale';
import { useLocalizedConstants } from 'src/hooks/useLocalizedConstants';
import { dateFormatShort } from 'src/lib/intlFormat';
import { sourceToStr } from 'src/utils/sourceHelper';
import theme from '../../../theme';
import { PersonInfoFragment } from '../MergePeople/GetPersonDuplicates.generated';
import { RecordInfoFragment } from './GetContactDuplicates.generated';

const useStyles = makeStyles()(() => ({
  contactBasic: {
    height: '100%',
    width: '45%',
    position: 'relative',
    '&:hover': {
      cursor: 'pointer',
    },
    [theme.breakpoints.down('sm')]: {
      backgroundColor: 'white',
      width: '100%',
      overflow: 'initial',
    },
  },
  selectedBox: {
    border: '2px solid',
    borderColor: theme.palette.mpdxGreen.main,
  },
  unselectedBox: {
    border: '2px solid rgba(0,0,0,0)',
  },
  loserBox: {
    border: '2px solid rgba(0,0,0,0)',
    opacity: '50%',
  },
  selected: {
    position: 'absolute',
    top: 0,
    right: 0,
    color: 'white',
    backgroundColor: theme.palette.mpdxGreen.main,
    paddingRight: theme.spacing(1),
    paddingLeft: theme.spacing(1),
    borderTopRightRadius: '5px',
  },
  minimalPadding: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingTop: theme.spacing(1),
    paddingBottom: '8px!important',
    [theme.breakpoints.down('sm')]: {
      padding: '5px 15px!important',
    },
  },
  container: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      border: `1px solid ${theme.palette.cruGrayMedium.main}`,
      padding: theme.spacing(2),
      backgroundColor: theme.palette.cruGrayLight.main,
    },
  },
  outer: {
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
    },
  },
  green: {
    color: theme.palette.mpdxGreen.main,
  },
  grey: {
    color: theme.palette.cruGrayMedium.main,
  },
  red: {
    color: 'red',
  },
}));

const InlineTypography = styled(Typography)(() => ({
  display: 'inline',
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  [theme.breakpoints.up('sm')]: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '10%',
  },
}));
const ContactAvatar = styled(Avatar)(() => ({
  width: theme.spacing(4),
  height: theme.spacing(4),
}));
interface ContactItemProps {
  contact: RecordInfoFragment | PersonInfoFragment;
  side: string;
  updateState: (side: string) => void;
  selected: boolean;
  loser: boolean;
  t: TFunction;
  setContactFocus: SetContactFocus;
}
const ContactItem: React.FC<ContactItemProps> = ({
  contact,
  updateState,
  selected,
  loser,
  t,
  side,
  setContactFocus,
}) => {
  const { getLocalizedContactStatus } = useLocalizedConstants();

  const { classes } = useStyles();
  const locale = useLocale();
  const handleContactNameClick = (contactId) => {
    setContactFocus(contactId);
  };
  const isPersonType = contact.__typename === 'Person';
  const isContactType = contact.__typename === 'Contact';
  return (
    <Card
      className={`
    ${classes.contactBasic} 
    ${
      selected
        ? classes.selectedBox
        : loser
        ? classes.loserBox
        : classes.unselectedBox
    }`}
      onClick={() => updateState(side)}
    >
      <CardHeader
        avatar={
          <ContactAvatar
            src={contact?.avatar || ''}
            aria-label="Contact Avatar"
          />
        }
        title={
          <>
            <Link
              underline="hover"
              onClick={(e) => {
                e.stopPropagation();
                handleContactNameClick(
                  isPersonType
                    ? contact.contactId
                    : isContactType
                    ? contact.id
                    : null,
                );
              }}
            >
              <InlineTypography variant="subtitle1">
                {isPersonType
                  ? `${contact.firstName} ${contact.lastName}`
                  : isContactType
                  ? contact.name
                  : null}
              </InlineTypography>
            </Link>{' '}
            {selected && (
              <Typography variant="body2" className={classes.selected}>
                {t('Use this one')}
              </Typography>
            )}
          </>
        }
        subheader={
          isContactType && (
            <Typography variant="subtitle2">
              {getLocalizedContactStatus(contact?.status)}
            </Typography>
          )
        }
        className={classes.minimalPadding}
      />
      <CardContent className={classes.minimalPadding}>
        {isContactType && contact.primaryAddress && (
          <Typography variant="body2">
            {`${contact?.primaryAddress?.street} 
            ${contact?.primaryAddress?.city}, ${contact?.primaryAddress?.state} ${contact?.primaryAddress?.postalCode}`}
          </Typography>
        )}
        {isContactType && (
          <Typography variant="body2">
            <Trans
              defaults="<bold>Source:</bold> {{where}}"
              shouldUnescape
              values={{ where: sourceToStr(t, contact.source) }}
              components={{ bold: <strong /> }}
            />
          </Typography>
        )}
        {isPersonType && contact.primaryPhoneNumber && (
          <Box>
            <InlineTypography variant="body2">
              {`${contact?.primaryPhoneNumber?.number}`}
            </InlineTypography>
            <Tooltip title="Source" arrow placement="right">
              <InlineTypography variant="body2">
                <Trans
                  defaults=" ({{source}})"
                  shouldUnescape
                  values={{
                    source: sourceToStr(t, contact.primaryPhoneNumber?.source),
                  }}
                  components={{ bold: <strong /> }}
                />
              </InlineTypography>
            </Tooltip>
          </Box>
        )}
        {isPersonType && contact.primaryEmailAddress && (
          <Box>
            <InlineTypography variant="body2">
              {`${contact?.primaryEmailAddress?.email}`}
            </InlineTypography>
            <Tooltip title="Source" arrow placement="right">
              <InlineTypography variant="body2">
                <Trans
                  defaults=" ({{where}})"
                  shouldUnescape
                  values={{
                    where: sourceToStr(t, contact.primaryEmailAddress?.source),
                  }}
                  components={{ bold: <strong /> }}
                />
              </InlineTypography>
            </Tooltip>
          </Box>
        )}
        <Box>
          <InlineTypography variant="body2" sx={{ fontWeight: 'bold' }}>
            {t('Created:')}{' '}
          </InlineTypography>
          <InlineTypography variant="body2">
            {dateFormatShort(DateTime.fromISO(contact.createdAt), locale)}
          </InlineTypography>
        </Box>
      </CardContent>
    </Card>
  );
};

interface Props {
  contact1: RecordInfoFragment | PersonInfoFragment;
  contact2: RecordInfoFragment | PersonInfoFragment;
  update: (
    id1: string,
    id2: string,
    duplicateId: string,
    action: string,
  ) => void;
  updating: boolean;
  setContactFocus: SetContactFocus;
  duplicateId: string;
}

const ContactPair: React.FC<Props> = ({
  contact1,
  contact2,
  duplicateId,
  update,
  updating,
  setContactFocus,
}) => {
  const [selected, setSelected] = useState('none');
  const { t } = useTranslation();
  const matches = useMediaQuery('(max-width:600px)');
  const { classes } = useStyles();
  const leftSelected = selected === 'left';
  const rightSelected = selected === 'right';

  const updateState = (side: string): void => {
    if (!updating) {
      switch (side) {
        case 'left':
          setSelected('left');
          update(contact1.id, contact2.id, duplicateId, 'merge');
          break;
        case 'right':
          setSelected('right');
          update(contact2.id, contact1.id, duplicateId, 'merge');
          break;
        case 'ignore':
          setSelected('ignore');
          update(contact1.id, contact2.id, duplicateId, 'ignore');
          break;
        default:
          setSelected('');
          update(contact1.id, contact2.id, duplicateId, 'ignore');
      }
    }
  };

  return (
    <Grid
      container
      className={classes.container}
      data-testid="MergeContactPair"
    >
      <Grid container>
        <Grid item xs={12}>
          <Box display="flex" alignItems="center">
            <Grid container>
              <Box
                display="flex"
                style={{ width: '100%' }}
                className={classes.outer}
              >
                <ContactItem
                  contact={contact1}
                  t={t}
                  side={'left'}
                  updateState={updateState}
                  selected={leftSelected}
                  loser={rightSelected}
                  setContactFocus={setContactFocus}
                />
                <IconWrapper>
                  <Tooltip
                    title={t('Left Wins the Merge')}
                    arrow
                    placement={matches ? undefined : 'top'}
                  >
                    <IconButton
                      onClick={() => updateState('left')}
                      className={leftSelected ? classes.green : classes.grey}
                      data-testid="leftButton"
                    >
                      <Icon
                        path={matches ? mdiArrowUpBold : mdiArrowLeftBold}
                        size={1}
                      />
                    </IconButton>
                  </Tooltip>
                  <Tooltip
                    title={t('Right Wins the Merge')}
                    arrow
                    placement={matches ? undefined : 'left'}
                  >
                    <IconButton
                      onClick={() => updateState('right')}
                      className={rightSelected ? classes.green : classes.grey}
                      data-testid="rightButton"
                    >
                      <Icon
                        path={matches ? mdiArrowDownBold : mdiArrowRightBold}
                        size={1}
                      />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('Ignore this Duplicate')} arrow>
                    <IconButton
                      onClick={() => updateState('ignore')}
                      className={
                        selected === 'ignore' ? classes.red : classes.grey
                      }
                      data-testid="ignoreButton"
                    >
                      <Icon path={mdiCloseThick} size={1} />
                    </IconButton>
                  </Tooltip>
                </IconWrapper>
                <ContactItem
                  contact={contact2}
                  t={t}
                  side={'right'}
                  updateState={updateState}
                  selected={rightSelected}
                  loser={leftSelected}
                  setContactFocus={setContactFocus}
                />
              </Box>
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default ContactPair;
