import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  NativeSelect,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import { Trans, useTranslation } from 'react-i18next';
import { SetContactFocus } from 'pages/accountLists/[accountListId]/tools/useToolsHelper';
import {
  PersonInvalidEmailFragment,
  useGetInvalidEmailAddressesQuery,
  useUpdateEmailAddressesMutation,
} from 'src/components/Tool/FixEmailAddresses/FixEmailAddresses.generated';
import { PersonEmailAddressInput } from 'src/graphql/types.generated';
import theme from '../../../theme';
import { ConfirmButtonIcon } from '../ConfirmButtonIcon';
import NoData from '../NoData';
import { StyledInput } from '../StyledInput';
import { FixEmailAddressPerson } from './FixEmailAddressPerson/FixEmailAddressPerson';

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

export interface EmailAddressData {
  id: string;
  primary: boolean;
  updatedAt: string;
  source: string;
  email: string;
  destroy?: boolean;
}

export interface PersonEmailAddresses {
  emailAddresses: EmailAddressData[];
}

interface FixEmailAddressesProps {
  accountListId: string;
  setContactFocus: SetContactFocus;
}

export const FixEmailAddresses: React.FC<FixEmailAddressesProps> = ({
  accountListId,
  setContactFocus,
}) => {
  const [defaultSource, setDefaultSource] = useState('MPDX');
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const { data, loading } = useGetInvalidEmailAddressesQuery({
    variables: { accountListId },
  });
  const [updateEmailAddressesMutation] = useUpdateEmailAddressesMutation();

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
                },
              }),
              {},
            )
          : {},
      ),
    [loading, data],
  );

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

  // Change the primary address in the state
  const handleChangePrimary = (personId: string, emailIndex: number): void => {
    const temp = { ...dataState };
    if (temp[personId]) {
      temp[personId].emailAddresses = temp[personId].emailAddresses.map(
        (email, index) => ({
          ...email,
          primary: index === emailIndex,
        }),
      );
    }
    setDataState(temp);
  };

  const handleSourceChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    setDefaultSource(event.target.value);
  };

  const handleSingleConfirm = async (
    person: PersonInvalidEmailFragment,
    emails: EmailAddressData[],
  ) => {
    const personName = `${person.firstName} ${person.lastName}`;
    const emailAddresses = [] as PersonEmailAddressInput[];
    emails.map((emailAddress) => {
      emailAddresses.push({
        email: emailAddress.email,
        id: emailAddress.id,
        primary: emailAddress.primary,
        validValues: true,
      });
    });

    await updateEmailAddressesMutation({
      variables: {
        input: {
          accountListId,
          attributes: {
            id: person.id,
            emailAddresses,
          },
        },
      },
      update: (cache) => {
        cache.evict({ id: `Person:${person.id}` });
      },
      onCompleted: () => {
        enqueueSnackbar(
          t(`Successfully updated email addresses for ${personName}`),
          {
            variant: 'success',
          },
        );
      },
      onError: () => {
        enqueueSnackbar(t(`Error updating email addresses for ${personName}`), {
          variant: 'error',
          autoHideDuration: 7000,
        });
      },
    });
  };

  return (
    <Container>
      {!loading && data && dataState ? (
        <FixEmailAddressesWrapper container>
          <Grid item xs={12}>
            <Typography variant="h4">{t('Fix Email Addresses')}</Typography>
            <ContentDivider />
            <Box mb={2}>
              {data.people.nodes.length && (
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
                      onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                        handleSourceChange(event)
                      }
                    >
                      <option value="MPDX">MPDX</option>
                      <option value="DataServer">DataServer</option>
                    </SourceSelect>
                    <ConfirmButton>
                      <ConfirmButtonIcon />
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
                    person={person}
                    key={person.id}
                    dataState={dataState}
                    accountListId={accountListId}
                    handleChange={handleChange}
                    handleChangePrimary={handleChangePrimary}
                    handleSingleConfirm={handleSingleConfirm}
                    setContactFocus={setContactFocus}
                  />
                ))}
              </Grid>
              <Grid item xs={12}>
                <Box width="100%" display="flex" justifyContent="center">
                  <Typography>
                    <Trans
                      defaults="Showing <bold>{{value}}</bold> of <bold>{{value}}</bold>"
                      shouldUnescape
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
        <CircularProgress
          data-testid="loading"
          style={{ marginTop: theme.spacing(3) }}
        />
      )}
    </Container>
  );
};
