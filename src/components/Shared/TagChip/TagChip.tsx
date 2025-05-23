import { Chip } from '@mui/material';
import { styled } from '@mui/material/styles';

interface TagChipProps {
  selectType: 'none' | 'include' | 'exclude';
}

export const TagChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'selectType',
  label: 'TagChip',
})<TagChipProps>(({ selectType, theme }) => ({
  color: theme.palette.common.white,
  backgroundColor:
    selectType === 'include'
      ? theme.palette.mpdxBlue.main
      : selectType === 'exclude'
      ? theme.palette.error.main
      : theme.palette.mpdxGrayMedium.main,
  '&:focus': {
    backgroundColor:
      selectType === 'include'
        ? theme.palette.mpdxBlue.main
        : selectType === 'exclude'
        ? theme.palette.error.main
        : theme.palette.mpdxGrayMedium.main,
  },
  '&:hover': {
    backgroundColor:
      selectType === 'include'
        ? theme.palette.mpdxBlue.main
        : selectType === 'exclude'
        ? theme.palette.error.main
        : '#777',
  },
}));
