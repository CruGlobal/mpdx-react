import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Divider,
  Button,
  NativeSelect,
  styled,
  CircularProgress,
} from '@material-ui/core';

import { Trans, useTranslation } from 'react-i18next';

import Icon from '@mdi/react';
import { mdiCheckboxMarkedCircle } from '@mdi/js';
import { PersonEmailAddressInput } from '../../../../graphql/types.generated';
import theme from '../../../theme';
import { StyledInput } from '../FixCommitmentInfo/StyledInput';
import NoData from '../NoData';
import DeleteModal from './DeleteModal';
import { useGetInvalidEmailAddressesQuery } from './GetInvalidEmailAddresses.generated';
import { FixEmailAddressPerson } from './FixEmailAddressPerson';

const Container = styled(Box)(() => ({
  padding: theme.spacing(3),
  overflow: 'auto',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}));

const FixEmailAddressesWrapper = styled(Grid)(() => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'end',
  width: '70%',
  [theme.breakpoints.down('sm')]: {
    width: '100%',
  },
}));

const SourceSelect = styled(NativeSelect)(() => ({
  minWidth: theme.spacing(20),
  width: '10%',
  marginLeft: theme.spacing(2),
  marginRight: theme.spacing(2),
  [theme.breakpoints.down('xs')]: {
    marginLeft: theme.spacing(0),
    marginRight: theme.spacing(0),
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
}));

const ContentDivider = styled(Divider)(() => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const ConfirmButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.mpdxBlue.main,
  paddingRight: theme.spacing(1.5),
  color: 'white',
  [theme.breakpoints.down('xs')]: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  '&:hover': {
    backgroundColor: theme.palette.mpdxBlue.main,
  },
}));

export const ConfirmButtonIcon = styled(Icon)(({ theme }) => ({
  marginRight: theme.spacing(1),
}));

const DefaultSourceWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  flexWrap: 'wrap',
  marginTop: theme.spacing(1),
  [theme.breakpoints.down('xs')]: {
    flexDirection: 'column',
    alignItems: 'start',
  },
}));

export interface ModalState {
  open: boolean;
  personId: string;
  emailIndex: number;
  emailAddress: string;
}

const defaultDeleteModalState = {
  open: false,
  personId: '',
  emailIndex: 0,
  emailAddress: '',
};

export interface EmailAddressData {
  id?: string;
  primary: boolean;
  updatedAt: string;
  source: string;
  email: string;
  destroy?: boolean;
}

interface PersonEmailAddresses {
  emailAddresses: EmailAddressData[];
  toDelete: PersonEmailAddressInput[];
}

interface FixEmailAddressesProps {
  accountListId: string;
}

export const FixEmailAddresses: React.FC<FixEmailAddressesProps> = ({
  accountListId,
}) => {
  const [defaultSource, setDefaultSource] = useState('MPDX');
  const [deleteModalState, setDeleteModalState] = useState<ModalState>(
    defaultDeleteModalState,
  );
  const { t } = useTranslation();

  const { data, loading } = useGetInvalidEmailAddressesQuery({
    variables: { accountListId },
  });

  const [dataState, setDataState] = useState<{
    [key: string]: PersonEmailAddresses;
  }>({});

  // Create a mutable copy of the query data and store in the state
  useEffect(
    () =>
      setDataState(
        data
          ? data.people.nodes?.reduce<{ [key: string]: PersonEmailAddresses }>(
              (map, person) => ({
                ...map,
                [person.id]: {
                  emailAddresses: person.emailAddresses.nodes.map(
                    (emailAddress) => ({
                      id: emailAddress.id,
                      primary: emailAddress.primary,
                      updatedAt: emailAddress.updatedAt,
                      source: emailAddress.source,
                      email: emailAddress.email,
                    }),
                  ),
                  toDelete: [],
                },
              }),
              {},
            )
          : {},
      ),
    [loading],
  );

  const handleDeleteModalOpen = (
    personId: string,
    emailIndex: number,
  ): void => {
    setDeleteModalState({
      open: true,
      personId: personId,
      emailIndex: emailIndex,
      emailAddress: dataState[personId].emailAddresses[emailIndex].email,
    });
  };

  const handleDeleteModalClose = (): void => {
    setDeleteModalState(defaultDeleteModalState);
  };

  // Update the state with the textfield's value
  const handleChange = (
    personId: string,
    numberIndex: number,
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const temp = { ...dataState };
    dataState[personId].emailAddresses[numberIndex].email = event.target.value;
    setDataState(temp);
  };

  // Delete function called after confirming with the delete modal
  const handleDelete = (): void => {
    const temp = { ...dataState };
    const deleting = temp[deleteModalState.personId].emailAddresses.splice(
      deleteModalState.emailIndex,
      1,
    )[0];
    deleting.destroy = true;
    deleting.primary &&
      (temp[deleteModalState.personId].emailAddresses[0].primary = true); // If the deleted email was primary, set the new first index to primary
    deleting.id &&
      temp[deleteModalState.personId].toDelete.push({
        destroy: true,
        id: deleting.id,
      }); //Only destroy the email if it already exists (has an ID)
    setDataState(temp);
    handleDeleteModalClose();
  };

  // Add a new email address to the state
  const handleAdd = (personId: string, email: string): void => {
    const temp = { ...dataState };
    temp[personId].emailAddresses.push({
      updatedAt: new Date().toISOString(),
      email: email,
      primary: false,
      source: 'MPDX',
    });
    setDataState(temp);
  };

  // Change the primary address in the state
  const handleChangePrimary = (personId: string, emailIndex: number): void => {
    const temp = { ...dataState };
    temp[personId].emailAddresses = temp[personId].emailAddresses.map(
      (email, index) => ({
        ...email,
        primary: index === emailIndex ? true : false,
      }),
    );
    setDataState(temp);
  };

  const handleSourceChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    setDefaultSource(event.target.value);
  };

  return (
    <>
      <Container>
        {!loading && data && dataState ? (
          <FixEmailAddressesWrapper container>
            <Grid item xs={12}>
              <Typography variant="h4">{t('Fix Email Addresses')}</Typography>
              <ContentDivider />
              <Box mb={2}>
                {data.people.nodes.length > 0 && (
                  <>
                    <Typography>
                      <strong>
                        {t('You have {{amount}} email addresses to confirm.', {
                          amount: data.people.nodes.length,
                        })}
                      </strong>
                    </Typography>
                    <Typography>
                      {t(
                        'Choose below which email address will be set as primary.',
                      )}
                    </Typography>
                    <DefaultSourceWrapper>
                      <Typography>{t('Default Primary Source:')}</Typography>

                      <SourceSelect
                        input={<StyledInput />}
                        value={defaultSource}
                        onChange={(
                          event: React.ChangeEvent<HTMLSelectElement>,
                        ) => handleSourceChange(event)}
                      >
                        <option value="MPDX">MPDX</option>
                        <option value="DataServer">DataServer</option>
                      </SourceSelect>
                      <ConfirmButton>
                        <ConfirmButtonIcon
                          path={mdiCheckboxMarkedCircle}
                          size={0.8}
                        />
                        {t('Confirm {{amount}} as {{source}}', {
                          amount: data.people.nodes.length,
                          source: defaultSource,
                        })}
                      </ConfirmButton>
                    </DefaultSourceWrapper>
                  </>
                )}
              </Box>
            </Grid>
            {data.people.nodes.length > 0 ? (
              <>
                <Grid item xs={12}>
                  {data?.people.nodes.map((person) => (
                    <FixEmailAddressPerson
                      name={`${person.firstName} ${person.lastName}`}
                      key={person.id}
                      personId={person.id}
                      emails={dataState[person.id]?.emailAddresses || []}
                      toDelete={dataState[person.id]?.toDelete}
                      handleChange={handleChange}
                      handleDelete={handleDeleteModalOpen}
                      handleAdd={handleAdd}
                      handleChangePrimary={handleChangePrimary}
                    />
                  ))}
                </Grid>
                <Grid item xs={12}>
                  <Box width="100%" display="flex" justifyContent="center">
                    <Typography>
                      <Trans
                        defaults="Showing <bold>{{value}}</bold> of <bold>{{value}}</bold>"
                        values={{ value: data.people.nodes.length }}
                        components={{ bold: <strong /> }}
                      />
                    </Typography>
                  </Box>
                </Grid>
              </>
            ) : (
              <NoData tool="fixEmailAddresses" />
            )}
          </FixEmailAddressesWrapper>
        ) : (
          <CircularProgress style={{ marginTop: theme.spacing(3) }} />
        )}
        <DeleteModal
          modalState={deleteModalState}
          handleClose={handleDeleteModalClose}
          handleDelete={handleDelete}
        />
      </Container>
    </>
  );
};
