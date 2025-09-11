import { Groups, Savings, Wallet } from '@mui/icons-material';

export const PrimaryAccount = (
  <Wallet
    titleAccess="Primary Account"
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
export const SavingsAccount = (
  <Savings
    titleAccess="Savings Account"
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
export const ConferenceSavingsAccount = (
  <Groups
    titleAccess="Conference Savings Account"
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
