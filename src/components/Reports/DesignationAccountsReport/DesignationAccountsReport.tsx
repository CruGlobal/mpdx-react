import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, CircularProgress } from '@material-ui/core';
import { useDesignationAccountsQuery } from './GetDesignationAccounts.generated';
import { useSetActiveDesignationAccountMutation } from './SetActiveDesignationAccount.generated';
import { DesignationAccountsHeader as Header } from './Layout/Header/Header';
import { DesignationAccountsList as List } from './Layout/List/List';
import { Notification } from 'src/components/Notification/Notification';
import { EmptyReport } from 'src/components/Reports/EmptyReport/EmptyReport';

interface Props {
  accountListId: string;
  isNavListOpen: boolean;
  onNavListToggle: () => void;
  title: string;
}

export const DesignationAccountsReport: React.FC<Props> = ({
  accountListId,
  isNavListOpen,
  onNavListToggle,
  title,
}) => {
  const { t } = useTranslation();

  const { data, loading, error, refetch } = useDesignationAccountsQuery({
    variables: {
      accountListId,
    },
  });

  const [
    setActiveDesignationAccount,
  ] = useSetActiveDesignationAccountMutation();

  const handleCheckToggle = async (
    event: React.ChangeEvent<HTMLInputElement>,
    designationAccountId: string,
  ) => {
    await setActiveDesignationAccount({
      variables: {
        input: {
          accountListId,
          active: event.target.checked,
          designationAccountId,
        },
      },
    });

    return refetch();
  };

  return (
    <Box>
      <Header
        isNavListOpen={isNavListOpen}
        onNavListToggle={onNavListToggle}
        title={title}
      />
      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100%"
        >
          <CircularProgress data-testid="LoadingDesignationAccounts" />
        </Box>
      ) : error ? (
        <Notification type="error" message={error.toString()} />
      ) : data?.designationAccounts.length === 0 ? (
        <EmptyReport
          title={t('You have no designation accounts')}
          subTitle={t(
            'You can setup an organization account to import your designation accounts.',
          )}
        />
      ) : (
        data?.designationAccounts.map((designationAccountGroup) => (
          <List
            key={designationAccountGroup.organizationName}
            designationAccountsGroup={designationAccountGroup}
            onCheckToggle={handleCheckToggle}
          />
        ))
      )}
    </Box>
  );
};
