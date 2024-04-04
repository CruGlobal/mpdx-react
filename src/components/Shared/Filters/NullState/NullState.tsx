import React, { Dispatch, SetStateAction, useState } from 'react';
import { mdiFormatListBulleted, mdiHome } from '@mdi/js';
import Icon from '@mdi/react';
import { Box, Button, Typography } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import { preloadCreateContact } from 'src/components/Layouts/Primary/TopBar/Items/AddMenu/Items/CreateContact/DynamicCreateContact';
import {
  ContactFilterSetInput,
  TaskFilterSetInput,
} from 'src/graphql/types.generated';
import useTaskModal from '../../../../hooks/useTaskModal';
import theme from '../../../../theme';
import {
  AddMenuItemsEnum,
  renderDialog,
} from '../../../Layouts/Primary/TopBar/Items/AddMenu/AddMenu';
import { NullStateBox } from './NullStateBox';

interface CreateButtonProps {
  page: 'contact' | 'task';
}

const CreateButton: React.FC<CreateButtonProps> = ({ page }) => {
  const { openTaskModal, preloadTaskModal } = useTaskModal();
  const [contactsDialogOpen, setContactsDialogOpen] = useState(false);

  const handleCreateClick = () => {
    if (page === 'task') {
      openTaskModal({ view: 'add' });
    } else {
      setContactsDialogOpen(true);
    }
  };

  const handleCreateHover = () => {
    if (page === 'task') {
      preloadTaskModal('add');
    } else {
      preloadCreateContact();
    }
  };

  return (
    <>
      <Button
        variant="contained"
        onClick={handleCreateClick}
        onMouseEnter={handleCreateHover}
        style={{
          marginLeft: theme.spacing(2),
          color: theme.palette.common.white,
          backgroundColor: theme.palette.mpdxBlue.main,
        }}
      >
        <Trans defaults="Add new {{page}}" values={{ page }} />
      </Button>
      {renderDialog(
        AddMenuItemsEnum.NEW_CONTACT,
        contactsDialogOpen,
        setContactsDialogOpen,
      )}
    </>
  );
};

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
            <CreateButton page={page} />
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
            <CreateButton page={page} />
          </Box>
        </>
      )}
    </NullStateBox>
  );
};

export default NullState;
