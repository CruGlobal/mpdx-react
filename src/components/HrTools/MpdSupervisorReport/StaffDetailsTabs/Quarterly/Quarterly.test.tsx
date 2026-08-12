import { ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import theme from 'src/theme';
import { QuarterHealthEnum, QuarterStatus } from '../../mockData';
import { StaffTabQuarterly } from './Quarterly';

const quarters: QuarterStatus[] = [
  { label: 'FQ4 25', health: QuarterHealthEnum.Green, payroll: 15000 },
  { label: 'FQ1 26', health: QuarterHealthEnum.Yellow, payroll: 16000 },
  { label: 'FQ2 26', health: QuarterHealthEnum.Red, payroll: 17000 },
  { label: 'FQ3 26', health: QuarterHealthEnum.Green, payroll: 18000 },
];

const renderQuarterly = (quarterList: QuarterStatus[]) =>
  render(
    <ThemeProvider theme={theme}>
      <StaffTabQuarterly quarters={quarterList} />
    </ThemeProvider>,
  );

describe('StaffTabQuarterly', () => {
  it('renders the heading and a chip per quarter (all health colors)', () => {
    renderQuarterly(quarters);

    expect(screen.getByText('Fiscal Year Quarters')).toBeInTheDocument();
    // One chip per quarter, covering Green, Yellow, and Red health mappings.
    expect(screen.getByText('FQ4 25')).toBeInTheDocument(); // Green
    expect(screen.getByText('FQ1 26')).toBeInTheDocument(); // Yellow
    expect(screen.getByText('FQ2 26')).toBeInTheDocument(); // Red
    expect(screen.getByText('FQ3 26')).toBeInTheDocument(); // Green
  });

  it('renders no chips when there are no quarters', () => {
    renderQuarterly([]);

    expect(screen.getByText('Fiscal Year Quarters')).toBeInTheDocument();
    expect(screen.queryByText(/^FQ/)).not.toBeInTheDocument();
  });
});
