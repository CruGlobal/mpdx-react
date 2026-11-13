import React, { useContext, useEffect, useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { act, render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { ContactPanelProvider } from 'src/components/Shared/ContactPanelProvider/ContactPanelProvider';
import theme from '../../../theme';
import {
  ContactDetailContext,
  ContactDetailProvider,
} from './ContactDetailContext';
import { ContactDetails } from './ContactDetails';

const accountListId = 'account-list-1';
const contactId = 'contact-1';

const createRouter = (
  overrides: Partial<Record<string, string | string[]>> = {},
) => {
  return {
    pathname: '/contacts',
    query: {
      accountListId,
      contactId: [contactId],
      ...overrides,
    },
    replace: jest.fn(),
    isReady: true,
  };
};

const renderWithProviders = (
  router: ReturnType<typeof createRouter>,
  Component: React.FC,
) =>
  render(
    <SnackbarProvider>
      <TestRouter router={router}>
        <GqlMockedProvider>
          <ThemeProvider theme={theme}>
            <ContactPanelProvider>
              <ContactDetailProvider>
                <Component />
              </ContactDetailProvider>
            </ContactPanelProvider>
          </ThemeProvider>
        </GqlMockedProvider>
      </TestRouter>
    </SnackbarProvider>,
  );

// jsdom doesn't lay anything out, so every element reports 0 for its widths and
// scroll position. Report the sizes a browser would measure for the tab row (the
// element that scrolls the tab list) and leave every other element alone.
const tabRowMetrics = { scrollWidth: 0, clientWidth: 0, scrollLeft: 0 };
type TabRowMetric = keyof typeof tabRowMetrics;
const tabRowMetricNames: TabRowMetric[] = [
  'scrollWidth',
  'clientWidth',
  'scrollLeft',
];
const elementMetricDescriptors = tabRowMetricNames.map((name) => ({
  name,
  inherited: Object.getOwnPropertyDescriptor(Element.prototype, name),
  own: Object.getOwnPropertyDescriptor(HTMLElement.prototype, name),
}));

const isTabRow = (element: Element): boolean =>
  element.firstElementChild?.getAttribute('role') === 'tablist';

const mockTabRowMetrics = (
  metrics: Pick<typeof tabRowMetrics, 'scrollWidth' | 'clientWidth'>,
) => {
  Object.assign(tabRowMetrics, metrics, { scrollLeft: 0 });
  elementMetricDescriptors.forEach(({ name, inherited }) => {
    Object.defineProperty(HTMLElement.prototype, name, {
      configurable: true,
      get(this: HTMLElement) {
        return isTabRow(this)
          ? tabRowMetrics[name]
          : inherited?.get?.call(this);
      },
      set(this: HTMLElement, value: number) {
        if (isTabRow(this)) {
          tabRowMetrics[name] = value;
        } else {
          inherited?.set?.call(this, value);
        }
      },
    });
  });
};

const restoreTabRowMetrics = () => {
  elementMetricDescriptors.forEach(({ name, own }) => {
    if (own) {
      Object.defineProperty(HTMLElement.prototype, name, own);
    } else {
      Reflect.deleteProperty(HTMLElement.prototype, name);
    }
  });
};

const getTabRow = (tabList: HTMLElement): HTMLElement => {
  const tabRow = tabList.parentElement;
  if (!tabRow || !isTabRow(tabRow)) {
    throw new Error('Could not find the element that scrolls the tabs');
  }
  return tabRow;
};

// Swiping the row in a browser moves its scroll position and fires a scroll
// event, so do the same here
const scrollTabRow = (tabRow: HTMLElement, scrollLeft: number) => {
  act(() => {
    tabRow.scrollLeft = scrollLeft;
    tabRow.dispatchEvent(new Event('scroll'));
  });
};

// jsdom ignores media queries when it works out an element's styles, so read
// the value the theme's sm-and-up breakpoint sets for an element straight from
// the page's style sheets instead
const smUpStyle = (element: Element, property: string): string | undefined => {
  const smUpMedia = theme.breakpoints
    .up('sm')
    .replace(/^@media\s*/, '')
    .replace(/\s/g, '');
  for (const sheet of Array.from(document.styleSheets)) {
    for (const rule of Array.from(sheet.cssRules)) {
      if (
        rule instanceof CSSMediaRule &&
        rule.media.mediaText.replace(/\s/g, '') === smUpMedia
      ) {
        for (const innerRule of Array.from(rule.cssRules)) {
          if (
            innerRule instanceof CSSStyleRule &&
            element.matches(innerRule.selectorText) &&
            innerRule.style.getPropertyValue(property)
          ) {
            return innerRule.style.getPropertyValue(property);
          }
        }
      }
    }
  }
  return undefined;
};

const tabNames = [
  'Tasks',
  'Donations',
  'Connections',
  'Contact Details',
  'Notes',
];

describe('ContactDetails', () => {
  it('should change the tab', async () => {
    const router = createRouter();

    const { getAllByRole } = renderWithProviders(router, () => (
      <ContactDetails />
    ));

    const tasksPanel = getAllByRole('tabpanel')[0];
    expect(tasksPanel).toBeVisible();

    userEvent.click(getAllByRole('tab')[1]);
    expect(tasksPanel).not.toBeVisible();
  });

  it('should open the person modal when personId is present in query', async () => {
    const router = createRouter({ personId: 'person-123' });

    const TestComponent = () => {
      const context = useContext(ContactDetailContext);
      return <div data-testid="modal-open">{context?.editPersonModalOpen}</div>;
    };

    const { getByTestId } = renderWithProviders(router, TestComponent);

    await waitFor(() => {
      expect(getByTestId('modal-open').textContent).toBe('person-123');
    });
  });

  it('should close the person modal when personId is removed from query', async () => {
    const Wrapper: React.FC = () => {
      const [showPersonId, setShowPersonId] = useState(true);
      const updatedRouter = createRouter(
        showPersonId ? { personId: 'person-123' } : {},
      );

      const TestComponent = () => {
        const context = useContext(ContactDetailContext);
        return (
          <div data-testid="modal-open">
            {context?.editPersonModalOpen || ''}
          </div>
        );
      };

      useEffect(() => {
        // simulate route query change after mount
        setTimeout(() => {
          act(() => {
            setShowPersonId(false);
          });
        }, 0);
      }, []);

      return (
        <TestRouter router={updatedRouter}>
          <GqlMockedProvider>
            <ThemeProvider theme={theme}>
              <ContactDetailProvider>
                <TestComponent />
              </ContactDetailProvider>
            </ThemeProvider>
          </GqlMockedProvider>
        </TestRouter>
      );
    };

    const { getByTestId } = render(
      <SnackbarProvider>
        <Wrapper />
      </SnackbarProvider>,
    );

    await waitFor(() => {
      expect(getByTestId('modal-open').textContent).toBe('');
    });
  });

  it('should call router.replace and clear modal when closePersonModal is called', async () => {
    const router = createRouter({ personId: 'person-123' });

    const TestComponent = () => {
      const context = useContext(ContactDetailContext);

      useEffect(() => {
        context?.closePersonModal();
      }, [context]);

      return (
        <div data-testid="modal-open">{context?.editPersonModalOpen || ''}</div>
      );
    };

    const { getByTestId } = renderWithProviders(router, TestComponent);

    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith(
        {
          pathname: '/contacts',
          query: { accountListId, contactId: [contactId] },
        },
        undefined,
        { shallow: true },
      );
      expect(getByTestId('modal-open').textContent).toBe('');
    });
  });

  describe('tab row scroll cue', () => {
    afterEach(() => {
      restoreTabRowMetrics();
    });

    it('fades the right edge on a phone while Notes is past it', () => {
      // About how wide the five tabs are next to a 390px phone screen
      mockTabRowMetrics({ scrollWidth: 480, clientWidth: 390 });
      const { getAllByRole, getByTestId, queryByTestId } = renderWithProviders(
        createRouter(),
        ContactDetails,
      );

      expect(getByTestId('ContactTabsFadeRight')).toBeInTheDocument();
      expect(queryByTestId('ContactTabsFadeLeft')).not.toBeInTheDocument();
      expect(getAllByRole('tab').map((tab) => tab.textContent)).toEqual(
        tabNames,
      );
    });

    it('fades both edges in the middle and only the left edge at the end', () => {
      mockTabRowMetrics({ scrollWidth: 480, clientWidth: 390 });
      const { getByRole, getByTestId, queryByTestId } = renderWithProviders(
        createRouter(),
        ContactDetails,
      );
      const tabRow = getTabRow(getByRole('tablist'));

      scrollTabRow(tabRow, 45);
      expect(getByTestId('ContactTabsFadeLeft')).toBeInTheDocument();
      expect(getByTestId('ContactTabsFadeRight')).toBeInTheDocument();

      scrollTabRow(tabRow, 90);
      expect(getByTestId('ContactTabsFadeLeft')).toBeInTheDocument();
      expect(queryByTestId('ContactTabsFadeRight')).not.toBeInTheDocument();

      scrollTabRow(tabRow, 0);
      expect(queryByTestId('ContactTabsFadeLeft')).not.toBeInTheDocument();
      expect(getByTestId('ContactTabsFadeRight')).toBeInTheDocument();
    });

    it('fades the left edge over the cut first tab after picking Contact Details at 360px', async () => {
      mockTabRowMetrics({ scrollWidth: 480, clientWidth: 360 });
      const { getByRole, getByTestId, queryByTestId } = renderWithProviders(
        createRouter(),
        ContactDetails,
      );
      expect(queryByTestId('ContactTabsFadeLeft')).not.toBeInTheDocument();

      const contactDetailsTab = getByRole('tab', { name: 'Contact Details' });
      userEvent.click(contactDetailsTab);
      await waitFor(() =>
        expect(contactDetailsTab).toHaveAttribute('aria-selected', 'true'),
      );

      // A browser scrolls the picked tab into view, which leaves part of the
      // Tasks tab cut off at the left edge
      scrollTabRow(getTabRow(getByRole('tablist')), 100);
      expect(getByTestId('ContactTabsFadeLeft')).toBeInTheDocument();
    });

    it('shows no fade when the tabs fit, so tablet and desktop look the same', () => {
      mockTabRowMetrics({ scrollWidth: 900, clientWidth: 900 });
      const { getAllByRole, queryByTestId } = renderWithProviders(
        createRouter(),
        ContactDetails,
      );

      expect(getAllByRole('tab')).toHaveLength(5);
      expect(queryByTestId('ContactTabsFadeLeft')).not.toBeInTheDocument();
      expect(queryByTestId('ContactTabsFadeRight')).not.toBeInTheDocument();
    });

    it('keeps the fades hidden from screen readers and out of the way of taps', () => {
      mockTabRowMetrics({ scrollWidth: 480, clientWidth: 390 });
      const { getAllByRole, getByRole, getByTestId } = renderWithProviders(
        createRouter(),
        ContactDetails,
      );
      const tabList = getByRole('tablist');
      scrollTabRow(getTabRow(tabList), 45);

      const leftFade = getByTestId('ContactTabsFadeLeft');
      const rightFade = getByTestId('ContactTabsFadeRight');
      expect(leftFade).toHaveAttribute('aria-hidden', 'true');
      expect(rightFade).toHaveAttribute('aria-hidden', 'true');
      expect(leftFade).toHaveStyle('pointer-events: none');
      expect(rightFade).toHaveStyle('pointer-events: none');

      // The fades sit on top of the row, not in the list of tabs
      expect(within(tabList).queryByTestId('ContactTabsFadeLeft')).toBeNull();
      expect(within(tabList).queryByTestId('ContactTabsFadeRight')).toBeNull();
      expect(getAllByRole('tab')).toHaveLength(5);
    });

    it('lays the fades over the left and right edges of the tab row', () => {
      mockTabRowMetrics({ scrollWidth: 480, clientWidth: 390 });
      const { getByRole, getByTestId } = renderWithProviders(
        createRouter(),
        ContactDetails,
      );
      const tabList = getByRole('tablist');
      scrollTabRow(getTabRow(tabList), 45);

      const leftFade = getByTestId('ContactTabsFadeLeft');
      const rightFade = getByTestId('ContactTabsFadeRight');
      expect(leftFade).toHaveStyle('position: absolute; top: 0; left: 0');
      expect(rightFade).toHaveStyle('position: absolute; top: 0; right: 0');

      // Both fades are placed against the box that holds the tab row
      const container = leftFade.parentElement as HTMLElement;
      expect(rightFade.parentElement).toBe(container);
      expect(container).toContainElement(tabList);
      expect(container).toHaveStyle('position: relative');
    });

    it('hides the fades from the sm breakpoint up, where MUI shows its scroll arrows', () => {
      mockTabRowMetrics({ scrollWidth: 480, clientWidth: 390 });
      const { getByRole, getByTestId } = renderWithProviders(
        createRouter(),
        ContactDetails,
      );
      scrollTabRow(getTabRow(getByRole('tablist')), 45);

      expect(smUpStyle(getByTestId('ContactTabsFadeLeft'), 'display')).toBe(
        'none',
      );
      expect(smUpStyle(getByTestId('ContactTabsFadeRight'), 'display')).toBe(
        'none',
      );
    });

    it('still switches tabs when a tab under a fade is clicked', async () => {
      mockTabRowMetrics({ scrollWidth: 480, clientWidth: 390 });
      const { getByRole, getByTestId } = renderWithProviders(
        createRouter(),
        ContactDetails,
      );
      expect(getByTestId('ContactTabsFadeRight')).toBeInTheDocument();

      // Notes is the last tab, so on a phone it starts under the right fade
      const notesTab = getByRole('tab', { name: 'Notes' });
      userEvent.click(notesTab);
      await waitFor(() =>
        expect(notesTab).toHaveAttribute('aria-selected', 'true'),
      );

      // Tasks is the first tab, so it ends up under the left fade at the end
      scrollTabRow(getTabRow(getByRole('tablist')), 90);
      expect(getByTestId('ContactTabsFadeLeft')).toBeInTheDocument();
      const tasksTab = getByRole('tab', { name: 'Tasks' });
      userEvent.click(tasksTab);
      await waitFor(() =>
        expect(tasksTab).toHaveAttribute('aria-selected', 'true'),
      );
      expect(notesTab).toHaveAttribute('aria-selected', 'false');
    });
  });
});
