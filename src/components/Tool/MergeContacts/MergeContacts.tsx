import React, { useMemo, useState } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { Trans, useTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';
import { SetContactFocus } from 'pages/accountLists/[accountListId]/tools/useToolsHelper';
import { useMassActionsMergeMutation } from 'src/components/Contacts/MassActions/Merge/MassActionsMerge.generated';
import { TypeEnum } from 'src/graphql/types.generated';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import theme from '../../../theme';
import { useUpdateDuplicateMutation } from '../MergePeople/GetPersonDuplicates.generated';
import NoData from '../NoData';
import { StyledFabLoading } from '../StyledFabLoading';
import { ToolsGridContainer } from '../styledComponents';
import ContactPair from './ContactPair';
import { useGetContactDuplicatesQuery } from './GetContactDuplicates.generated';
import { StickyConfirmButtons } from './StickyConfirmButtons';
import { bulkUpdateDuplicates } from './mergeDuplicatesHelper';

const useStyles = makeStyles()(() => ({
  outer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  descriptionBox: {
    marginBottom: theme.spacing(1),
  },
}));

export interface ActionType {
  action: string;
  mergeId?: string;
}

interface Props {
  accountListId: string;
  contactId?: string;
  setContactFocus: SetContactFocus;
}

const MergeContacts: React.FC<Props> = ({
  accountListId,
  contactId,
  setContactFocus,
}: Props) => {
  const { classes } = useStyles();
  const [actions, setActions] = useState<Record<string, ActionType>>({});
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { data, loading } = useGetContactDuplicatesQuery({
    variables: {
      accountListId,
      contactIds: contactId ? [contactId] : undefined,
    },
  });
  const { appName } = useGetAppSettings();
  const [contactsMerge, { loading: updating }] = useMassActionsMergeMutation();
  const [updateDuplicates] = useUpdateDuplicateMutation();
  const disabled = useMemo(
    () => updating || !Object.entries(actions).length,
    [actions, updating],
  );
  const totalCount = data?.contactDuplicates.totalCount || 0;
  const duplicatesDisplayedCount = data?.contactDuplicates.nodes.length || 0;

  const updateActions = (
    id1: string,
    id2: string,
    duplicateId: string,
    action: string,
  ): void => {
    if (!updating) {
      if (action === 'ignore') {
        setActions((prevState) => ({
          ...prevState,
          [id1]: { action: '' },
          [id2]: { action: '' },
          [duplicateId]: { action: 'ignore' },
        }));
      } else {
        setActions((prevState) => ({
          ...prevState,
          [id1]: { action: 'merge', mergeId: id2 },
          [id2]: { action: 'delete' },
        }));
      }
    }
  };

  const handleSubmit = () => {
    bulkUpdateDuplicates(
      TypeEnum.Contact,
      actions,
      contactsMerge,
      updateDuplicates,
      enqueueSnackbar,
      t,
    );
  };

  return (
    <Box
      className={classes.outer}
      display="flex"
      flexDirection="column"
      data-testid="Home"
    >
      {!loading && data && (
        <ToolsGridContainer container spacing={3}>
          {duplicatesDisplayedCount ? (
            <>
              <Grid item xs={12}>
                <Box
                  className={classes.descriptionBox}
                  data-testid="ContactMergeDescription"
                >
                  <Typography>
                    <Trans
                      defaults="You have <bold>{{totalCount}}</bold> possible duplicate contacts. This is sometimes caused when you imported data into {{appName}}. We recommend reconciling these as soon as possible. Please select the duplicate that should win the merge. No data will be lost. "
                      shouldUnescape
                      values={{
                        totalCount,
                        appName,
                      }}
                      components={{ bold: <strong /> }}
                    />
                  </Typography>
                  <Typography>
                    <strong>{t('This cannot be undone.')}</strong>
                  </Typography>
                </Box>
              </Grid>
              <StickyConfirmButtons
                accountListId={accountListId}
                duplicatesDisplayedCount={duplicatesDisplayedCount}
                disabled={disabled}
                totalCount={totalCount}
                confirmAction={handleSubmit}
                setActions={setActions}
              />
              <Grid item xs={12} sx={{ margin: '15px 2px 20px 2px' }}>
                {data?.contactDuplicates.nodes.map((duplicate) => (
                  <ContactPair
                    key={duplicate.id}
                    duplicateId={duplicate.id}
                    contact1={duplicate.recordOne}
                    contact2={duplicate.recordTwo}
                    update={updateActions}
                    updating={updating}
                    setContactFocus={setContactFocus}
                  />
                ))}
              </Grid>
            </>
          ) : (
            <NoData tool="mergeContacts" />
          )}
        </ToolsGridContainer>
      )}
      {(loading || updating) && <StyledFabLoading />}
    </Box>
  );
};

export default MergeContacts;
