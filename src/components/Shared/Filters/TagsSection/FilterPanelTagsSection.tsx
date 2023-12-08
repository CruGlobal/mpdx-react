import { useRouter } from 'next/router';
import React, { useState } from 'react';
import ExpandMore from '@mui/icons-material/ExpandMore';
import LocalOffer from '@mui/icons-material/LocalOffer';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  ButtonGroup,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import theme from 'src/theme';
import {
  ContactFilterSetInput,
  FilterOption,
  TaskFilterSetInput,
} from '../../../../../graphql/types.generated';
import { FilterTagChip } from './Chip/FilterTagChip';
import { FilterTagDeleteModal } from './FilterTagDeleteModal';

export interface FilterPanelTagsSectionProps {
  filterOptions: FilterOption[];
  selectedFilters: ContactFilterSetInput & TaskFilterSetInput;
  onSelectedFiltersChanged: (
    selectedFilters: ContactFilterSetInput & TaskFilterSetInput,
  ) => void;
}

const TagsSectionDescription = styled(Typography)(() => ({
  fontStyle: 'italic',
}));

const TagsSectionWrapper = styled(Box)(({ theme }) => ({
  flexWrap: 'wrap',
  '& > *': {
    margin: theme.spacing(0.5),
  },
}));

const TagsAccordionWrapper = styled(Box)(() => ({
  '& .MuiPaper-elevation1': {
    boxShadow: 'none',
    borderBottom: `1px solid ${theme.palette.cruGrayLight.main}`,
  },
  '& .MuiAccordion-root.Mui-expanded': {
    margin: 0,
  },
}));

export const FilterPanelTagsSection: React.FC<FilterPanelTagsSectionProps> = ({
  filterOptions,
  selectedFilters,
  onSelectedFiltersChanged,
}) => {
  const { t } = useTranslation();
  const { pathname } = useRouter();

  const [selectedTag, setSelectedTag] = useState('');
  const [openFilterTagDeleteModal, setOpenFilterTagDeleteModal] =
    useState(false);

  const setAnyTags = (anyTags: true | undefined) => {
    onSelectedFiltersChanged({ ...selectedFilters, anyTags });
  };

  const appliedTags =
    (selectedFilters?.tags?.length || 0) +
    (selectedFilters?.excludeTags?.length || 0);
  return (
    <TagsAccordionWrapper>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box display="flex" sx={{ width: '100%' }}>
            <LocalOffer />
            <Typography style={{ marginLeft: 8 }}>
              {t('Tags')} {appliedTags ? ` (${appliedTags})` : ''}
            </Typography>
            <ButtonGroup
              variant="outlined"
              size="small"
              aria-label={t('Tags any or all filter')}
              onClick={(event) => {
                event.stopPropagation();
              }}
              sx={(theme) => ({
                marginRight: theme.spacing(1),
                flex: 1,
                justifyContent: 'right',
              })}
            >
              <Button
                onClick={() => setAnyTags(true)}
                variant={selectedFilters.anyTags ? 'contained' : 'text'}
              >
                {t('Any')}
              </Button>
              <Button
                onClick={() => setAnyTags(undefined)}
                variant={!selectedFilters.anyTags ? 'contained' : 'text'}
              >
                {t('All')}
              </Button>
            </ButtonGroup>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <TagsSectionWrapper>
            <Box mb={2}>
              <TagsSectionDescription variant="body2">
                {t(
                  'Click a tag twice to look up all {{page}} do not have that tag.',
                  {
                    page: pathname?.includes('contacts')
                      ? t('contacts who')
                      : t('tasks that'),
                  },
                )}
              </TagsSectionDescription>
            </Box>
            {filterOptions
              .filter((option) => option.value !== '--any--')
              .map((option) => (
                <FilterTagChip
                  key={option.name}
                  name={option.name}
                  value={option.value}
                  selectedFilters={selectedFilters}
                  onSelectedFiltersChanged={onSelectedFiltersChanged}
                  openDeleteModal={setOpenFilterTagDeleteModal}
                  setSelectedTag={setSelectedTag}
                />
              ))}
          </TagsSectionWrapper>
        </AccordionDetails>
      </Accordion>
      <FilterTagDeleteModal
        tagName={selectedTag}
        isOpen={openFilterTagDeleteModal}
        onClose={setOpenFilterTagDeleteModal}
      />
    </TagsAccordionWrapper>
  );
};
