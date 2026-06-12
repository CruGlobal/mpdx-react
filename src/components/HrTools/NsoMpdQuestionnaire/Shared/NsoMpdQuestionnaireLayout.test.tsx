import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NsoMpdQuestionnaireTestWrapper } from '../NsoMpdQuestionnaireTestWrapper';
import { NsoMpdQuestionnaireLayout } from './NsoMpdQuestionnaireLayout';

const TestComponent: React.FC = () => (
  <NsoMpdQuestionnaireTestWrapper>
    <NsoMpdQuestionnaireLayout
      sectionListPanel={<div>Sidebar sub-steps</div>}
      mainContent={<div>Main panel content</div>}
    />
  </NsoMpdQuestionnaireTestWrapper>
);

describe('NsoMpdQuestionnaireLayout', () => {
  it('shows the current view step as the sidebar title', () => {
    const { getByRole } = render(<TestComponent />);

    expect(
      getByRole('heading', { name: 'Questionnaire Step 1' }),
    ).toBeInTheDocument();
  });

  it('renders an icon in the rail for every view step', () => {
    const { getByRole } = render(<TestComponent />);

    expect(
      getByRole('button', { name: 'Questionnaire Step 1' }),
    ).toBeInTheDocument();
    expect(
      getByRole('button', { name: 'Questionnaire Step 2' }),
    ).toBeInTheDocument();
    expect(
      getByRole('button', { name: 'Questionnaire Step 3' }),
    ).toBeInTheDocument();
    expect(
      getByRole('button', { name: 'Questionnaire Step 4' }),
    ).toBeInTheDocument();
    expect(getByRole('button', { name: 'Summary' })).toBeInTheDocument();
  });

  it('marks the current view step icon as active', () => {
    const { getByRole } = render(<TestComponent />);

    expect(
      getByRole('button', { name: 'Questionnaire Step 1' }),
    ).toHaveAttribute('aria-current', 'step');
  });

  it('renders a back arrow to the dashboard', () => {
    const { getByRole } = render(<TestComponent />);

    expect(
      getByRole('link', { name: 'Back to dashboard' }),
    ).toBeInTheDocument();
  });

  it('renders the per-page sidebar slot', () => {
    const { getByText } = render(<TestComponent />);

    expect(getByText('Sidebar sub-steps')).toBeInTheDocument();
  });

  it('renders the main content slot', () => {
    const { getByText } = render(<TestComponent />);

    expect(getByText('Main panel content')).toBeInTheDocument();
  });

  it('switches the view step when its icon is clicked', () => {
    const { getByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: 'Questionnaire Step 3' }));

    expect(
      getByRole('heading', { name: 'Questionnaire Step 3' }),
    ).toBeInTheDocument();
    expect(
      getByRole('button', { name: 'Questionnaire Step 3' }),
    ).toHaveAttribute('aria-current', 'step');
  });

  it('collapses and expands the sidebar with the toggle button', () => {
    const { getByLabelText } = render(<TestComponent />);

    const sidebar = getByLabelText('Steps');
    expect(sidebar).toHaveAttribute('aria-expanded', 'true');

    userEvent.click(getByLabelText('Toggle Menu'));
    expect(sidebar).toHaveAttribute('aria-expanded', 'false');

    userEvent.click(getByLabelText('Toggle Menu'));
    expect(sidebar).toHaveAttribute('aria-expanded', 'true');
  });

  it('reopens a collapsed sidebar when switching to a different step', () => {
    const { getByLabelText, getByRole } = render(<TestComponent />);

    const sidebar = getByLabelText('Steps');
    userEvent.click(getByLabelText('Toggle Menu'));
    expect(sidebar).toHaveAttribute('aria-expanded', 'false');

    userEvent.click(getByRole('button', { name: 'Questionnaire Step 3' }));
    expect(sidebar).toHaveAttribute('aria-expanded', 'true');
  });

  it('toggles the sidebar when clicking the already-active step icon', () => {
    const { getByLabelText, getByRole } = render(<TestComponent />);

    const sidebar = getByLabelText('Steps');
    expect(sidebar).toHaveAttribute('aria-expanded', 'true');

    userEvent.click(getByRole('button', { name: 'Questionnaire Step 1' }));
    expect(sidebar).toHaveAttribute('aria-expanded', 'false');
  });

  it('shows the Continue button and advances to the next step', () => {
    const { getByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: 'Continue' }));

    expect(
      getByRole('button', { name: 'Questionnaire Step 2' }),
    ).toHaveAttribute('aria-current', 'step');
  });

  it('hides the Continue button on the last step', () => {
    const { getByRole, queryByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: 'Summary' }));

    expect(queryByRole('button', { name: 'Continue' })).not.toBeInTheDocument();
  });
});
