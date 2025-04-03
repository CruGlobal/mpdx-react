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
  ContactFilterStatusEnum,
  StatusEnum,
} from 'src/graphql/types.generated';
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

interface Option {
  id?: string;
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
      name: t('Preferences'),
      icon: <CompassIcon />,
      link: `/accountLists/${accountListId}/settings/preferences`,
    },
    {
      name: t('Preferences - Notifications'),
      icon: <CompassIcon />,
      link: `/accountLists/${accountListId}/settings/notifications`,
    },
    {
      name: t('Preferences - Connect Services'),
      icon: <CompassIcon />,
      link: `/accountLists/${accountListId}/settings/integrations`,
    },
    {
      name: t('Preferences - Manage Accounts'),
      icon: <CompassIcon />,
      link: `/accountLists/${accountListId}/settings/manageAccounts`,
    },
    {
      name: t('Preferences - Manage Coaches'),
      icon: <CompassIcon />,
      link: `/accountLists/${accountListId}/settings/manageCoaches`,
    },
    {
      name: t('Reports - Donations'),
      icon: <CompassIcon />,
      link: `/accountLists/${accountListId}/reports/donations`,
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
      link: `/accountLists/${accountListId}/reports/financialAccounts`,
    },
    {
      name: t('Reports - Expected Monthly Total'),
      icon: <CompassIcon />,
      link: `/accountLists/${accountListId}/reports/expectedMonthlyTotal`,
    },
    {
      name: t('Reports - Partner Giving Analysis'),
      icon: <CompassIcon />,
      link: `/accountLists/${accountListId}/reports/partnerGivingAnalysis`,
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
      name: t('Tools - Appeals'),
      icon: <CompassIcon />,
      link: `/accountLists/${accountListId}/tools/appeals`,
    },
    {
      name: t('Tools - Fix Commitment Info'),
      icon: <CompassIcon />,
      link: `/accountLists/${accountListId}/tools/fix/commitmentInfo`,
    },
    {
      name: t('Tools - Fix Mailing Addresses'),
      icon: <CompassIcon />,
      link: `/accountLists/${accountListId}/tools/fix/mailingAddresses`,
    },
    {
      name: t('Tools - Fix Send Newsletter'),
      icon: <CompassIcon />,
      link: `/accountLists/${accountListId}/tools/fix/sendNewsletter`,
    },
    {
      name: t('Tools - Merge Contacts'),
      icon: <CompassIcon />,
      link: `/accountLists/${accountListId}/tools/merge/contacts`,
    },
    {
      name: t('Tools - Fix Email Addresses'),
      icon: <CompassIcon />,
      link: `/accountLists/${accountListId}/tools/fix/emailAddresses`,
    },
    {
      name: t('Tools - Fix Phone Numbers'),
      icon: <CompassIcon />,
      link: `/accountLists/${accountListId}/tools/fix/phoneNumbers`,
    },
    {
      name: t('Tools - Merge People'),
      icon: <CompassIcon />,
      link: `/accountLists/${accountListId}/tools/merge/people`,
    },
    {
      name: t('Tools - Import from Google'),
      icon: <CompassIcon />,
      link: `/accountLists/${accountListId}/tools/import/google`,
    },
    {
      name: t('Tools - Import from TntConnect'),
      icon: <CompassIcon />,
      link: `/accountLists/${accountListId}/tools/import/tntConnect`,
    },
    {
      name: t('Tools - Import from CSV'),
      icon: <CompassIcon />,
      link: `/accountLists/${accountListId}/tools/import/csv`,
    },
    {
      name: t('Coaching'),
      icon: <CompassIcon />,
      link: `/accountLists/${accountListId}/coaching`,
    },
  ];

  const options: Option[] = [
    ...(contacts?.nodes.map(({ name, status, id }) => ({
      id,
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
      <Autocomplete
        fullWidth
        PopperComponent={SearchPopper}
        loading={loading}
        filterSelectedOptions
        onChange={(_event, option) => {
          if (option) {
            if (option.link === 'createContact') {
              handleCreateContact();
            } else {
              push(option.link);
            }
          }

          handleClose();
        }}
        getOptionLabel={(option) => option.name}
        renderOption={(props, option) => {
          const content = (
            <>
              {option.icon}
              <Box display="flex" flexDirection="column">
                <Typography>{option.name}</Typography>
                <Typography variant="body2">
                  {getLocalizedContactStatus(option.status)}
                </Typography>
              </Box>
            </>
          );

          return (
            <li {...props} key={option.id ?? option.name}>
              {option.link === 'createContact' ? (
                <ButtonBase>{content}</ButtonBase>
              ) : (
                <Link
                  component={NextLink}
                  href={option.link}
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
          if (params.inputValue !== '') {
            if (contacts && contacts.totalCount > contacts.nodes.length) {
              options.splice(5, 0, {
                name: t(
                  `And ${contacts.totalCount - contacts.nodes.length} more`,
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
    </StyledDialog>
  );
};
