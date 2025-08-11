import { Groups, Savings, Wallet } from '@mui/icons-material';

export const StaffAccount = (
  <Wallet
    titleAccess="Staff Account"
    sx={{
      backgroundColor: '#F08020',
      color: 'primary.contrastText',
      borderRadius: 1,
      p: 0.25,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      mr: 1,
    }}
  />
);
export const StaffSavings = (
  <Savings
    titleAccess="Staff Savings"
    sx={{
      backgroundColor: '#007890',
      color: 'primary.contrastText',
      borderRadius: 1,
      p: 0.25,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      mr: 1,
    }}
  />
);
export const StaffConferenceSavings = (
  <Groups
    titleAccess="Staff Conference Savings"
    sx={{
      backgroundColor: '#00C0D8',
      color: 'primary.contrastText',
      borderRadius: 1,
      p: 0.25,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      mr: 1,
    }}
  />
);
