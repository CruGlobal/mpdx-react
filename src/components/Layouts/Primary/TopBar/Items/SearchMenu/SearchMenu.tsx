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
import debounce from 'lodash/fp/debounce';
import NextLink from 'next/link';
import { useAccountListId } from '../../../../../../hooks/useAccountListId';
import { StatusEnum } from '../../../../../../../graphql/types.generated';
import { useGetSearchMenuContactsQuery } from './SearchMenu.generated';

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

  const [isOpen, setIsOpen] = useState(false);

  //#region Search
  const [search, setSearch] = useState('');
  const [wildcardSearch, setWildcardSearch] = useState('');

  const { data, loading } = useGetSearchMenuContactsQuery({
    variables: {
      accountListId: accountListId ?? '',
      contactsFilter: {
        wildcardSearch,
      },
    },
    skip: !accountListId,
  });

  const handleUpdateWildcardSearch = useCallback(
    debounce(1000, (searchTerm: string) => {
      setWildcardSearch(searchTerm);
    }),
    [],
  );

  const handleSearch = (searchTerm: string) => {
    // Update input state via non debounced function
    setSearch(searchTerm);
    // Update wildcard search via debounced function
    handleUpdateWildcardSearch(searchTerm);
  };
  const handleClose = () => {
    setIsOpen(false);
    setSearch('');
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
    data?.contacts.nodes.map((contact) => ({
      name: contact.name,
      status: contact.status,
      icon: <PersonIcon />,
      link: `/accountLists/${accountListId}/contacts/${contact.id}`,
    })) ?? [],
    defaultOptions,
  ].flat();
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
            getOptionLabel={(option) => {
              if (typeof option === 'string') {
                return option;
              }

              return option.name;
            }}
            renderOption={(option) => (
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
            )}
            options={search !== '' ? options : []}
            filterOptions={(options, params) => {
              const filtered = filter(options, params);
              if (params.inputValue !== '') {
                if (
                  data?.contacts.totalCount &&
                  data?.contacts.totalCount > 5
                ) {
                  filtered.splice(5, 0, {
                    name: t(`And ${data?.contacts.totalCount - 5} more`),
                    icon: <PeopleIcon />,
                    link: `/accountLists/${accountListId}/contacts?searchTerm=${search}`,
                  });
                }
                filtered.push({
                  name: t(`Create a new contact for "${params.inputValue}"`),
                  icon: <AddIcon />,
                  link: `/accountLists/${accountListId}/contacts`, //temp
                });
              }

              return filtered;
            }}
            renderInput={(params): ReactElement => (
              <TextField
                {...params}
                fullWidth
                placeholder={t('Type something to start searching')}
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
                onChange={(e) => handleSearch(e.target.value)}
              />
            )}
            inputValue={search}
          />
        </Box>
      </SearchDialog>
    </>
  );
  //#endregion
};

export default SearchMenu;
