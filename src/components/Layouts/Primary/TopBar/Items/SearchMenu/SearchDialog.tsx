import NextLink from 'next/link';
import { useRouter } from 'next/router';
import React, { ReactElement, useCallback, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import CompassIcon from '@mui/icons-material/Explore';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import {
  Autocomplete,
  Box,
  Dialog,
  IconButton,
  Popper,
  TextField,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { debounce } from 'lodash';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import {
  ContactFilterStatusEnum,
  StatusEnum,
} from 'src/graphql/types.generated';
import { contactPartnershipStatus } from 'src/utils/contacts/contactPartnershipStatus';
import { useAccountListId } from '../../../../../../hooks/useAccountListId';
import { useCreateContactMutation } from '../AddMenu/Items/CreateContact/CreateContact.generated';
import { useGetSearchMenuContactsLazyQuery } from './SearchMenu.generated';

const StyledDialog = styled(Dialog)(() => ({
  '& .MuiPaper-root': {
    position: 'absolute',
    top: 50,
  },
}));

const ClickableBox = styled(Box)(({ theme }) => ({
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme.palette.cruGrayLight.main,
  },
}));

const SearchPopper = styled(Popper)(() => ({
  '& .MuiAutocomplete-option': {
    padding: 0,
  },
}));

interface Option {
  name: string;
  status?: StatusEnum | null;
  icon: ReactElement;
  link: string;
}

interface SearchDialogProps {
  handleClose: () => void;
}

export const SearchDialog: React.FC<SearchDialogProps> = ({ handleClose }) => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { enqueueSnackbar } = useSnackbar();
  const { push } = useRouter();

  //#region Search
  const [wildcardSearch, setWildcardSearch] = useState('');

  const [searchForContacts, { loading, data }] =
    useGetSearchMenuContactsLazyQuery();

  const [createContact] = useCreateContactMutation();

  const handleUpdateWildcardSearch = useCallback(
    debounce(
      (wildcardSearch: string) =>
        searchForContacts({
          variables: {
            accountListId: accountListId ?? '',
            contactsFilter: {
              status: [
                ContactFilterStatusEnum.Active,
                ContactFilterStatusEnum.Null,
                ContactFilterStatusEnum.Hidden,
              ],
              wildcardSearch,
            },
          },
        }),
      1000,
    ),
    [accountListId],
  );

  const defaultOptions: Option[] = [
    {
      name: t('Contacts'),
      icon: <CompassIcon />,
      link: `/accountLists/${accountListId}/contacts`,
    },
    {
      name: t('Tasks'),
      icon: <CompassIcon />,
      link: `/accountLists/${accountListId}/tasks`,
    },
    {
      name: t('Preferences - Manage Accounts'),
      icon: <CompassIcon />,
      link: `/accountLists/${accountListId}/preferences/manageAccounts`,
    },
    {
      name: t('Preferences - Manage Coaches'),
      icon: <CompassIcon />,
      link: `/accountLists/${accountListId}/preferences/coaching`,
    },
    {
      name: t('Preferences - Connect Services'),
      icon: <CompassIcon />,
      link: `/accountLists/${accountListId}/preferences/connectServices`,
    },
    {
      name: t('Reports - Donations'),
      icon: <CompassIcon />,
      link: `/accountLists/${accountListId}/reports/partnerGivingAnalysis`,
    },
    {
      name: t('Reports - Monthly Report (Partner Currency)'),
      icon: <CompassIcon />,
      link: `/accountLists/${accountListId}/reports/partnerCurrency`,
    },
    {
      name: t('Reports - Monthly Report (Salary Currency)'),
      icon: <CompassIcon />,
      link: `/accountLists/${accountListId}/reports/salaryCurrency`,
    },
    {
      name: t('Reports - Designation Accounts'),
      icon: <CompassIcon />,
      link: `/accountLists/${accountListId}/reports/designationAccounts`,
    },
    {
      name: t('Reports - Responsibility Centers'),
      icon: <CompassIcon />,
      link: `/accountLists/${accountListId}/reports/responsibilityCenters`,
    },
    {
      name: t('Reports - Expected Monthly Total'),
      icon: <CompassIcon />,
      link: `/accountLists/${accountListId}/reports/expectedMonthlyTotal`,
    },
    {
      name: t('Reports - Partner Giving Analysis'),
      icon: <CompassIcon />,
      link: `/accountLists/${accountListId}/reports/PartnerGivingAnalysis`,
    },
    {
      name: t('Reports - Coaching'),
      icon: <CompassIcon />,
      link: `/accountLists/${accountListId}/reports/coaching`,
    },
    {
      name: t('Tools'),
      icon: <CompassIcon />,
      link: `/accountLists/${accountListId}/tools`,
    },
    {
      name: t('Coaching'),
      icon: <CompassIcon />,
      link: `/accountLists/${accountListId}/coaching`,
    },
    {
      name: t('Tools - Fix - Commitment Info'),
      icon: <CompassIcon />,
      link: `/accountLists/${accountListId}/tools/fixCommitmentInfo`,
    },
    {
      name: t('Tools - Fix - Mailing Addresses'),
      icon: <CompassIcon />,
      link: `/accountLists/${accountListId}/tools/fixMailingAddresses`,
    },
    {
      name: t('Tools - Fix - Send Newsletter'),
      icon: <CompassIcon />,
      link: `/accountLists/${accountListId}/tools/fixSendNewsletter`,
    },
    {
      name: t('Tools - Fix - Merge Contacts'),
      icon: <CompassIcon />,
      link: `/accountLists/${accountListId}/tools/mergeContacts`,
    },
    {
      name: t('Tools - Fix - Email Addresses'),
      icon: <CompassIcon />,
      link: `/accountLists/${accountListId}/tools/fixEmailAddresses`,
    },
    {
      name: t('Tools - Fix - Phone Numbers'),
      icon: <CompassIcon />,
      link: `/accountLists/${accountListId}/tools/fixPhoneNumbers`,
    },
    {
      name: t('Tools - Fix - Merge People'),
      icon: <CompassIcon />,
      link: `/accountLists/${accountListId}/tools/mergePeople`,
    },
    {
      name: t('Tools - Import - Google'),
      icon: <CompassIcon />,
      link: `/accountLists/${accountListId}/tools/google`,
    },
    {
      name: t('Tools - Import - TntConnect'),
      icon: <CompassIcon />,
      link: `/accountLists/${accountListId}/tools/tntConnect`,
    },
    {
      name: t('Tools - Import - CSV'),
      icon: <CompassIcon />,
      link: `/accountLists/${accountListId}/tools/csv`,
    },
  ];

  const options: Option[] = [
    ...(data?.contacts.nodes.map(({ name, status, id }) => ({
      name,
      status,
      icon: <PersonIcon />,
      link: `/accountLists/${accountListId}/contacts/${id}`,
    })) ?? []),
    ...defaultOptions,
  ];

  const handleCreateContact = async () => {
    const { data } = await createContact({
      variables: {
        accountListId: accountListId ?? '',
        attributes: {
          name: wildcardSearch,
        },
      },
    });
    const contactId = data?.createContact?.contact.id;

    if (contactId) {
      push({
        pathname: '/accountLists/[accountListId]/contacts/[contactId]',
        query: { accountListId, contactId },
      });
    }
    enqueueSnackbar(t('Contact successfully created'), {
      variant: 'success',
    });
  };
  //#endregion

  return (
    <StyledDialog
      fullWidth
      maxWidth="lg"
      open
      onClose={handleClose}
      disableRestoreFocus={true}
    >
      <Box display="flex" justifyContent="center" alignItems="center">
        <Autocomplete
          fullWidth
          multiple
          PopperComponent={SearchPopper}
          loading={loading}
          filterSelectedOptions
          onChange={handleClose}
          getOptionLabel={(option) => option.name}
          renderOption={(props, option) => {
            if (option.link === 'createContact') {
              return (
                <ClickableBox
                  display="flex"
                  width="100%"
                  padding="6px 16px"
                  onClick={handleCreateContact}
                >
                  <Box display="flex" marginRight={1}>
                    {option.icon}
                  </Box>
                  <Box display="flex" flexDirection="column">
                    <Typography>{option.name}</Typography>
                  </Box>
                </ClickableBox>
              );
            }

            return (
              <NextLink href={option.link} passHref>
                <ClickableBox
                  display="flex"
                  width="100%"
                  padding="6px 16px"
                  onClick={handleClose}
                >
                  <Box display="flex" marginRight={1}>
                    {option.icon}
                  </Box>
                  <Box display="flex" flexDirection="column">
                    <Typography>{option.name}</Typography>
                    <Typography variant="subtitle2">
                      {option.status && contactPartnershipStatus[option.status]}
                    </Typography>
                  </Box>
                </ClickableBox>
              </NextLink>
            );
          }}
          options={wildcardSearch !== '' ? options : []}
          filterOptions={(options, params) => {
            if (params.inputValue !== '') {
              if (
                data?.contacts.totalCount &&
                data?.contacts.totalCount > data.contacts.nodes.length
              ) {
                options.splice(5, 0, {
                  name: t(
                    `And ${
                      data?.contacts.totalCount - data.contacts.nodes.length
                    } more`,
                  ),
                  icon: <PeopleIcon />,
                  link: `/accountLists/${accountListId}/contacts?searchTerm=${wildcardSearch}`,
                });
              }
              options.push({
                name: t('Create a new contact for "{{ name }}"', {
                  name: params.inputValue,
                }),
                icon: <AddIcon />,
                link: 'createContact',
              });
            }

            return options;
          }}
          renderInput={(params): ReactElement => (
            <TextField
              {...params}
              fullWidth
              placeholder={t('Type something to start searching')}
              value={wildcardSearch}
              InputProps={{
                ...params.InputProps,
                type: 'search',
                startAdornment: (
                  <IconButton>
                    <SearchIcon />
                  </IconButton>
                ),
                endAdornment: null,
              }}
              onChange={(e) => {
                setWildcardSearch(e.target.value);
                handleUpdateWildcardSearch(e.target.value);
              }}
              // eslint-disable-next-line
              autoFocus
            />
          )}
        />
      </Box>
    </StyledDialog>
  );
};
