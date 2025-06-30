import { MenuItem, MenuItemProps, Select, SelectProps } from '@mui/material';
import { PledgeFrequencyEnum } from 'src/graphql/types.generated';

type PledgeFrequencySelectProps = Partial<SelectProps> & {
  MenuItemProps?: Partial<MenuItemProps> & { [testid: string]: string };
  getFunctionLabel: (label: string) => React.ReactNode;
  children?: React.ReactNode;
};

export const PledgeFrequencySelect = ({
  MenuItemProps,
  getFunctionLabel,
  children,
  ...props
}: PledgeFrequencySelectProps) => {
  return (
    <Select {...props}>
      {children}
      {Object.values(PledgeFrequencyEnum).map((value) => (
        <MenuItem key={value} value={value} {...MenuItemProps}>
          {getFunctionLabel(value)}
        </MenuItem>
      ))}
    </Select>
  );
};
