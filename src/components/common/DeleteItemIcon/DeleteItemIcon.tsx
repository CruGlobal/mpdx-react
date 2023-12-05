import React from 'react';
import DeleteOutlined from '@mui/icons-material/DeleteOutlined';
import { styled } from '@mui/material/styles';

const DeleteOutline = styled(DeleteOutlined)(({ theme }) => ({
  width: '24px',
  height: '24px',
  color: theme.palette.secondary.dark,
}));

export const DeletedItemIcon: React.FC = () => {
  return <DeleteOutline titleAccess="Outlined Delete Icon" />;
};
