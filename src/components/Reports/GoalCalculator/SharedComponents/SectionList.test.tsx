import React from 'react';
import { render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GoalCalculatorTestWrapper } from '../GoalCalculatorTestWrapper';
import { ReportSectionList, SectionItem, SectionList } from './SectionList';

describe('SectionList', () => {
  const mockSections: SectionItem[] = [
    { title: 'Complete Section', complete: true },
    { title: 'Incomplete Section', complete: false },
  ];

  it('renders sections with titles and icons', () => {
    const { getAllByRole } = render(
      <GoalCalculatorTestWrapper>
        <SectionList sections={mockSections} />
      </GoalCalculatorTestWrapper>,
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
      <GoalCalculatorTestWrapper>
        <ReportSectionList />
      </GoalCalculatorTestWrapper>,
    );

    expect(getByRole('button', { name: 'MPD Goal' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Salary Request' })).toBeInTheDocument();
    expect(
      getByRole('button', { name: 'Presenting Your Goal' }),
    ).toBeInTheDocument();
  });

  it('updates the selected report', async () => {
    const { getByRole } = render(
      <GoalCalculatorTestWrapper>
        <ReportSectionList />
      </GoalCalculatorTestWrapper>,
    );

    const initialReport = getByRole('button', { name: 'MPD Goal' });
    expect(initialReport).toHaveAttribute('aria-current', 'true');

    const newReport = getByRole('button', { name: 'Presenting Your Goal' });
    userEvent.click(newReport);
    expect(newReport).toHaveAttribute('aria-current', 'true');
    expect(initialReport).toHaveAttribute('aria-current', 'false');
  });
});
