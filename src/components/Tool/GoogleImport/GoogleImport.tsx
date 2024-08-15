import React, { ReactElement, useEffect, useMemo, useState } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  ButtonGroup,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Checkbox,
  DialogActions,
  DialogContent,
  DialogContentText,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Formik } from 'formik';
import { Trans, useTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';
import * as yup from 'yup';
import { useGetContactTagListQuery } from 'src/components/Contacts/ContactDetails/ContactDetailsTab/Tags/ContactTags.generated';
import { LoadingSpinner } from 'src/components/Settings/Organization/LoadingSpinner';
import { ContactTagInput } from 'src/components/Tags/Tags';
import Modal from 'src/components/common/Modal/Modal';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import theme from 'src/theme';
import NoData from '../NoData';
import { useGoogleContactGroupsQuery } from './googleContactGroups.generated';

const BoldTypography = styled(Typography)(() => ({
  fontWeight: 'bold',
}));

const ContainerBox = styled(Grid)(({ theme }) => ({
  padding: theme.spacing(3),
  width: '70%',
  display: 'flex',
  [theme.breakpoints.down('lg')]: {
    width: '100%',
  },
}));

const OuterBox = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  width: '100%',
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.cruGrayLight.main,
  width: '100%',
  padding: theme.spacing(1),
  display: 'flex',
  justifyContent: 'end',
  borderTopRightRadius: '7px',
  borderTopLeftRadius: '7px',
  [theme.breakpoints.down('sm')]: {
    paddingTop: theme.spacing(2),
  },
}));

const BorderBox = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  border: `1px solid ${theme.palette.cruGrayLight.main}`,
  width: '100%',
  borderRadius: '7px',
}));

const Section = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

const useStyles = makeStyles()(() => ({
  bulletList: {
    margin: '0 0 10px 15px',
    '> li': {
      margin: '5px',
    },
  },
  divider: {
    margin: theme.spacing(2, 0),
  },
  headerTitle: {
    fontSize: '1rem!important',
  },
}));

const googleImportSchema = yup.object({
  tagsForAllList: yup.array().of(yup.string()).default([]),
  override: yup.string().required(),
  importAll: yup.string().required(),
  groupTags: yup.object(),
  groups: yup.array().of(yup.string()).default([]),
});

type Attributes = yup.InferType<typeof googleImportSchema>;

interface Props {
  accountListId: string;
}

const GoogleImport: React.FC<Props> = ({ accountListId }: Props) => {
  const { classes } = useStyles();
  const { appName } = useGetAppSettings();
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [showConfirmAllModal, setShowConfirmAllModal] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState('');

  const { data: contactTagsList, loading: contactTagsListLoading } =
    useGetContactTagListQuery({
      variables: {
        accountListId,
      },
    });

  const { data, loading } = useGoogleContactGroupsQuery();
  const googleAccounts = data?.googleAccounts;

  const account = useMemo(() => {
    return googleAccounts?.find((account) => account?.id === selectedAccount);
  }, [googleAccounts, selectedAccount]);

  const initialValues = useMemo(() => {
    const initialGroupTags =
      account?.contactGroups.reduce((acc, group) => {
        if (group?.id) {acc[group?.id] = [group?.tag];}
        return acc;
      }, {}) || {};
    return {
      tagsForAllList: [],
      override: 'false',
      importAll: 'false',
      groupTags: initialGroupTags,
      groups: [] as string[],
    };
  }, [account]);

  useEffect(() => {
    googleAccounts?.length && setSelectedAccount(googleAccounts[0]?.id || '');
  }, [googleAccounts]);

  const handleCloseModal = () => {
    setShowModal(false);
    window.location.href = `${process.env.SITE_URL}/accountLists/${accountListId}/tools`;
    setRedirecting(true);
  };

  const onSubmit = async (
    attributes: Attributes,
    { resetForm },
  ): Promise<void> => {
    resetForm();
    alert('import mutation TODO');
    setShowModal(true);
  };

  return (
    <OuterBox>
      {redirecting && (
        <LoadingSpinner firstLoad={true} data-testid="LoadingSpinner" />
      )}
      <ContainerBox container>
        <>
          <Grid item xs={12}>
            <Typography variant="h4">{t('Import from Google')}</Typography>
            <Divider className={classes.divider} />
          </Grid>
          {loading && !data && (
            <LoadingSpinner firstLoad={true} data-testid="LoadingSpinner" />
          )}

          {!loading && data && (
            <>
              {!data?.googleAccounts.length && <NoData tool="googleImport" />}
              {!!data?.googleAccounts.length && (
                <>
                  {data?.googleAccounts.length > 1 && (
                    <FormControl
                      fullWidth
                      sx={{ marginBottom: theme.spacing(1) }}
                    >
                      <BoldTypography variant="h6">
                        {t('Account to Import From')}
                      </BoldTypography>
                      <Select
                        value={selectedAccount ?? ''}
                        onChange={(e) => setSelectedAccount(e.target.value)}
                        fullWidth
                      >
                        {googleAccounts?.map((account) => (
                          <MenuItem
                            value={account?.id}
                            key={account?.id}
                            aria-label={account?.email}
                          >
                            {account?.email}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}

                  <Formik
                    initialValues={initialValues}
                    enableReinitialize
                    validationSchema={googleImportSchema}
                    onSubmit={onSubmit}
                  >
                    {({
                      values: {
                        tagsForAllList,
                        override,
                        importAll,
                        groupTags,
                        groups,
                      },
                      handleSubmit,
                      isSubmitting,
                      setFieldValue,
                      handleChange,
                      isValid,
                    }): ReactElement => (
                      <form noValidate style={{ width: '100%' }}>
                        <Card>
                          <CardHeader
                            sx={{
                              backgroundColor: theme.palette.cruGrayLight.main,
                            }}
                            title={
                              <Trans
                                defaults="Importing from <bold>{{email}}</bold>"
                                shouldUnescape
                                values={{ email: account?.email }}
                                components={{ bold: <strong /> }}
                              />
                            }
                            action={
                              <Button
                                href={`${process.env.SITE_URL}/accountLists/${accountListId}/settings/integrations`}
                                size="small"
                                variant="contained"
                              >
                                {t('Connect Another Google Account')}
                              </Button>
                            }
                            classes={{
                              title: classes.headerTitle,
                            }}
                          ></CardHeader>
                          <CardContent>
                            <FormControl>
                              <RadioGroup
                                aria-labelledby="import-all-radio-group"
                                defaultValue="false"
                                name="importAll"
                                onChange={handleChange('importAll')}
                                value={importAll}
                              >
                                <FormControlLabel
                                  value="true"
                                  control={<Radio />}
                                  label={t('Import all contacts')}
                                />
                                <FormControlLabel
                                  value="false"
                                  control={<Radio />}
                                  label={t(
                                    'Only import contacts from certain groups',
                                  )}
                                />
                              </RadioGroup>
                            </FormControl>
                            {!!account?.contactGroups.length && (
                              <Box
                                sx={{
                                  display:
                                    importAll === 'false' ? 'block' : 'none',
                                }}
                              >
                                <BorderBox>
                                  <HeaderBox>
                                    <Grid
                                      container
                                      sx={{ alignItems: 'center' }}
                                    >
                                      <Grid item xs={4}>
                                        <BoldTypography>
                                          {t('Contact Group')}
                                        </BoldTypography>
                                      </Grid>
                                      <Grid item xs={4}>
                                        <BoldTypography>
                                          {t('Tags for Group')}
                                        </BoldTypography>
                                      </Grid>
                                      <Grid
                                        item
                                        xs={4}
                                        sx={{ textAlign: 'right' }}
                                      >
                                        <ButtonGroup size="small">
                                          <Button
                                            onClick={() =>
                                              setFieldValue(
                                                'groups',
                                                account?.contactGroups.map(
                                                  (group) => group?.id,
                                                ),
                                              )
                                            }
                                          >
                                            {t('Check All')}
                                          </Button>
                                          <Button
                                            onClick={() =>
                                              setFieldValue('groups', [])
                                            }
                                          >
                                            {t('Uncheck All')}
                                          </Button>
                                        </ButtonGroup>
                                      </Grid>
                                    </Grid>
                                  </HeaderBox>
                                  <Box
                                    sx={{
                                      marginX: theme.spacing(2),
                                    }}
                                  >
                                    {account?.contactGroups.map(
                                      (group, idx) => (
                                        <Grid
                                          container
                                          sx={{
                                            alignItems: 'center',
                                          }}
                                          key={idx}
                                        >
                                          <Grid item xs={4}>
                                            <FormControlLabel
                                              control={
                                                <Checkbox
                                                  name="groups"
                                                  value={group?.id}
                                                  onChange={handleChange}
                                                  checked={groups.includes(
                                                    group?.id || '',
                                                  )}
                                                />
                                              }
                                              label={group?.title}
                                            />
                                          </Grid>
                                          <Grid item xs={6}>
                                            <Autocomplete
                                              multiple
                                              freeSolo
                                              key={idx}
                                              autoSelect
                                              autoHighlight
                                              fullWidth
                                              size="small"
                                              loading={contactTagsListLoading}
                                              filterSelectedOptions
                                              value={
                                                group?.id &&
                                                groupTags[group?.id]
                                                  ? groupTags[group?.id]
                                                  : []
                                              }
                                              options={
                                                contactTagsList?.accountList
                                                  ?.contactTagList || []
                                              }
                                              renderInput={(
                                                params,
                                              ): ReactElement => (
                                                <ContactTagInput
                                                  {...params}
                                                  placeholder={t('add tag')}
                                                  disabled={isSubmitting}
                                                />
                                              )}
                                              onChange={(_, value): void =>
                                                setFieldValue(
                                                  `groupTags.${group?.id}`,
                                                  value,
                                                )
                                              }
                                            />
                                          </Grid>
                                        </Grid>
                                      ),
                                    )}
                                  </Box>
                                </BorderBox>
                              </Box>
                            )}
                            <Box sx={{ padding: theme.spacing(2) }}>
                              <Section>
                                <BoldTypography>
                                  {t('Tags for all imported Google contacts')}
                                </BoldTypography>
                                <Autocomplete
                                  multiple
                                  freeSolo
                                  autoSelect
                                  autoHighlight
                                  fullWidth
                                  loading={contactTagsListLoading}
                                  filterSelectedOptions
                                  value={tagsForAllList}
                                  options={
                                    contactTagsList?.accountList
                                      ?.contactTagList || []
                                  }
                                  renderInput={(params): ReactElement => (
                                    <ContactTagInput
                                      {...params}
                                      placeholder={t('add tag')}
                                      disabled={isSubmitting}
                                    />
                                  )}
                                  onChange={(_, tagsForAllList): void =>
                                    setFieldValue(
                                      'tagsForAllList',
                                      tagsForAllList,
                                    )
                                  }
                                />
                                <FormControl>
                                  <RadioGroup
                                    aria-labelledby="demo-radio-buttons-group-label"
                                    defaultValue="false"
                                    name="override"
                                    onChange={handleChange('override')}
                                    value={override}
                                  >
                                    <FormControlLabel
                                      value="false"
                                      control={<Radio />}
                                      label={t(
                                        'This import should only fill blank fields in current contacts and/or add new contacts.',
                                      )}
                                    />
                                    <FormControlLabel
                                      value="true"
                                      control={<Radio />}
                                      label={t(
                                        'This import should override all fields in current contacts (contact info, notes) and add new contacts.',
                                      )}
                                    />
                                  </RadioGroup>
                                </FormControl>
                              </Section>
                            </Box>
                            <CardActions>
                              <Button
                                variant="contained"
                                disabled={!isValid || isSubmitting}
                                onClick={() => {
                                  importAll
                                    ? setShowConfirmAllModal(true)
                                    : handleSubmit();
                                }}
                              >
                                Import
                              </Button>
                            </CardActions>
                          </CardContent>
                        </Card>
                        <Modal
                          isOpen={showConfirmAllModal}
                          handleClose={() => setShowConfirmAllModal(false)}
                          title={t('Confirm')}
                        >
                          <>
                            <DialogContent dividers>
                              <DialogContentText
                                component="div"
                                sx={{ color: theme.palette.primary.dark }}
                              >
                                {t(
                                  'Are you sure you want to import all contacts? This may import many contacts that you do not wish to have in {{appName}}. Many users find it more helpful to use the "Only import contacts from certain groups" option.',
                                  { appName },
                                )}
                              </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                              <Button
                                variant="contained"
                                onClick={() => {
                                  setShowConfirmAllModal(false);
                                  handleSubmit();
                                }}
                              >
                                Ok
                              </Button>
                            </DialogActions>
                          </>
                        </Modal>
                      </form>
                    )}
                  </Formik>
                </>
              )}
            </>
          )}
        </>
      </ContainerBox>

      <Modal
        isOpen={showModal}
        handleClose={handleCloseModal}
        title={t('Good Work!')}
      >
        <>
          <DialogContent dividers>
            <DialogContentText
              component="div"
              sx={{ color: theme.palette.primary.dark }}
            >
              {t(
                'Your Google import has started and your contacts will be in {{appName}} shortly. We will email you when your import is complete.',
                { appName },
              )}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button variant="contained" onClick={handleCloseModal}>
              Ok
            </Button>
          </DialogActions>
        </>
      </Modal>
    </OuterBox>
  );
};

export default GoogleImport;
