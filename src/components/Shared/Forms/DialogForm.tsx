import { styled } from '@mui/material/styles';
import { Form } from 'formik';

// The form sits between the dialog paper and DialogContent, so it must be a
// shrinkable flex column for DialogContent to scroll instead of the whole dialog
export const DialogForm = styled(Form)({
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0,
});
