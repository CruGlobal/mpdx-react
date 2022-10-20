import React, { ReactElement, useCallback, useState } from 'react';
import {
  Box,
  IconButton,
  styled,
  Dialog,
  TextField,
  Typography,
  Popper,
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import { useTranslation } from 'react-i18next';
import CompassIcon from '@material-ui/icons/Explore';
import PersonIcon from '@material-ui/icons/Person';
import PeopleIcon from '@material-ui/icons/People';
import AddIcon from '@material-ui/icons/Add';
import { Autocomplete, createFilterOptions } from '@material-ui/lab';
import debounce from 'lodash/debounce';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { useAccountListId } from '../../../../../../hooks/useAccountListId';
import {
  ContactFilterStatusEnum,
  StatusEnum,
} from '../../../../../../../graphql/types.generated';
import { useCreateContactMutation } from '../AddMenu/Items/CreateContact/CreateContact.generated';
import { useGetSearchMenuContactsLazyQuery } from './SearchMenu.generated';

const SearchDialog = styled(Dialog)(() => ({
  '& .MuiPaper-root': {
    position: 'absolute',
    top: 50,
  },
}));

const SearchPopper = styled(Popper)(() => ({
  '& .MuiAutocomplete-option': {
    padding: 0,
  },
}));

const SearchButton = styled(IconButton)(() => ({
  textTransform: 'none',
  color: 'rgba(255,255,255,0.75)',
  transition: 'color 0.2s ease-in-out',
  '&:hover': {
    color: 'rgba(255,255,255,1)',
  },
}));

interface Option {
  name: string;
  status?: StatusEnum | null;
  icon: ReactElement;
  link: string;
}

const SearchMenu = (): ReactElement => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { enqueueSnackbar } = useSnackbar();
  const { push } = useRouter();

  const [isOpen, setIsOpen] = useState(false);

  //#region Search
  const [wildcardSearch, setWildcardSearch] = useState('');

  const [
    searchForContacts,
    { loading, data },
  ] = useGetSearchMenuContactsLazyQuery();

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
    [],
  );

  const handleClose = () => {
    setIsOpen(false);
    setWildcardSearch('');
  };

  const filter = createFilterOptions<Option>({ limit: 5 });

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
      link: `/accountLists/${accountListId}/reports/PartnerGivingAnalysis`,
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

  //#region JSX
  return (
    <>
      <SearchButton
        aria-controls="search-menu"
        aria-haspopup="true"
        onClick={() => setIsOpen(true)}
      >
        <SearchIcon />
      </SearchButton>

      <SearchDialog fullWidth maxWidth="lg" open={isOpen} onClose={handleClose}>
        <Box display="flex" justifyContent="center" alignItems="center">
          <Autocomplete
            fullWidth
            freeSolo
            PopperComponent={SearchPopper}
            loading={loading}
            filterSelectedOptions
            onChange={handleClose}
            getOptionLabel={(option) => option.name}
            renderOption={(option) => {
              if (option.link === 'createContact') {
                return (
                  <Box
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
                  </Box>
                );
              }

              return (
                <NextLink href={option.link} passHref>
                  <Box display="flex" width="100%" padding="6px 16px">
                    <Box display="flex" marginRight={1}>
                      {option.icon}
                    </Box>
                    <Box display="flex" flexDirection="column">
                      <Typography>{option.name}</Typography>
                      <Typography variant="subtitle2">
                        {option.status && t(option.status)}
                      </Typography>
                    </Box>
                  </Box>
                </NextLink>
              );
            }}
            options={wildcardSearch !== '' ? options : []}
            filterOptions={(options, params) => {
              const filtered = filter(options, params);
              if (params.inputValue !== '') {
                if (
                  data?.contacts.totalCount &&
                  data?.contacts.totalCount > data.contacts.nodes.length
                ) {
                  filtered.splice(5, 0, {
                    name: t(
                      `And ${
                        data?.contacts.totalCount - data.contacts.nodes.length
                      } more`,
                    ),
                    icon: <PeopleIcon />,
                    link: `/accountLists/${accountListId}/contacts?searchTerm=${wildcardSearch}`,
                  });
                }
                filtered.push({
                  name: t(`Create a new contact for "${params.inputValue}"`),
                  icon: <AddIcon />,
                  link: 'createContact',
                });
              }

              return filtered;
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
      </SearchDialog>
    </>
  );
  //#endregion
};

export default SearchMenu;
