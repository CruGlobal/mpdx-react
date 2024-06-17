import { useCallback } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { TagChip } from 'src/components/Shared/TagChip/TagChip';

interface PhaseTagsProps {
  tags: string[];
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
}

const TagsSectionWrapper = styled(Box)(({ theme }) => ({
  flexWrap: 'wrap',
  '& > *': {
    margin: theme.spacing(0.5),
  },
}));

export const PhaseTags: React.FC<PhaseTagsProps> = ({
  tags,
  selectedTags,
  setSelectedTags,
}) => {
  const { t } = useTranslation();

  const getChipSelectType = useCallback(
    (tagId: string): 'none' | 'include' => {
      if (selectedTags.includes(tagId)) {
        return 'include';
      }
      return 'none';
    },
    [selectedTags],
  );

  const toggleSelect = useCallback(
    (tagId: string) => {
      if (!selectedTags) {
        setSelectedTags([tagId]);
        return;
      }
      if (selectedTags.includes(tagId)) {
        const tempTags = selectedTags.filter((tag: string) => tag !== tagId);
        setSelectedTags(tempTags);
        return;
      }
      setSelectedTags([...selectedTags, tagId]);
      return;
    },
    [selectedTags],
  );

  return (
    <Grid item>
      <Typography sx={{ fontWeight: 500 }}>{t('Suggested Tags')}</Typography>
      <TagsSectionWrapper>
        {tags.map((tag, idx) => (
          <TagChip
            label={tag}
            sx={{ margin: 0.5 }}
            key={`task-phase-${idx}`}
            selectType={getChipSelectType(tag)}
            onClick={() => toggleSelect(tag)}
            size="small"
          />
        ))}
      </TagsSectionWrapper>
    </Grid>
  );
};
