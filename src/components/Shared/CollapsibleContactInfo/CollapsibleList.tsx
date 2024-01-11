import { useState } from 'react';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const ExpandMoreIcon = styled(ExpandMore)(({ theme }) => ({
  color: theme.palette.primary.contrastText,
  cursor: 'pointer',
}));

const ExpandLessIcon = styled(ExpandLess)(({ theme }) => ({
  color: theme.palette.primary.contrastText,
  cursor: 'pointer',
}));

interface CollapsibleListProps {
  primaryItem: React.ReactNode;
  secondaryItems?: React.ReactNode;
}

export const CollapsibleList: React.FC<CollapsibleListProps> = ({
  primaryItem,
  secondaryItems,
}) => {
  const [moreVisible, setMoreVisible] = useState(false);

  return (
    <>
      <Typography display="flex">
        {primaryItem}
        {secondaryItems &&
          (moreVisible ? (
            <ExpandLessIcon onClick={() => setMoreVisible(false)} />
          ) : (
            <ExpandMoreIcon onClick={() => setMoreVisible(true)} />
          ))}
      </Typography>
      {moreVisible && secondaryItems}
    </>
  );
};
