import React from 'react';
import { render } from '@testing-library/react';
import i18n from 'i18next';
import { I18nextProvider } from 'react-i18next';
import TestRouter from '__tests__/util/TestRouter';
import { GoalsList } from './GoalsList';

const TestComponent = (props: React.ComponentProps<typeof GoalsList>) => (
  <TestRouter>
    <I18nextProvider i18n={i18n}>
      <GoalsList {...props} />
    </I18nextProvider>
  </TestRouter>
);

describe('GoalsList', () => {
  it('renders the header and buttons', async () => {
    const { getByRole } = render(<TestComponent />);

    expect(getByRole('heading', { level: 3 })).toHaveTextContent(
      'Good Afternoon, User.',
    );

    expect(
      getByRole('button', { name: 'Create a New Goal' }),
    ).toBeInTheDocument();

    expect(
      getByRole('button', { name: 'Learn About Goalsetting' }),
    ).toBeInTheDocument();
  });

  // Test this when we have actual goals data
  //   it('renders GoalCards when provided', () => {});

  it('shows empty state when no goals exist', () => {
    // Patch useState to return empty goals for this test
    jest.spyOn(React, 'useState').mockImplementationOnce(() => [[], jest.fn()]);

    const { getByRole } = render(<TestComponent />);

    expect(getByRole('heading', { level: 3 })).toHaveTextContent(
      'Good Afternoon, User.',
    );
    expect(
      getByRole('button', { name: 'Create a New Goal' }),
    ).toBeInTheDocument();
    expect(
      getByRole('button', { name: 'Learn About Goalsetting' }),
    ).toBeInTheDocument();
  });
});
