import React from 'react';
import { render } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import { NavigationVisibilityContext } from '../navigation/NavigationVisibilityContext';
import { DEFAULT_VISIBILITY } from '../navigation/intents';
import { NavigationVisibilityResult } from '../navigation/useNavigationVisibility';
import { NavigationIntent } from '../types';
import { NavigationCard } from './NavigationCard';

const reportSegments = new Set(['coaching', 'donations']);

const loaded: NavigationVisibilityResult = {
  visibility: DEFAULT_VISIBILITY,
  reportSegments,
  isLoading: false,
};

const coachingHidden: NavigationVisibilityResult = {
  ...loaded,
  visibility: { ...DEFAULT_VISIBILITY, coaching: false },
};

interface TestComponentProps {
  intent: NavigationIntent;
  accountListId?: string;
  navigation?: NavigationVisibilityResult | null;
}

const TestComponent: React.FC<TestComponentProps> = ({
  intent,
  accountListId = 'account-list-1',
  navigation = loaded,
}) => (
  <TestRouter router={{ query: accountListId ? { accountListId } : {} }}>
    <NavigationVisibilityContext.Provider value={navigation}>
      <NavigationCard card={{ kind: 'navigation', intent, label: 'Open it' }} />
    </NavigationVisibilityContext.Provider>
  </TestRouter>
);

describe('NavigationCard', () => {
  let debugSpy: jest.SpyInstance;

  beforeEach(() => {
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
    const { getByText, queryByRole } = render(
      <TestComponent
        intent={{ type: 'coaching', params: {} }}
        navigation={coachingHidden}
      />,
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

  it.each([
    ['still loading', { ...coachingHidden, isLoading: true }],
    ['not looked up yet', null],
  ])(
    'shows plain text without logging while visibility is %s',
    (_, navigation) => {
      const intent = { type: 'coaching', params: {} };
      const { getByText, queryByRole, rerender } = render(
        <TestComponent intent={intent} navigation={navigation} />,
      );

      expect(getByText('Open it')).toBeInTheDocument();
      expect(queryByRole('link')).not.toBeInTheDocument();
      expect(debugSpy).not.toHaveBeenCalled();

      rerender(<TestComponent intent={intent} navigation={loaded} />);

      expect(getByText('Open it').closest('a')).toHaveAttribute(
        'href',
        '/accountLists/account-list-1/coaching',
      );
    },
  );

  it('logs a hidden intent once loading finishes', () => {
    const intent = { type: 'coaching', params: {} };
    const { rerender } = render(
      <TestComponent
        intent={intent}
        navigation={{ ...coachingHidden, isLoading: true }}
      />,
    );

    rerender(<TestComponent intent={intent} navigation={coachingHidden} />);

    expect(debugSpy).toHaveBeenCalledTimes(1);
    expect(debugSpy).toHaveBeenCalledWith(
      'Assistant navigation intent dropped type=coaching reason=coaching hidden',
    );
  });

  it('shows plain text without logging outside an account list', () => {
    const { getByText, queryByRole } = render(
      <TestComponent
        intent={{ type: 'dashboard', params: {} }}
        accountListId=""
      />,
    );

    expect(getByText('Open it')).toBeInTheDocument();
    expect(queryByRole('link')).not.toBeInTheDocument();
    expect(debugSpy).not.toHaveBeenCalled();
  });
});
