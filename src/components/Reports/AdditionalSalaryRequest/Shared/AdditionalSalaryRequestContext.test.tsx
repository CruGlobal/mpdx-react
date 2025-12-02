import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useTranslation } from 'react-i18next';
import { AdditionalSalaryRequestTestWrapper } from '../AdditionalSalaryRequestTestWrapper';
import { useAdditionalSalaryRequest } from './AdditionalSalaryRequestContext';
import { getHeader } from './Helper/getHeader';

const TestComponent: React.FC = () => {
  const { currentStep, handleNextStep, isDrawerOpen, toggleDrawer } =
    useAdditionalSalaryRequest();
  const { t } = useTranslation();

  return (
    <div>
      <h2>{getHeader(t, currentStep)}</h2>
      <div aria-label="drawer state" data-open={isDrawerOpen}>
        Drawer: {isDrawerOpen ? 'open' : 'closed'}
      </div>
      <button onClick={handleNextStep}>Change Section</button>
      <button onClick={toggleDrawer}>Toggle Drawer</button>
    </div>
  );
};

const TestWrapper: React.FC = () => (
  <AdditionalSalaryRequestTestWrapper>
    <TestComponent />
  </AdditionalSalaryRequestTestWrapper>
);

describe('AdditionalSalaryRequestContext', () => {
  it('provides initial state', async () => {
    const { findByRole } = render(<TestWrapper />);

    expect(
      await findByRole('heading', { name: 'About this Form' }),
    ).toBeInTheDocument();
  });

  it('handles section change', async () => {
    const { getByRole, findByRole } = render(<TestWrapper />);

    userEvent.click(getByRole('button', { name: 'Change Section' }));
    expect(
      await findByRole('heading', { name: 'Complete the Form' }),
    ).toBeInTheDocument();
  });

  it('toggles drawer state', () => {
    const { getByRole, getByLabelText } = render(<TestWrapper />);

    const drawerState = getByLabelText('drawer state');
    expect(drawerState).toHaveAttribute('data-open', 'true');

    userEvent.click(getByRole('button', { name: 'Toggle Drawer' }));
    expect(drawerState).toHaveAttribute('data-open', 'false');
  });
});
