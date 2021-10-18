import React, { useState } from 'react';
import { Box, Typography, styled, Button } from '@material-ui/core';
import { mdiFormatListBulleted, mdiHome } from '@mdi/js';
import Icon from '@mdi/react';
import { Trans, useTranslation } from 'react-i18next';
import useTaskDrawer from '../../../../../src/hooks/useTaskDrawer';
import theme from '../../../../theme';
import { renderDialog } from '../../../Layouts/Primary/TopBar/Items/AddMenu/AddMenu';

const StyledBox = styled(Box)(() => ({
  width: '100%',
  border: '1px solid',
  borderColor: theme.palette.cruGrayMedium.main,
  color: theme.palette.cruGrayDark.main,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
  backgroundColor: theme.palette.cruGrayLight.main,
  paddingTop: theme.spacing(7),
  paddingBottom: theme.spacing(7),
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),
  textAlign: 'center',
  boxShadow: `0px 0px 5px ${theme.palette.cruGrayMedium.main} inset`,
}));

interface Props {
  page: 'contact' | 'task';
  totalCount: number;
  filtered: boolean;
}

const NullState: React.FC<Props> = ({ page, totalCount, filtered }: Props) => {
  const { t } = useTranslation();
  const { openTaskDrawer } = useTaskDrawer();
  const [dialogOpen, changeDialogOpen] = useState(false);

  return (
    <StyledBox data-testid="no-data">
      <Icon
        path={page === 'contact' ? mdiHome : mdiFormatListBulleted}
        size={1.5}
      />
      {console.log(filtered)}
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
    </StyledBox>
  );
};

export default NullState;
