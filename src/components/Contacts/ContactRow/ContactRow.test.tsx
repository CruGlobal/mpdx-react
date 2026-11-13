import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import mediaQuery from 'css-mediaquery';
import { Settings } from 'luxon';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider, gqlMock } from '__tests__/util/graphqlMocking';
import {
  desktopWidth,
  getGridColumnsAtWidth,
  getStyleAtWidth,
  phoneWidth,
} from '__tests__/util/styleAtWidth';
import { ContactPanelProvider } from 'src/components/Shared/ContactPanelProvider/ContactPanelProvider';
import { TaskModalEnum } from 'src/components/Task/Modal/TaskModal';
import theme from 'src/theme';
import useTaskModal from '../../../hooks/useTaskModal';
import {
  ContactsContext,
  ContactsType,
} from '../ContactsContext/ContactsContext';
import { ContactRow } from './ContactRow';
import {
  ContactRowFragment,
  ContactRowFragmentDoc,
} from './ContactRow.generated';

const accountListId = 'account-list-1';

const router = {
  pathname: '/accountLists/[accountListId]/contacts/[...contactId]',
  query: {
    accountListId,
    contactId: ['00000000-0000-0000-0000-000000000000'],
  },
};

const contactMock = {
  id: 'test-id',
  lateAt: null,
  name: 'Test, Name',
  people: {
    nodes: [
      {
        anniversaryDay: null,
        anniversaryMonth: null,
        birthdayDay: null,
        birthdayMonth: null,
      },
    ],
  },
  pledgeAmount: null,
  pledgeCurrency: 'CAD',
  pledgeFrequency: null,
  primaryAddress: {
    city: 'Any City',
    country: null,
    postalCode: 'Test',
    state: 'TT',
    street: '1111 Test Street',
    updatedAt: new Date('2021-06-21T03:40:05-06:00').toISOString(),
  },
  starred: false,
  status: null,
  uncompletedTasksCount: 0,
};

const contact = gqlMock<ContactRowFragment>(ContactRowFragmentDoc, {
  mocks: contactMock,
});

jest.mock('../../../hooks/useTaskModal');

const openTaskModal = jest.fn();
const toggleSelectionById = jest.fn();
const isRowChecked = jest.fn();

const addressChange = {
  id: 'change-1',
  date: '2026-08-03',
  source: 'Siebel',
  createdByUser: null,
};

interface ComponentsProps {
  contactRow?: ContactRowFragment;
  showAddressChange?: boolean;
}

const Components: React.FC<ComponentsProps> = ({
  contactRow = contact,
  showAddressChange,
}) => (
  <TestRouter router={router}>
    <GqlMockedProvider>
      <ThemeProvider theme={theme}>
        <ContactsContext.Provider
          value={
            {
              accountListId,
              toggleSelectionById,
              isRowChecked,
            } as unknown as ContactsType
          }
        >
          <ContactPanelProvider>
            <ContactRow
              contact={contactRow}
              addressChange={showAddressChange ? addressChange : undefined}
            />
          </ContactPanelProvider>
        </ContactsContext.Provider>
      </ThemeProvider>
    </GqlMockedProvider>
  </TestRouter>
);

const nowMillis = Settings.now;
afterEach(() => {
  Settings.now = nowMillis;
});

beforeEach(() => {
  // The address change chip leaves the year off for changes in the current year
  Settings.now = () => new Date(2026, 9, 21).valueOf();
  (useTaskModal as jest.Mock).mockReturnValue({
    openTaskModal,
    preloadTaskModal: jest.fn(),
  });
});

describe('ContactsRow', () => {
  it('default', () => {
    const { getByText } = render(<Components />);

    expect(
      getByText(
        [
          contact.primaryAddress?.street,
          `${contact.primaryAddress?.city}${
            contact.primaryAddress?.city && ','
          }`,
          contact.primaryAddress?.state,
          contact.primaryAddress?.postalCode,
        ].join(' '),
      ),
    ).toBeInTheDocument();
  });

  it('renders the address dimmed', () => {
    const { getByText } = render(<Components />);

    expect(getByText('1111 Test Street Any City, TT Test')).toHaveStyle(
      `color: ${theme.palette.text.secondary}`,
    );
  });

  it('should render check event', async () => {
    const { getByRole } = render(<Components />);

    const checkbox = getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
    userEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it('should open log task modal', async () => {
    const { getByRole } = render(<Components />);

    const taskButton = getByRole('button', { name: 'Log Task' });
    userEvent.click(taskButton);
    expect(openTaskModal).toHaveBeenCalledWith({
      view: TaskModalEnum.Log,
      defaultValues: {
        contactIds: ['test-id'],
      },
    });
  });

  it('should render contact select event', () => {
    isRowChecked.mockImplementationOnce((id) => id === contact.id);

    const { getByTestId } = render(<Components />);

    expect(getByTestId('rowButton')).toHaveAttribute(
      'href',
      `/accountLists/${accountListId}/contacts/${contact.id}`,
    );
  });

  it('shows the latest address change when asked to', () => {
    const { getByText } = render(<Components showAddressChange />);

    expect(getByText('Address changed Aug 3 · automatic')).toBeInTheDocument();
  });

  it('hides the latest address change by default', () => {
    const { queryByText } = render(<Components />);

    expect(queryByText(/Address changed/)).not.toBeInTheDocument();
  });
});

// On phones the name was cut to 8 to 10 letters while the row had empty
// space. jsdom can't measure layout, so these read the CSS that applies at
// each screen width.
describe('ContactRow layout', () => {
  const longName = 'Anderson-Whitfield, Christopher and Elizabeth';
  const longNameContact = gqlMock<ContactRowFragment>(ContactRowFragmentDoc, {
    mocks: { ...contactMock, name: longName, pledgeAmount: 100 },
  });

  // 599px is the widest screen before MUI's sm breakpoint
  const phoneWidths = [360, phoneWidth, 599];
  const tabletWidths = [600, 768];

  const renderRow = () => {
    const utils = render(<Components contactRow={longNameContact} />);
    const name = utils.getByText(longName);
    const nameItem = name.closest('.MuiGrid-root');
    const statusItem = utils.getByText(/CA\$100/).closest('.MuiGrid-root');
    if (!nameItem || !statusItem) {
      throw new Error('Row columns not found');
    }
    return {
      ...utils,
      name,
      nameItem,
      statusItem,
      row: utils.getByTestId('rowButton'),
      buttons: [
        utils.getByRole('button', { name: 'Log Task' }),
        utils.getByRole('button', { name: 'Add star' }),
      ],
    };
  };

  // Whether the element or any wrapper up to (not including) stop is display: none
  const isHiddenAtWidth = (element: Element, stop: Element, width: number) => {
    let current: Element | null = element;
    while (current && current !== stop) {
      if (getStyleAtWidth(current, 'display', width) === 'none') {
        return true;
      }
      current = current.parentElement;
    }
    return false;
  };

  // getStyleAtWidth lets the last matching rule win. The row sets its button
  // padding with a descendant selector, which a browser ranks above the
  // button's own class even though it comes first. So rank rules by how many
  // classes and pseudo-classes their selector has, then by order.
  const getPaddingAtWidth = (element: Element, width: number) => {
    let best = { specificity: -1, value: '' };
    const visit = (rules: CSSRuleList): void => {
      Array.from(rules).forEach((rule) => {
        if (rule instanceof CSSMediaRule) {
          if (
            mediaQuery.match(rule.media.mediaText, { type: 'screen', width })
          ) {
            visit(rule.cssRules);
          }
          return;
        }
        if (!(rule instanceof CSSStyleRule)) {
          return;
        }
        const value = rule.style.getPropertyValue('padding');
        if (!value) {
          return;
        }
        rule.selectorText.split(',').forEach((selector) => {
          let matches = false;
          try {
            matches = element.matches(selector);
          } catch {
            matches = false;
          }
          const specificity = (selector.match(/[.:[#]/g) ?? []).length;
          if (matches && specificity >= best.specificity) {
            best = { specificity, value };
          }
        });
      });
    };
    Array.from(document.styleSheets).forEach((sheet) => visit(sheet.cssRules));
    return best.value;
  };

  describe.each(phoneWidths)('at %ipx', (width) => {
    it('gives the name the full row width', () => {
      const { nameItem, statusItem } = renderRow();

      expect(getGridColumnsAtWidth(nameItem, width)).toBe(12);
      // The status column shows nothing on phones, so it must not take space
      expect(getStyleAtWidth(statusItem, 'display', width)).toBe('none');
    });

    it('keeps only a small gap between the name and the icons', () => {
      const { nameItem } = renderRow();

      const gap = parseFloat(getStyleAtWidth(nameItem, 'padding-right', width));
      expect(gap).toBeGreaterThan(0);
      expect(gap).toBeLessThanOrEqual(8);
    });

    it('still ends a name that does not fit with "..."', () => {
      const { name } = renderRow();

      expect(getStyleAtWidth(name, 'text-overflow', width)).toBe('ellipsis');
      expect(getStyleAtWidth(name, 'white-space', width)).toBe('nowrap');
      expect(getStyleAtWidth(name, 'overflow', width)).toMatch(/clip|hidden/);
    });

    it('keeps the log task and star buttons the same size', () => {
      const { row, buttons } = renderRow();
      const [logTaskPadding, starPadding] = buttons.map((button) =>
        getPaddingAtWidth(button, width),
      );

      buttons.forEach((button) =>
        expect(isHiddenAtWidth(button, row, width)).toBe(false),
      );
      expect(logTaskPadding).toBe(starPadding);
      // MUI's default 8px padding around a 24px icon makes a 40px tap target.
      // Freeing up space for the name must not shrink it.
      expect(parseFloat(logTaskPadding)).toBeGreaterThanOrEqual(8);
    });
  });

  it.each(tabletWidths)(
    'keeps the name and status side by side at %ipx',
    (width) => {
      const { nameItem, statusItem, row } = renderRow();

      expect(getGridColumnsAtWidth(nameItem, width)).toBe(10);
      expect(getGridColumnsAtWidth(statusItem, width)).toBe(2);
      expect(isHiddenAtWidth(statusItem, row, width)).toBe(false);
      expect(getStyleAtWidth(nameItem, 'padding-right', width)).toBe('16px');
    },
  );

  it('keeps the desktop layout', () => {
    const { nameItem, statusItem, row, buttons } = renderRow();

    expect(getGridColumnsAtWidth(nameItem, desktopWidth)).toBe(6);
    expect(getGridColumnsAtWidth(statusItem, desktopWidth)).toBe(6);
    expect(isHiddenAtWidth(statusItem, row, desktopWidth)).toBe(false);
    expect(getStyleAtWidth(nameItem, 'padding-right', desktopWidth)).toBe(
      '16px',
    );
    buttons.forEach((button) =>
      expect(getPaddingAtWidth(button, desktopWidth)).toBe('8px'),
    );
  });
});
