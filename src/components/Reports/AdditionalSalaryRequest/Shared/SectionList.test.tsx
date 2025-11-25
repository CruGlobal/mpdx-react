import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdditionalSalaryRequestTestWrapper } from '../AdditionalSalaryRequestTestWrapper';
import { SectionList } from './SectionList';

describe('SectionList', () => {
  it('renders all section buttons', () => {
    const { getByRole } = render(
      <AdditionalSalaryRequestTestWrapper>
        <SectionList />
      </AdditionalSalaryRequestTestWrapper>,
    );

    expect(
      getByRole('button', { name: '1. About this Form' }),
    ).toBeInTheDocument();
    expect(
      getByRole('button', { name: '2. Complete the Form' }),
    ).toBeInTheDocument();
    expect(getByRole('button', { name: '3. Receipt' })).toBeInTheDocument();
  });

  it('updates the selected section', async () => {
    const { getByRole, findByRole } = render(
      <AdditionalSalaryRequestTestWrapper>
        <SectionList />
      </AdditionalSalaryRequestTestWrapper>,
    );

    expect(getByRole('button', { name: '1. About this Form' })).toHaveAttribute(
      'aria-current',
      'true',
    );

    userEvent.click(getByRole('button', { name: '3. Receipt' }));
    expect(
      await findByRole('button', { name: '3. Receipt', current: true }),
    ).toBeInTheDocument();
    expect(getByRole('button', { name: '1. About this Form' })).toHaveAttribute(
      'aria-current',
      'false',
    );
  });
});
