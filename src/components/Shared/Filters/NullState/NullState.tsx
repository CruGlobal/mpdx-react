import React, { Dispatch, SetStateAction, useState } from 'react';
import { Box, Typography, Button } from '@material-ui/core';
import { mdiFormatListBulleted, mdiHome } from '@mdi/js';
import Icon from '@mdi/react';
import { Trans, useTranslation } from 'react-i18next';
import {
  ContactFilterSetInput,
  TaskFilterSetInput,
} from '../../../../../graphql/types.generated';
import useTaskDrawer from '../../../../../src/hooks/useTaskDrawer';
import theme from '../../../../theme';
import { renderDialog } from '../../../Layouts/Primary/TopBar/Items/AddMenu/AddMenu';
import { NullStateBox } from './NullStateBox';

interface Props {
  page: 'contact' | 'task';
  totalCount: number;
  filtered: boolean;
  changeFilters:
    | Dispatch<SetStateAction<TaskFilterSetInput>>
    | Dispatch<SetStateAction<ContactFilterSetInput>>;
}

const NullState: React.FC<Props> = ({
  page,
  totalCount,
  filtered,
  changeFilters,
}: Props) => {
  const { t } = useTranslation();
  const { openTaskDrawer } = useTaskDrawer();
  const [dialogOpen, changeDialogOpen] = useState(false);

  return (
    <NullStateBox data-testid={`${page}-null-state`}>
      <Icon
        path={page === 'contact' ? mdiHome : mdiFormatListBulleted}
        size={1.5}
      />
      {filtered ? (
        <>
          <Typography variant="h5">
            <Trans
              defaults="You have {{count}} total {{page}}"
              values={{
                count: totalCount,
                page: totalCount === 1 ? page : page + 's',
              }}
            />
          </Typography>
          <Typography>
            {t(
              'Unfortunately none of them match your current search or filters.',
            )}
          </Typography>
          <Box display="flex" mt={1}>
            <Button variant="contained" onClick={() => changeFilters({})}>
              {t('Reset All Search Filters')}
            </Button>
            <Button
              variant="contained"
              onClick={
                page === 'task'
                  ? () => openTaskDrawer({})
                  : () => changeDialogOpen(true)
              }
              style={{
                marginLeft: theme.spacing(2),
                color: theme.palette.common.white,
                backgroundColor: theme.palette.mpdxBlue.main,
              }}
            >
              <Trans defaults="Add new {{page}}" values={{ page }} />
            </Button>
          </Box>
        </>
      ) : (
        <>
          <Typography variant="h5">
            <Trans
              defaults="Looks like you haven't added any {{page}} yet"
              values={{ page: page + 's' }}
            />
          </Typography>
          <Typography>
            <Trans
              defaults="You can import {{plural}} from another service or add a new {{singular}}."
              values={{ singular: page, plural: page + 's' }}
            />
          </Typography>
          <Box display="flex" mt={1}>
            <Button variant="contained">
              <Trans defaults="Import {{page}}s" values={{ page }} />
            </Button>
            <Button
              variant="contained"
              onClick={
                page === 'task'
                  ? () => openTaskDrawer({})
                  : () => changeDialogOpen(true)
              }
              style={{
                marginLeft: theme.spacing(2),
                color: theme.palette.common.white,
                backgroundColor: theme.palette.mpdxBlue.main,
              }}
            >
              <Trans defaults="Add new {{page}}" values={{ page }} />
            </Button>
          </Box>
        </>
      )}
      {renderDialog(0, dialogOpen, changeDialogOpen)}
    </NullStateBox>
  );
};

export default NullState;
