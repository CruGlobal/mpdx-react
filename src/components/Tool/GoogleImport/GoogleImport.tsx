import React, { ReactElement, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  AlertTitle,
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
  Link,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Formik } from 'formik';
import { getSession } from 'next-auth/react';
import { useSnackbar } from 'notistack';
import { Trans, useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useGetContactTagListQuery } from 'src/components/Contacts/ContactDetails/ContactDetailsTab/Tags/ContactTags.generated';
import { LoadingSpinner } from 'src/components/Settings/Organization/LoadingSpinner';
import { ContactTagInput } from 'src/components/Tags/Tags';
import { Confirmation } from 'src/components/common/Modal/Confirmation/Confirmation';
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
  minWidth: '450px',
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

const googleImportSchema = yup.object({
  tagsForAllList: yup.array().of(yup.string()).default([]),
  override: yup.string(),
  importByGroup: yup.string(),
  groupTags: yup.object(),
  groups: yup.array().of(yup.string()).default([]),
});

type Attributes = yup.InferType<typeof googleImportSchema>;

interface Props {
  accountListId: string;
}

const GoogleImport: React.FC<Props> = ({ accountListId }: Props) => {
  const { appName } = useGetAppSettings();
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [showModal, setShowModal] = useState(false);
  const [showConfirmAllModal, setShowConfirmAllModal] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState('');

  const { data: contactTagsList, loading: contactTagsListLoading } =
    useGetContactTagListQuery({
      variables: {
        accountListId,
      },
    });

  const { data, loading } = useGoogleContactGroupsQuery();
  const googleAccounts = data?.googleAccounts;

  const selectedAccount = useMemo(() => {
    return googleAccounts?.find(
      (selectedAccount) => selectedAccount?.id === selectedAccountId,
    );
  }, [googleAccounts, selectedAccountId]);

  const initialValues = useMemo(() => {
    const initialGroupTags =
      selectedAccount?.contactGroups.reduce((acc, group) => {
        if (group?.id) {
          acc[group?.id] = [group?.tag];
        }
        return acc;
      }, {}) || {};
    return {
      tagsForAllList: [],
      override: 'false',
      importByGroup: 'true',
      groupTags: initialGroupTags,
      groups: [] as string[],
    };
  }, [selectedAccount]);

  useEffect(() => {
    googleAccounts?.length && setSelectedAccountId(googleAccounts[0]?.id || '');
  }, [googleAccounts]);

  const handleCloseModal = () => {
    window.location.href = `/accountLists/${accountListId}/tools`;
    setShowModal(false);
    setRedirecting(true);
  };

  const onSubmit = async (
    attributes: Attributes,
    { resetForm },
  ): Promise<void> => {
    setShowConfirmAllModal(false);
    const session = await getSession();
    const apiToken = session?.user?.apiToken;

    const groupTags = Object.entries(attributes.groupTags).reduce(
      (result, value: [string, string[]]) => {
        result[value[0]] = value[1].join(',');
        return result;
      },
      {},
    );

    const importData = {
      data: {
        attributes: {
          groups: attributes.groups,
          import_by_group: attributes.importByGroup,
          override: attributes.override,
          source: 'google',
          tag_list: attributes.tagsForAllList.join(','),
          group_tags: groupTags,
        },
        relationships: {
          source_account: {
            data: {
              type: 'google_accounts',
              id: selectedAccountId,
            },
          },
        },
        type: 'imports',
      },
    };
    await fetch(
      `${process.env.REST_API_URL}account_lists/${accountListId}/imports/google`,
      {
        method: 'POST',
        body: JSON.stringify(importData),
        headers: {
          authorization: `Bearer ${apiToken}`,
          'content-type': 'application/vnd.api+json',
        },
      },
    ).catch((err) => {
      enqueueSnackbar(t('Import has failed'), {
        variant: 'error',
      });
      throw new Error(err);
    });

    enqueueSnackbar(t('Import has started'), {
      variant: 'success',
    });
    resetForm();
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
            <Divider sx={{ margin: theme.spacing(2, 0) }} />
          </Grid>
          {loading && !data && (
            <LoadingSpinner firstLoad={true} data-testid="LoadingSpinner" />
          )}

          {!loading && data && (
            <>
              {!data?.googleAccounts.length && (
                <NoData
                  tool="googleImport"
                  button={
                    <Button
                      href={`/accountLists/${accountListId}/settings/integrations?selectedTab=google`}
                      variant="contained"
                    >
                      {t('Connect Google Account')}
                    </Button>
                  }
                />
              )}
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
                        value={selectedAccountId ?? ''}
                        onChange={(e) => setSelectedAccountId(e.target.value)}
                        fullWidth
                      >
                        {googleAccounts?.map((selectedAccount) => (
                          <MenuItem
                            value={selectedAccount?.id}
                            key={selectedAccount?.id}
                            aria-label={selectedAccount?.email}
                          >
                            {selectedAccount?.email}
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
                        importByGroup,
                        groupTags,
                        groups,
                      },
                      handleSubmit,
                      submitForm,
                      isSubmitting,
                      setFieldValue,
                      handleChange,
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
                                values={{ email: selectedAccount?.email }}
                                components={{ bold: <strong /> }}
                              />
                            }
                            action={
                              <Button
                                href={`/accountLists/${accountListId}/settings/integrations?selectedTab=google`}
                                size="small"
                                variant="contained"
                              >
                                {t('Connect Another Google Account')}
                              </Button>
                            }
                            titleTypographyProps={{
                              fontSize: '1rem! important',
                            }}
                          ></CardHeader>
                          <CardContent>
                            <FormControl>
                              <RadioGroup
                                aria-labelledby="import-all-radio-group"
                                defaultValue="false"
                                name="importByGroup"
                                onChange={handleChange('importByGroup')}
                                value={importByGroup}
                              >
                                <FormControlLabel
                                  value="false"
                                  control={<Radio />}
                                  label={t('Import all contacts')}
                                />
                                <FormControlLabel
                                  value="true"
                                  control={<Radio />}
                                  label={t(
                                    'Only import contacts from certain groups',
                                  )}
                                />
                              </RadioGroup>
                            </FormControl>
                            {!!selectedAccount?.contactGroups.length ? (
                              <Box
                                sx={{
                                  display:
                                    importByGroup === 'true' ? 'block' : 'none',
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
                                                selectedAccount?.contactGroups.map(
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
                                  <Box mx={2}>
                                    {selectedAccount?.contactGroups.map(
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
                            ) : importByGroup === 'true' ? (
                              <Alert severity="info">
                                <AlertTitle>
                                  {t(
                                    'You have no Google Contact groups/labels',
                                  )}
                                </AlertTitle>
                                <Typography>
                                  {t(
                                    "If you'd like to import contacts by group/label, please add labels here: ",
                                  )}
                                </Typography>
                                {
                                  <Link
                                    href={'https://contacts.google.com'}
                                    underline="hover"
                                    sx={{ fontWeight: 'bold' }}
                                  >
                                    {t('contacts.google.com')}
                                  </Link>
                                }
                              </Alert>
                            ) : null}
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
                                disabled={
                                  (importByGroup === 'true' &&
                                    !groups.length) ||
                                  isSubmitting
                                }
                                onClick={() => {
                                  if (importByGroup === 'false') {
                                    setShowConfirmAllModal(true);
                                  } else {
                                    handleSubmit();
                                  }
                                }}
                              >
                                {t('Import')}
                              </Button>
                            </CardActions>
                          </CardContent>
                        </Card>
                        <Confirmation
                          isOpen={showConfirmAllModal}
                          title={t('Confirm Import All')}
                          message={t(
                            'Are you sure you want to import all contacts? This may import many contacts that you do not wish to have in {{appName}}. Many users find it more helpful to use the "Only import contacts from certain groups" option.',
                            { appName },
                          )}
                          handleClose={() => setShowConfirmAllModal(false)}
                          mutation={submitForm}
                        />
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
              {t('Ok')}
            </Button>
          </DialogActions>
        </>
      </Modal>
    </OuterBox>
  );
};

export default GoogleImport;
