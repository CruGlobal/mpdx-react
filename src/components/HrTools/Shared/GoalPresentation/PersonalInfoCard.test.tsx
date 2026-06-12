import React from 'react';
import { render } from '@testing-library/react';
import { PersonalInfoCard } from './PersonalInfoCard';

describe('PersonalInfoCard', () => {
  it('renders the card title and row labels', () => {
    const { getByRole, getByText } = render(
      <PersonalInfoCard firstName="John" lastName="Doe" />,
    );

    expect(
      getByRole('heading', { name: 'Personal Information' }),
    ).toBeInTheDocument();
    expect(getByText('Name')).toBeInTheDocument();
    expect(getByText('Mission Agency')).toBeInTheDocument();
    expect(getByText('Ministry Team / Location')).toBeInTheDocument();
  });

  it('renders the staff member name without a spouse', () => {
    const { getByText } = render(
      <PersonalInfoCard firstName="John" lastName="Doe" />,
    );

    expect(getByText('John Doe')).toBeInTheDocument();
  });

  it('renders the combined name when a spouse is present', () => {
    const { getByText } = render(
      <PersonalInfoCard
        firstName="John"
        spouseFirstName="Jane"
        lastName="Doe"
      />,
    );

    expect(getByText('John and Jane Doe')).toBeInTheDocument();
  });

  it('renders the mission agency and ministry location', () => {
    const { getByText } = render(
      <PersonalInfoCard
        firstName="John"
        lastName="Doe"
        ministryLocation="Lake Hart"
      />,
    );

    expect(getByText('Campus Crusade for Christ, Inc.')).toBeInTheDocument();
    expect(getByText('Lake Hart')).toBeInTheDocument();
  });

  it('renders the Cru logo with accessible alt text', () => {
    const { getByRole, getByTestId } = render(
      <PersonalInfoCard firstName="John" lastName="Doe" />,
    );

    expect(getByTestId('cru-logo')).toBeInTheDocument();
    expect(
      getByRole('img', { name: 'Campus Crusade for Christ, Inc. logo' }),
    ).toBeInTheDocument();
  });
});
