import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdditionalSalaryRequestTestWrapper } from '../AdditionalSalaryRequestTestWrapper';
import { useAdditionalSalaryRequest } from './AdditionalSalaryRequestContext';

const TestComponent: React.FC = () => {
  const { currentStep, handleNextStep, isDrawerOpen, toggleDrawer } =
    useAdditionalSalaryRequest();

  return (
    <div>
      <h2>{currentStep}</h2>
      <div aria-label="drawer state" data-open={isDrawerOpen}>
        Drawer: {isDrawerOpen ? 'open' : 'closed'}
      </div>
      <button onClick={handleNextStep}>Change Section</button>
      <button onClick={toggleDrawer}>Toggle Drawer</button>
    </div>
  );
};

describe('AdditionalSalaryRequestContext', () => {
  it('provides initial state', async () => {
    const { findByRole } = render(
      <AdditionalSalaryRequestTestWrapper>
        <TestComponent />
      </AdditionalSalaryRequestTestWrapper>,
    );

    expect(
      await findByRole('heading', { name: 'about-form' }),
    ).toBeInTheDocument();
  });

  it('handles section change', async () => {
    const { getByRole, findByRole } = render(
      <AdditionalSalaryRequestTestWrapper>
        <TestComponent />
      </AdditionalSalaryRequestTestWrapper>,
    );

    userEvent.click(getByRole('button', { name: 'Change Section' }));
    expect(
      await findByRole('heading', { name: 'complete-form' }),
    ).toBeInTheDocument();
  });

  it('toggles drawer state', () => {
    const { getByRole, getByLabelText } = render(
      <AdditionalSalaryRequestTestWrapper>
        <TestComponent />
      </AdditionalSalaryRequestTestWrapper>,
    );

    const drawerState = getByLabelText('drawer state');
    expect(drawerState).toHaveAttribute('data-open', 'true');

    userEvent.click(getByRole('button', { name: 'Toggle Drawer' }));
    expect(drawerState).toHaveAttribute('data-open', 'false');
  });
});
