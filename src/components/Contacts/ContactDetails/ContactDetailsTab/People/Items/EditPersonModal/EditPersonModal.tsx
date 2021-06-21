import React, { ReactElement, useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  Divider,
  styled,
  Typography,
  TextField,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
  Checkbox,
  makeStyles,
  Theme,
} from '@material-ui/core';
import { DatePicker } from '@material-ui/pickers';
import { DateTime } from 'luxon';
import BookmarkIcon from '@material-ui/icons/Bookmark';
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';
import CakeIcon from '@material-ui/icons/Cake';
import SchoolIcon from '@material-ui/icons/School';
import BusinessIcon from '@material-ui/icons/Business';
import SocialIcon from '@material-ui/icons/Language';
import { useTranslation } from 'react-i18next';
import { RingIcon } from '../../../../../RingIcon';
import { ContactDetailsTabQuery } from '../../../ContactDetailsTab.generated';
import Modal from '../../../../../../common/Modal/Modal';

const useStyles = makeStyles((theme: Theme) => ({
  leftIcon: {
    position: 'absolute',
    top: '50%',
    left: 8,
    transform: 'translateY(-50%)',
    color: theme.palette.cruGrayMedium.main,
  },
}));

// Container Styles
const ContactEditModalFooterButton = styled(Button)(() => ({
  color: '#2196F3',
  fontWeight: 'bold',
}));

const ContactPersonContaner = styled(Box)(({ theme }) => ({
  margin: theme.spacing(2, 0),
}));

const ShowExtraContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  margin: theme.spacing(1, 0),
}));

const ContactEditContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  width: '100%',
  flexDirection: 'column',
  margin: theme.spacing(4, 0),
}));

const ContactInputWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(0, 6),
  margin: theme.spacing(2, 0),
}));

// Icon Styles
const ContactAvatar = styled(Avatar)(() => ({
  position: 'absolute',
  top: '50%',
  left: 4,
  transform: 'translateY(-50%)',
  width: '34px',
  height: '34px',
}));

const ContactAddIcon = styled(AddIcon)(() => ({
  color: '#2196F3',
}));

// Input Styles
const ContactInputField = styled(TextField)(() => ({
  '&& > label': {
    textTransform: 'uppercase',
  },
}));

// Text Styles
const ContactEditDeleteIconButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  right: 0,
  transform: 'translateY(-50%)',
  color: theme.palette.cruGrayMedium.main,
}));

const ContactAddText = styled(Typography)(() => ({
  color: '#2196F3',
  textTransform: 'uppercase',
  fontWeight: 'bold',
}));

const ContactPrimaryPersonSelectLabel = styled(InputLabel)(() => ({
  textTransform: 'uppercase',
}));

const ShowExtraText = styled(Typography)(() => ({
  color: '#2196F3',
  textTransform: 'uppercase',
  fontWeight: 'bold',
}));

interface EditPersonModalProps {
  contact: ContactDetailsTabQuery['contact'];
  isOpen: boolean;
  handleOpenModal: (open: boolean) => void;
}
export const EditPersonModal: React.FC<EditPersonModalProps> = ({
  contact,
  isOpen,
  handleOpenModal,
}): ReactElement<EditPersonModalProps> => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [personEditShowMore, setPersonEditShowMore] = useState<Array<string>>(
    [],
  );

  const handleDateChange = (date: DateTime) => {
    console.log(date.month);
    console.log(date.day);
    console.log(date.year);
  };

  const renderSocialsSection = (
    person: ContactDetailsTabQuery['contact']['people']['nodes'][0],
  ) => {
    const socialAccounts = [
      ...person.facebookAccounts.nodes.map((account) => ({
        ...account,
        type: 'facebook',
        name: t('Facebook'),
      })),
      ...person.twitterAccounts.nodes.map((account) => ({
        ...account,
        type: 'twitter',
        name: t('Twitter'),
      })),
      ...person.linkedinAccounts.nodes.map((account) => ({
        ...account,
        type: 'linkedin',
        name: t('LinkedIn'),
      })),
      ...person.websites.nodes.map((account) => ({
        ...account,
        type: 'website',
        name: t('Website'),
      })),
    ];
    return socialAccounts.length > 0 ? (
      <>
        {socialAccounts.map((account, index) => (
          <>
            <ContactInputWrapper>
              {index === 0 ? <SocialIcon className={classes.leftIcon} /> : null}
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <TextField
                    label={t('Username/URL')}
                    value={account.value}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel id="social-type-label">{t('Type')}</InputLabel>
                    <Select
                      labelId="socail-type-label"
                      value={account.type}
                      fullWidth
                      readOnly
                    >
                      <MenuItem value={account.type}>{account.name}</MenuItem>
                    </Select>
                  </FormControl>
                  <ContactEditDeleteIconButton>
                    <DeleteIcon />
                  </ContactEditDeleteIconButton>
                </Grid>
              </Grid>
            </ContactInputWrapper>
          </>
        ))}
      </>
    ) : (
      <>
        <ContactInputWrapper>
          <SocialIcon className={classes.leftIcon} />
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <TextField label={t('Username/URL')} value={null} fullWidth />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel id="social-type-label">{t('Type')}</InputLabel>
                <Select labelId="socail-type-label" value={null} fullWidth>
                  <MenuItem value={'facebook'}>{t('Facebook')}</MenuItem>
                  <MenuItem value={'twitterk'}>{t('Twitter')}</MenuItem>
                  <MenuItem value={'linkedin'}>{t('LinkedIn')}</MenuItem>
                  <MenuItem value={'website'}>{t('Website')}</MenuItem>
                </Select>
              </FormControl>
              <ContactEditDeleteIconButton>
                <DeleteIcon />
              </ContactEditDeleteIconButton>
            </Grid>
          </Grid>
        </ContactInputWrapper>
      </>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      title={'Edit People'}
      content={
        <>
          <ContactEditContainer>
            <ContactInputWrapper>
              <ContactInputField
                label={t('Contact')}
                value={contact.name}
                fullWidth
              />
            </ContactInputWrapper>
            <ContactInputWrapper>
              <BookmarkIcon className={classes.leftIcon} />

              <FormControl fullWidth={true}>
                <ContactPrimaryPersonSelectLabel id="primary-person-select-label">
                  {t('Primary')}
                </ContactPrimaryPersonSelectLabel>
                <Select
                  labelId="primary-person-select-label"
                  value={contact.primaryPerson?.id}
                  fullWidth={true}
                >
                  {contact.people.nodes.map((person) => {
                    return (
                      <MenuItem
                        key={person.id}
                        value={person.id}
                      >{`${person.firstName} ${person.lastName}`}</MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </ContactInputWrapper>
          </ContactEditContainer>
          <Divider />
          <ContactEditContainer>
            {contact.people.nodes.map((person) => {
              return (
                <>
                  <ContactPersonContaner>
                    <ContactInputWrapper>
                      <ContactAvatar
                        alt={`${person.firstName} ${person.lastName}`}
                        src={person.lastName ?? ''}
                      />
                      <Typography>
                        <Box fontWeight="fontWeightBold">{`${person.firstName} ${person.lastName}`}</Box>
                      </Typography>
                      <ContactEditDeleteIconButton>
                        <DeleteIcon />
                      </ContactEditDeleteIconButton>
                    </ContactInputWrapper>
                    <ContactInputWrapper>
                      <Grid container spacing={3}>
                        <Grid item xs={6}>
                          <ContactInputField
                            label={t('First Name')}
                            value={person.firstName}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <ContactInputField
                            label={t('Last Name')}
                            value={person.lastName}
                            fullWidth
                          />
                        </Grid>
                      </Grid>
                      <Grid container spacing={3}>
                        <Grid item xs={6}>
                          <ContactInputField
                            placeholder={t('Title')}
                            value={person.title}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <ContactInputField
                            placeholder={t('Suffix')}
                            value={person.suffix}
                            fullWidth
                          />
                        </Grid>
                      </Grid>
                    </ContactInputWrapper>
                    {/* Phone Number Section */}
                    <ContactInputWrapper>
                      {person.primaryPhoneNumber?.number ? (
                        <>
                          <BookmarkIcon className={classes.leftIcon} />
                          <FormControl fullWidth={true}>
                            <ContactPrimaryPersonSelectLabel id="primary-phone-number-label">
                              {t('Primary Phone')}
                            </ContactPrimaryPersonSelectLabel>
                            <Select
                              id="primary-phone-number-label"
                              value={person.primaryPhoneNumber?.number}
                            >
                              {person.phoneNumbers.nodes.map((phoneNumber) => (
                                <MenuItem
                                  key={phoneNumber.id}
                                  value={phoneNumber.number}
                                >
                                  {phoneNumber.number}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </>
                      ) : null}
                    </ContactInputWrapper>
                    {person.phoneNumbers.nodes.length > 0
                      ? person.phoneNumbers.nodes.map((phoneNumber) => (
                          <ContactInputWrapper key={phoneNumber.id}>
                            <Grid container spacing={3}>
                              <Grid item xs={6}>
                                <ContactInputField
                                  value={phoneNumber.number}
                                  fullWidth
                                />
                              </Grid>
                              <Grid item xs={6}>
                                <Select value={'Mobile'} fullWidth>
                                  <MenuItem value="Mobile">
                                    {t('Mobile')}
                                  </MenuItem>
                                </Select>
                              </Grid>
                              <ContactEditDeleteIconButton>
                                <DeleteIcon />
                              </ContactEditDeleteIconButton>
                            </Grid>
                          </ContactInputWrapper>
                        ))
                      : null}
                    <ContactInputWrapper>
                      <Grid container alignItems="center">
                        <ContactAddIcon />
                        <ContactAddText variant="subtitle1">
                          {t('Add Phone')}
                        </ContactAddText>
                      </Grid>
                    </ContactInputWrapper>
                    {/* Email Section */}
                    <ContactInputWrapper>
                      {person.primaryEmailAddress?.email ? (
                        <>
                          <BookmarkIcon className={classes.leftIcon} />
                          <FormControl fullWidth={true}>
                            <ContactPrimaryPersonSelectLabel id="primary-email-label">
                              {t('Primary Email')}
                            </ContactPrimaryPersonSelectLabel>
                            <Select
                              id="primary-email-label"
                              value={person.primaryEmailAddress.email}
                            >
                              {person.emailAddresses.nodes.map(
                                (emailAddress) => (
                                  <MenuItem
                                    key={emailAddress.id}
                                    value={emailAddress.email}
                                  >
                                    {emailAddress.email}
                                  </MenuItem>
                                ),
                              )}
                            </Select>
                          </FormControl>
                        </>
                      ) : null}
                    </ContactInputWrapper>
                    {person.emailAddresses.nodes.length > 0
                      ? person.emailAddresses.nodes.map((emailAddress) => (
                          <>
                            <ContactInputWrapper>
                              <Grid container spacing={3}>
                                <Grid item xs={6}>
                                  <ContactInputField
                                    value={emailAddress.email}
                                    fullWidth
                                  />
                                </Grid>
                                <Grid item xs={6}>
                                  <Select value={'Mobile'} fullWidth>
                                    <MenuItem value="Mobile">
                                      {t('Mobile')}
                                    </MenuItem>
                                  </Select>
                                </Grid>
                                <ContactEditDeleteIconButton>
                                  <DeleteIcon />
                                </ContactEditDeleteIconButton>
                              </Grid>
                            </ContactInputWrapper>
                          </>
                        ))
                      : null}
                    <ContactInputWrapper>
                      <Grid container alignItems="center">
                        <Grid container alignItems="center" item xs={6}>
                          <ContactAddIcon />
                          <ContactAddText variant="subtitle1">
                            {t('Add Email')}
                          </ContactAddText>
                        </Grid>
                        <Grid container item xs={6} alignItems="center">
                          <Checkbox checked={person.optoutEnewsletter} />
                          <Typography variant="subtitle1">
                            {t('Opt-out of Email Newsletter')}
                          </Typography>
                        </Grid>
                      </Grid>
                    </ContactInputWrapper>
                    {/* Birthday Section */}
                    <ContactInputWrapper>
                      <CakeIcon className={classes.leftIcon} />
                      <DatePicker
                        onChange={(date) =>
                          !date ? null : handleDateChange(date)
                        }
                        value={
                          person?.birthdayMonth && person?.birthdayDay
                            ? new Date(
                                person.birthdayYear ?? 1900,
                                person.birthdayMonth - 1,
                                person.birthdayDay,
                              )
                            : null
                        }
                        format="MM/dd/yyyy"
                        clearable
                        label={t('Birthday')}
                        fullWidth
                        helperText="mm/dd/yyyy"
                      />
                    </ContactInputWrapper>
                    {/* Show More Section */}
                    {personEditShowMore.indexOf(person.id) === -1 && (
                      <ShowExtraContainer>
                        <ShowExtraText
                          variant="subtitle1"
                          onClick={() =>
                            setPersonEditShowMore([
                              ...personEditShowMore,
                              person.id,
                            ])
                          }
                        >
                          {t('Show More')}
                        </ShowExtraText>
                      </ShowExtraContainer>
                    )}
                    {/* Start Show More Content */}
                    {personEditShowMore.indexOf(person.id) >= 0 ? (
                      <>
                        {/* Relationship Section */}
                        <ContactInputWrapper>
                          <Grid container spacing={3}>
                            <Grid item xs={6}>
                              <FormControl fullWidth>
                                <InputLabel id="relationship-status-label">
                                  {t('Relationship Status')}
                                </InputLabel>
                                <Select
                                  labelId="relationship-status-label"
                                  value={person.maritalStatus}
                                  fullWidth
                                >
                                  <MenuItem value="single">
                                    {t('Single')}
                                  </MenuItem>
                                </Select>
                              </FormControl>
                            </Grid>
                            <Grid item xs={6}>
                              <FormControl fullWidth>
                                <InputLabel id="gender-label">
                                  {t('Gender')}
                                </InputLabel>
                                <Select
                                  labelId="gender-label"
                                  value={person.gender}
                                  fullWidth
                                >
                                  <MenuItem value="male">{t('Male')}</MenuItem>
                                  <MenuItem value="female">
                                    {t('Female')}
                                  </MenuItem>
                                </Select>
                              </FormControl>
                            </Grid>
                          </Grid>
                        </ContactInputWrapper>
                        {/* Anniversary Section */}
                        <ContactInputWrapper>
                          <RingIcon className={classes.leftIcon} />
                          <DatePicker
                            onChange={(date) =>
                              !date ? null : handleDateChange(date)
                            }
                            value={
                              person?.anniversaryMonth && person?.anniversaryDay
                                ? new Date(
                                    person.anniversaryYear ?? 1900,
                                    person.anniversaryMonth - 1,
                                    person.anniversaryDay,
                                  )
                                : null
                            }
                            format="MM/dd/yyyy"
                            clearable
                            label={t('Anniversary')}
                            fullWidth
                            helperText="mm/dd/yyyy"
                          />
                        </ContactInputWrapper>
                        {/* Alma Mater Section */}
                        <ContactInputWrapper>
                          <SchoolIcon className={classes.leftIcon} />
                          <TextField
                            label={t('Alma Mater')}
                            value={person.almaMater}
                            fullWidth
                          />
                        </ContactInputWrapper>
                        {/* Job Section */}
                        <ContactInputWrapper>
                          <BusinessIcon className={classes.leftIcon} />
                          <Grid container spacing={3}>
                            <Grid item xs={6}>
                              <TextField
                                label={t('Employer')}
                                value={person.employer}
                                fullWidth
                              />
                            </Grid>
                            <Grid item xs={6}>
                              <TextField
                                label={t('Occupation')}
                                value={person.occupation}
                                fullWidth
                              />
                            </Grid>
                          </Grid>
                        </ContactInputWrapper>
                        {/* Socials Section */}
                        {renderSocialsSection(person)}
                        <ContactInputWrapper>
                          <Grid container alignItems="center">
                            <ContactAddIcon />
                            <ContactAddText variant="subtitle1">
                              {t('Add Social')}
                            </ContactAddText>
                          </Grid>
                        </ContactInputWrapper>

                        {/* Legal First Name & Decased Section */}
                        <ContactInputWrapper>
                          <TextField
                            label={t('Legal First Name')}
                            value={person?.legalFirstName}
                            fullWidth
                          />
                        </ContactInputWrapper>
                        <ContactInputWrapper>
                          <Grid container alignItems="center">
                            <Grid container item xs={6} alignItems="center">
                              <Checkbox checked={person.deceased} />
                              <Typography variant="subtitle1">
                                {t('Deceased')}
                              </Typography>
                            </Grid>
                          </Grid>
                        </ContactInputWrapper>
                      </>
                    ) : null}
                    {/* End Show More Content */}

                    {/* Show Less Section */}
                    {personEditShowMore.indexOf(person.id) >= 0 && (
                      <ShowExtraContainer>
                        <ShowExtraText
                          variant="subtitle1"
                          onClick={() =>
                            setPersonEditShowMore([
                              ...personEditShowMore.filter(
                                (id) => id !== person.id,
                              ),
                            ])
                          }
                        >
                          {t('Show Less')}
                        </ShowExtraText>
                      </ShowExtraContainer>
                    )}
                  </ContactPersonContaner>
                  <Divider />
                </>
              );
            })}
          </ContactEditContainer>
        </>
      }
      customActionSection={
        <>
          <ContactEditModalFooterButton
            onClick={() => handleOpenModal(false)}
            variant="text"
          >
            {t('Cancel')}
          </ContactEditModalFooterButton>
          <ContactEditModalFooterButton
            onClick={() => handleOpenModal(false)}
            variant="text"
          >
            {t('Save')}
          </ContactEditModalFooterButton>
        </>
      }
      handleClose={() => handleOpenModal(false)}
    />
  );
};
