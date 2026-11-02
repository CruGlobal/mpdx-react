import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PrintGoalControls } from './PrintGoalControls';

describe('PrintGoalControls', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the printing tips and the print button', () => {
    const { getByRole, getByText } = render(
      <PrintGoalControls buttonLabel="Print Goal" />,
    );

    expect(getByText('Some tips for printing:')).toBeInTheDocument();
    expect(
      getByText('Toggle off Headers and Footers in your print settings.'),
    ).toBeInTheDocument();
    expect(getByRole('button', { name: 'Print Goal' })).toBeInTheDocument();
  });

  it('prints when the print button is clicked', () => {
    const printSpy = jest.spyOn(window, 'print').mockImplementation(() => {});
    const { getByRole } = render(
      <PrintGoalControls buttonLabel="Print Goal" />,
    );

    userEvent.click(getByRole('button', { name: 'Print Goal' }));

    expect(printSpy).toHaveBeenCalled();
  });

  it('marks the tips and the button as print-hidden', () => {
    const { getByRole } = render(
      <PrintGoalControls buttonLabel="Print Goal" />,
    );

    expect(getByRole('alert')).toHaveClass('print-hidden');
    expect(getByRole('button', { name: 'Print Goal' })).toHaveClass(
      'print-hidden',
    );
  });
});
