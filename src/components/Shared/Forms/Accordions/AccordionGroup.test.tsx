import { render } from '@testing-library/react';
import { AccordionGroup } from './AccordionGroup';

describe('AccordionGroup', () => {
  it('Should load title and children', () => {
    const { getByText } = render(
      <AccordionGroup title={'AccordionGroupTitle'}>Children</AccordionGroup>,
    );

    expect(getByText('AccordionGroupTitle')).toBeInTheDocument();
    expect(getByText('Children')).toBeInTheDocument();
  });
});
