import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import theme from 'src/theme';
import { GoalCalculatorProvider } from '../Shared/GoalCalculatorContext';
import { ReportSectionList, SectionItem, SectionList } from './SectionList';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>
    <SnackbarProvider>
      <GoalCalculatorProvider>{children}</GoalCalculatorProvider>
    </SnackbarProvider>
  </ThemeProvider>
);

describe('SectionList', () => {
  const mockSections: SectionItem[] = [
    { title: 'Complete Section', complete: true },
    { title: 'Incomplete Section', complete: false },
  ];

  it('renders sections with titles and icons', () => {
    const { getAllByRole } = render(
      <TestWrapper>
        <SectionList sections={mockSections} />
      </TestWrapper>,
    );

    const sections = getAllByRole('listitem');
    expect(sections).toHaveLength(2);

    const [completeSection, incompleteSection] = sections;
    expect(completeSection).toHaveTextContent('Complete Section');
    expect(
      within(completeSection).getByTestId('CircleIcon'),
    ).toBeInTheDocument();

    expect(incompleteSection).toHaveTextContent('Incomplete Section');
    expect(
      within(incompleteSection).getByTestId('RadioButtonUncheckedIcon'),
    ).toBeInTheDocument();
  });
});

describe('ReportSectionList', () => {
  it('renders all report section buttons', () => {
    const { getByRole } = render(
      <TestWrapper>
        <ReportSectionList />
      </TestWrapper>,
    );

    expect(getByRole('button', { name: 'MPD Goal' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Salary Request' })).toBeInTheDocument();
    expect(
      getByRole('button', { name: 'Presenting Your Goal' }),
    ).toBeInTheDocument();
  });

  it('updates the selected report', async () => {
    const { getByRole } = render(
      <TestWrapper>
        <ReportSectionList />
      </TestWrapper>,
    );

    const initialReport = getByRole('button', { name: 'MPD Goal' });
    expect(initialReport).toHaveAttribute('aria-current', 'true');

    const newReport = getByRole('button', { name: 'Presenting Your Goal' });
    userEvent.click(newReport);
    expect(newReport).toHaveAttribute('aria-current', 'true');
    expect(initialReport).toHaveAttribute('aria-current', 'false');
  });
});
