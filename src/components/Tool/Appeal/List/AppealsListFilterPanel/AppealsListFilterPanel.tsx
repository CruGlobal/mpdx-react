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
import { useTranslation } from 'react-i18next';
import {
  AppealListViewEnum,
  AppealsContext,
  AppealsType,
} from '../../AppealsContext/AppealsContext';
import { AppealsListFilterPanelButton } from './AppealsListFilterPanelButton';
import { AppealsListFilterPanelItem } from './AppealsListFilterPanelItem';

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
    marginBottom: theme.spacing(4),
  },
}));

export enum ContextTypesEnum {
  Contacts = 'contacts',
  Appeals = 'appeals',
}
export interface FilterPanelProps {
  onClose: () => void;
}

export const AppealsListFilterPanel: React.FC<FilterPanelProps & BoxProps> = ({
  onClose,
}) => {
  const { t } = useTranslation();
  const { appealListView, setAppealListView } = React.useContext(
    AppealsContext,
  ) as AppealsType;

  const handleFilterItemClick = (newAppealListView) => {
    setAppealListView(newAppealListView);
  };

  const handleFilterButtonClick = () => {};

  return (
    <Box>
      <div style={{ overflow: 'hidden' }}>
        <Slide in direction="right" appear={false} mountOnEnter unmountOnExit>
          <div>
            <FilterHeader>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="h6">{t('Appeals')}</Typography>
                <IconButton
                  onClick={onClose}
                  aria-label={t('Close')}
                  data-testid="FilterPanelClose"
                >
                  <Close titleAccess={t('Close')} />
                </IconButton>
              </Box>
            </FilterHeader>
            <FilterList dense sx={{ paddingY: 0 }}>
              <List sx={{ padding: '0' }}>
                <AppealsListFilterPanelItem
                  id={AppealListViewEnum.Given}
                  title={t('Given')}
                  value={0}
                  isSelected={appealListView === AppealListViewEnum.Given}
                  onClick={handleFilterItemClick}
                />
                <AppealsListFilterPanelItem
                  id={AppealListViewEnum.Received}
                  title={t('Received')}
                  value={0}
                  isSelected={appealListView === AppealListViewEnum.Received}
                  onClick={handleFilterItemClick}
                />
                <AppealsListFilterPanelItem
                  id={AppealListViewEnum.Committed}
                  title={t('Committed')}
                  value={0}
                  isSelected={appealListView === AppealListViewEnum.Committed}
                  onClick={handleFilterItemClick}
                />
                <AppealsListFilterPanelItem
                  id={AppealListViewEnum.Asked}
                  title={t('Asked')}
                  value={0}
                  isSelected={appealListView === AppealListViewEnum.Asked}
                  onClick={handleFilterItemClick}
                />
                <AppealsListFilterPanelItem
                  id={AppealListViewEnum.Excluded}
                  title={t('Excluded')}
                  value={0}
                  isSelected={appealListView === AppealListViewEnum.Excluded}
                  onClick={handleFilterItemClick}
                />

                <AppealsListFilterPanelButton
                  title={t('Export to CSV')}
                  onClick={handleFilterButtonClick}
                  buttonText={t('Export {{number}} Selected', { number: 0 })}
                  disabled={false}
                />
                <AppealsListFilterPanelButton
                  title={t('Export Emails')}
                  onClick={handleFilterButtonClick}
                  buttonText={t('Export {{number}} Selected', { number: 0 })}
                  disabled={false}
                />
                <AppealsListFilterPanelButton
                  title={t('Add Contact to Appeal')}
                  onClick={handleFilterButtonClick}
                  buttonText={t('Select Contact')}
                  disabled={false}
                />
                <AppealsListFilterPanelButton
                  title={t('Delete Appeal')}
                  onClick={handleFilterButtonClick}
                  buttonText={t('Permanently Delete Appeal')}
                  disabled={false}
                  buttonError={'error'}
                  buttonVariant={'outlined'}
                />
              </List>
            </FilterList>
          </div>
        </Slide>
      </div>
    </Box>
  );
};
