import React from 'react';
import { render } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import { DEFAULT_VISIBILITY } from '../navigation/intents';
import { useNavigationVisibility } from '../navigation/useNavigationVisibility';
import { NavigationIntent } from '../types';
import { NavigationCard } from './NavigationCard';

jest.mock('../navigation/useNavigationVisibility');
const mockUseNavigationVisibility = useNavigationVisibility as jest.MockedFn<
  typeof useNavigationVisibility
>;

const reportSegments = new Set(['coaching', 'donations']);

interface TestComponentProps {
  intent: NavigationIntent;
  accountListId?: string;
}

const TestComponent: React.FC<TestComponentProps> = ({
  intent,
  accountListId = 'account-list-1',
}) => (
  <TestRouter router={{ query: accountListId ? { accountListId } : {} }}>
    <NavigationCard card={{ kind: 'navigation', intent, label: 'Open it' }} />
  </TestRouter>
);

describe('NavigationCard', () => {
  let debugSpy: jest.SpyInstance;

  beforeEach(() => {
    mockUseNavigationVisibility.mockReturnValue({
      visibility: DEFAULT_VISIBILITY,
      reportSegments,
      isLoading: false,
    });
    debugSpy = jest.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    debugSpy.mockRestore();
  });

  it('links to the built href for a valid intent', () => {
    const { getByRole } = render(
      <TestComponent
        intent={{ type: 'settings', params: { tab: 'connect_services' } }}
      />,
    );

    expect(getByRole('link', { name: 'Open it' })).toHaveAttribute(
      'href',
      '/accountLists/account-list-1/settings/integrations',
    );
  });

  it('shows plain text and logs once for an invalid intent', () => {
    const intent = { type: 'url', params: {} };
    const { getByText, queryByRole, rerender } = render(
      <TestComponent intent={intent} />,
    );
    rerender(<TestComponent intent={intent} />);

    expect(getByText('Open it')).toBeInTheDocument();
    expect(queryByRole('link')).not.toBeInTheDocument();
    expect(debugSpy).toHaveBeenCalledTimes(1);
  });

  it('shows plain text for an intent the user cannot see', () => {
    mockUseNavigationVisibility.mockReturnValue({
      visibility: { ...DEFAULT_VISIBILITY, coaching: false },
      reportSegments,
      isLoading: false,
    });
    const { getByText, queryByRole } = render(
      <TestComponent intent={{ type: 'coaching', params: {} }} />,
    );

    expect(getByText('Open it')).toBeInTheDocument();
    expect(queryByRole('link')).not.toBeInTheDocument();
  });

  it('shows plain text for a report the nav does not list', () => {
    const { getByText, queryByRole } = render(
      <TestComponent
        intent={{ type: 'report', params: { name: 'financial_accounts' } }}
      />,
    );

    expect(getByText('Open it')).toBeInTheDocument();
    expect(queryByRole('link')).not.toBeInTheDocument();
  });

  it('shows plain text without logging while visibility loads', () => {
    mockUseNavigationVisibility.mockReturnValue({
      visibility: { ...DEFAULT_VISIBILITY, coaching: false },
      reportSegments,
      isLoading: true,
    });
    const intent = { type: 'coaching', params: {} };
    const { getByText, queryByRole, rerender } = render(
      <TestComponent intent={intent} />,
    );

    expect(getByText('Open it')).toBeInTheDocument();
    expect(queryByRole('link')).not.toBeInTheDocument();
    expect(debugSpy).not.toHaveBeenCalled();

    mockUseNavigationVisibility.mockReturnValue({
      visibility: DEFAULT_VISIBILITY,
      reportSegments,
      isLoading: false,
    });
    rerender(<TestComponent intent={intent} />);

    expect(getByText('Open it').closest('a')).toHaveAttribute(
      'href',
      '/accountLists/account-list-1/coaching',
    );
  });

  it('logs a hidden intent once loading finishes', () => {
    mockUseNavigationVisibility.mockReturnValue({
      visibility: { ...DEFAULT_VISIBILITY, coaching: false },
      reportSegments,
      isLoading: true,
    });
    const intent = { type: 'coaching', params: {} };
    const { rerender } = render(<TestComponent intent={intent} />);

    mockUseNavigationVisibility.mockReturnValue({
      visibility: { ...DEFAULT_VISIBILITY, coaching: false },
      reportSegments,
      isLoading: false,
    });
    rerender(<TestComponent intent={intent} />);

    expect(debugSpy).toHaveBeenCalledTimes(1);
    expect(debugSpy).toHaveBeenCalledWith(
      'Assistant navigation intent dropped type=coaching reason=coaching hidden',
    );
  });

  it('shows plain text outside an account list', () => {
    const { getByText, queryByRole } = render(
      <TestComponent
        intent={{ type: 'dashboard', params: {} }}
        accountListId=""
      />,
    );

    expect(getByText('Open it')).toBeInTheDocument();
    expect(queryByRole('link')).not.toBeInTheDocument();
    expect(mockUseNavigationVisibility).not.toHaveBeenCalled();
  });
});
