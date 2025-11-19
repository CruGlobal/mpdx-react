import { render } from '@testing-library/react';
import { SalaryCalculatorSectionEnum } from '../useSectionSteps';
import { SectionList } from './SectionList';

describe('SectionList', () => {
  it('renders the selected step', () => {
    const { getByText } = render(
      <SectionList
        selectedSection={SalaryCalculatorSectionEnum.EffectiveDate}
        stepStatus={[]}
      />,
    );
    expect(getByText('1. Effective Date')).toBeInTheDocument();
  });
});
