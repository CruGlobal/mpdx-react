import { MenuItem, Select, SelectProps } from '@mui/material';
import { PledgeFrequencyEnum } from 'src/graphql/types.generated';
import { useLocalizedConstants } from 'src/hooks/useLocalizedConstants';

type PledgeFrequencySelectProps = Partial<SelectProps> & {
  children?: React.ReactNode;
};

export const PledgeFrequencySelect = ({
  children,
  ...props
}: PledgeFrequencySelectProps) => {
  const { getLocalizedPledgeFrequency } = useLocalizedConstants();
  return (
    <Select {...props}>
      {children}
      {Object.values(PledgeFrequencyEnum).map((value) => (
        <MenuItem key={value} value={value}>
          {getLocalizedPledgeFrequency(value)}
        </MenuItem>
      ))}
    </Select>
  );
};
