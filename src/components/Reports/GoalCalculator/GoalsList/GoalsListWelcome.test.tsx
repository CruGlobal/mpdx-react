import React from 'react';
import { render } from '@testing-library/react';
import { Settings } from 'luxon';
import { GoalsListWelcome } from './GoalsListWelcome';

const TestComponent: React.FC<{ firstName?: string }> = ({ firstName }) => (
  <GoalsListWelcome firstName={firstName} />
);

describe('GoalsListWelcome', () => {
  beforeEach(() => {
    Settings.now = () => new Date().setHours(11, 34, 0, 0);
  });

  it('should render welcome message', () => {
    const { getByText } = render(<TestComponent />);

    expect(
      getByText('Welcome to the MPD Goal Calculator.'),
    ).toBeInTheDocument();
  });

  it('should render greeting without name', () => {
    const { getByRole } = render(<TestComponent />);

    expect(getByRole('heading', { name: 'Good Morning,' })).toBeInTheDocument();
  });

  it('should render greeting with name when provided', () => {
    const { getByRole } = render(<TestComponent firstName="John" />);

    expect(
      getByRole('heading', { name: 'Good Morning, John.' }),
    ).toBeInTheDocument();
  });
});
