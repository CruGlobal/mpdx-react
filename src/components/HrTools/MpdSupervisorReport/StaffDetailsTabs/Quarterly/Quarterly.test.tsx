import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { act, render, screen } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';
import {
  MpdSupervisorReportProvider,
  useMpdSupervisorReport,
} from '../../MpdSupervisorReportContext';
import { EmployeeData, QuarterHealthEnum } from '../../mockData';
import { StaffTabQuarterly } from './Quarterly';

const member: EmployeeData = {
  user: {
    id: '1',
    preferredName: 'John',
    lastName: 'Smith',
    personNumber: '10000001',
    staffAccountID: '1000000001',
    userPersonType: 'Full time',
    team: 'Campus',
  },
  quarters: [
    { label: 'FQ4 25', health: QuarterHealthEnum.Green, payroll: 15000 },
    { label: 'FQ1 26', health: QuarterHealthEnum.Yellow, payroll: 16000 },
    { label: 'FQ2 26', health: QuarterHealthEnum.Red, payroll: 17000 },
    { label: 'FQ3 26', health: QuarterHealthEnum.Green, payroll: 18000 },
  ],
};

let openMemberFn: (member: EmployeeData) => void;

const Opener: React.FC = () => {
  openMemberFn = useMpdSupervisorReport().openMember;
  return null;
};

const renderQuarterly = () =>
  render(
    <TestRouter>
      <ThemeProvider theme={theme}>
        <MpdSupervisorReportProvider>
          <Opener />
          <StaffTabQuarterly />
        </MpdSupervisorReportProvider>
      </ThemeProvider>
    </TestRouter>,
  );

describe('StaffTabQuarterly', () => {
  it('renders nothing when no member is selected', () => {
    const { container } = renderQuarterly();
    expect(container.firstChild).toBeNull();
  });

  it('renders the heading and a chip per quarter (all health colors) once a member is selected', () => {
    renderQuarterly();
    act(() => openMemberFn(member));

    expect(screen.getByText('Fiscal Year Quarters')).toBeInTheDocument();
    // One chip per quarter, covering Green, Yellow, and Red health mappings.
    expect(screen.getByText('FQ4 25')).toBeInTheDocument(); // Green
    expect(screen.getByText('FQ1 26')).toBeInTheDocument(); // Yellow
    expect(screen.getByText('FQ2 26')).toBeInTheDocument(); // Red
    expect(screen.getByText('FQ3 26')).toBeInTheDocument(); // Green
  });
});
