import NextLink from 'next/link';
import { useRouter } from 'next/router';
import React, { ReactElement, useCallback, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import {
  Autocomplete,
  Box,
  ButtonBase,
  Dialog,
  IconButton,
  Link,
  Popper,
  TextField,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { debounce } from 'lodash';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import {
  NavPage,
  getNavPages,
} from 'src/components/Layouts/Shared/getNavPages';
import { ContactFilterStatusEnum } from 'src/graphql/types.generated';
import { useLocalizedConstants } from 'src/hooks/useLocalizedConstants';
import { useAccountListId } from '../../../../../../hooks/useAccountListId';
import { useCreateContactMutation } from '../AddMenu/Items/CreateContact/CreateContact.generated';
import { useGetSearchMenuContactsLazyQuery } from './SearchMenu.generated';

const StyledDialog = styled(Dialog)(() => ({
  '& .MuiPaper-root': {
    position: 'absolute',
    top: 50,
  },
}));

const SearchPopper = styled(Popper)(({ theme }) => ({
  '.MuiButtonBase-root': {
    justifyContent: 'left',
  },
  '.MuiLink-root': {
    display: 'flex',
  },
  '.MuiButtonBase-root, .MuiLink-root': {
    alignItems: 'center',
    flex: 1,
    gap: theme.spacing(1),
  },
}));

interface SearchDialogProps {
  handleClose: () => void;
}

export const SearchDialog: React.FC<SearchDialogProps> = ({ handleClose }) => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { enqueueSnackbar } = useSnackbar();
  const { push } = useRouter();
  const { getLocalizedContactStatus } = useLocalizedConstants();

  //#region Search
  const [wildcardSearch, setWildcardSearch] = useState('');

  const [searchForContacts, { loading, data }] =
    useGetSearchMenuContactsLazyQuery();
  const contacts = data?.contacts;

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

  const { searchDialogPages: defaultOptions } = getNavPages(undefined, true);

  const options: NavPage[] = [
    ...(contacts?.nodes.map(({ name, status, id }) => ({
      id,
      title: name,
      status,
      searchIcon: <PersonIcon />,
      href: `/accountLists/${accountListId}/contacts/${id}`,
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
      <Autocomplete
        fullWidth
        PopperComponent={SearchPopper}
        loading={loading}
        filterSelectedOptions
        onChange={(_event, option) => {
          if (option) {
            if (option.href === 'createContact') {
              handleCreateContact();
            } else {
              push(option.href ?? '');
            }
          }

          handleClose();
        }}
        getOptionLabel={(option) => option.title}
        renderOption={(props, option) => {
          const content = (
            <>
              {option.searchIcon}
              <Box display="flex" flexDirection="column">
                <Typography>{option.title}</Typography>
                <Typography variant="body2">
                  {getLocalizedContactStatus(option.status)}
                </Typography>
              </Box>
            </>
          );

          return (
            <li {...props} key={option.id ?? option.title}>
              {option.href === 'createContact' ? (
                <ButtonBase>{content}</ButtonBase>
              ) : (
                <Link
                  component={NextLink}
                  href={option.href ?? ''}
                  underline="none"
                  color="inherit"
                >
                  {content}
                </Link>
              )}
            </li>
          );
        }}
        options={wildcardSearch !== '' ? options : []}
        filterOptions={(options, params) => {
          // Filter pages but not contacts because they were already filtered by the server
          const filteredOptions = options.filter((option) =>
            option.id
              ? true
              : option.title
                  .toLowerCase()
                  .includes(wildcardSearch.toLowerCase()),
          );

          if (contacts && contacts.totalCount > contacts.nodes.length) {
            filteredOptions.splice(contacts.nodes.length, 0, {
              title: t(
                `And ${contacts.totalCount - contacts.nodes.length} more`,
              ),
              searchIcon: <PeopleIcon />,
              href: `/accountLists/${accountListId}/contacts?searchTerm=${encodeURIComponent(
                wildcardSearch,
              )}`,
            });
          }

          if (params.inputValue !== '') {
            filteredOptions.push({
              title: t('Create a new contact for "{{ name }}"', {
                name: params.inputValue,
              }),
              searchIcon: <AddIcon />,
              href: 'createContact',
            });
          }

          return filteredOptions;
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
    </StyledDialog>
  );
};
