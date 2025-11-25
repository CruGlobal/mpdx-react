import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdditionalSalaryRequest } from './AdditionalSalaryRequest';
import { AdditionalSalaryRequestTestWrapper } from './AdditionalSalaryRequestTestWrapper';

describe('AdditionalSalaryRequest', () => {
  it('renders main content based on selected section', async () => {
    const { getByRole, findByRole } = render(
      <AdditionalSalaryRequestTestWrapper>
        <AdditionalSalaryRequest />
      </AdditionalSalaryRequestTestWrapper>,
    );

    expect(
      await findByRole('heading', { name: 'About this Form' }),
    ).toBeInTheDocument();

    userEvent.click(getByRole('button', { name: '2. Complete the Form' }));
    expect(
      await findByRole('heading', { name: 'Complete Form' }),
    ).toBeInTheDocument();

    userEvent.click(getByRole('button', { name: '3. Receipt' }));
    expect(
      await findByRole('heading', { name: 'Receipt content' }),
    ).toBeInTheDocument();
  });
});
