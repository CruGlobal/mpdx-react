import React, { Dispatch, SetStateAction, useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { mdiFormatListBulleted, mdiHome } from '@mdi/js';
import Icon from '@mdi/react';
import { Trans, useTranslation } from 'react-i18next';
import {
  ContactFilterSetInput,
  TaskFilterSetInput,
} from '../../../../../graphql/types.generated';
import useTaskModal from '../../../../../src/hooks/useTaskModal';
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
  const { openTaskModal } = useTaskModal();
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
              defaults="You have {{count}} total {{page}}s"
              values={{ count: totalCount, page }}
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
                  ? () => openTaskModal({})
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
              defaults="Looks like you haven't added any {{page}}s yet"
              values={{ page }}
            />
          </Typography>
          <Typography>
            <Trans
              defaults="You can import {{page}}s from another service or add a new {{page}}."
              values={{ page }}
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
                  ? () => openTaskModal({})
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
