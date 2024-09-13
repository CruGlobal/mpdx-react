import React from 'react';
import Close from '@mui/icons-material/Close';
import {
  Box,
  BoxProps,
  IconButton,
  List,
  Slide,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Session } from 'next-auth';
import { useTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';
import { useGetDesignationAccountsQuery } from 'src/components/EditDonationModal/EditDonationModal.generated';
import { FilterListItemMultiselect } from 'src/components/Shared/Filters/FilterListItemMultiselect';
import { MultiselectFilter } from 'src/graphql/types.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useRequiredSession } from 'src/hooks/useRequiredSession';
import { Item } from './Item/Item';
import { useManageOrganizationsAccessQuery } from './MultiPageMenu.generated';
import {
  NavItems,
  reportNavItems,
  settingsNavItems,
} from './MultiPageMenuItems';

export enum NavTypeEnum {
  Reports = 'reports',
  Settings = 'settings',
}

interface Props {
  selectedId: string;
  isOpen: boolean;
  onClose: () => void;
  navType: NavTypeEnum;
  designationAccounts?: string[];
  setDesignationAccounts?: (designationAccounts: string[]) => void;
}

const useStyles = makeStyles()(() => ({
  root: {
    overflow: 'hidden',
  },
}));

const FilterHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: '1px solid',
  borderBottomColor: theme.palette.grey[200],
}));

const FilterList = styled(List)(({ theme }) => ({
  '& .MuiListItemIcon-root': {
    minWidth: '37px',
  },
  '& .FilterListItemMultiselect-root': {
    marginBottom: theme.spacing(2),
  },
}));

type ShowMenuItemProps = {
  item: NavItems;
  user: Session['user'];
  hasOrganizationsAccess: boolean;
};

const showMenuItem = ({
  item,
  user,
  hasOrganizationsAccess,
}: ShowMenuItemProps): boolean => {
  if (item?.grantedAccess?.length) {
    if (hasOrganizationsAccess && item.id.startsWith('organizations')) {
      return true;
    }
    if (item.grantedAccess.indexOf('admin') !== -1 && user.admin) {
      return true;
    }
    if (item.grantedAccess.indexOf('developer') !== -1 && user.developer) {
      return true;
    }
  } else {
    return true;
  }
  return false;
};

export const MultiPageMenu: React.FC<Props & BoxProps> = ({
  selectedId,
  isOpen,
  onClose,
  navType,
  designationAccounts,
  setDesignationAccounts,
  ...BoxProps
}) => {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const user = useRequiredSession();
  const navItems =
    navType === NavTypeEnum.Reports ? reportNavItems : settingsNavItems;
  const navTitle =
    navType === NavTypeEnum.Reports ? t('Reports') : t('Settings');

  const { data: organizations } = useManageOrganizationsAccessQuery({
    skip: navType === NavTypeEnum.Reports,
  });
  const hasOrganizationsAccess =
    !!organizations?.user.administrativeOrganizations.nodes.length;

  const { data } = useGetDesignationAccountsQuery({
    variables: {
      accountListId: accountListId ?? '',
    },
    skip: !designationAccounts && !setDesignationAccounts,
  });
  const accounts =
    data?.designationAccounts
      .flatMap((group) => group.designationAccounts)
      .map((account) => ({
        name: account.name
          ? account.name
          : account.designationNumber
          ? account.designationNumber
          : '',
        value: account.id,
        placeholder: null,
      })) ?? [];

  const filter: MultiselectFilter = {
    filterKey: 'designation_account_id',
    title: 'Designation Account',
    options: accounts,
  };

  return (
    <Box data-testid="MultiPageMenu" {...BoxProps}>
      <div className={classes.root}>
        <Slide in={isOpen} direction="right" mountOnEnter unmountOnExit>
          <Box>
            <FilterHeader>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="h6">{navTitle}</Typography>
                <IconButton onClick={onClose}>
                  <Close titleAccess={t('Close')} />
                </IconButton>
              </Box>
            </FilterHeader>
            <FilterList dense>
              {designationAccounts &&
                setDesignationAccounts &&
                accounts.length > 1 && (
                  <FilterListItemMultiselect
                    filter={filter}
                    selected={designationAccounts}
                    onUpdate={(value) => {
                      setDesignationAccounts(value ?? []);
                    }}
                  />
                )}
              {navItems.map((item) => {
                if (!showMenuItem({ item, user, hasOrganizationsAccess })) {
                  return null;
                }
                return (
                  <Item
                    key={item.id}
                    item={item}
                    selectedId={selectedId}
                    navType={navType}
                  />
                );
              })}
            </FilterList>
          </Box>
        </Slide>
      </div>
    </Box>
  );
};
