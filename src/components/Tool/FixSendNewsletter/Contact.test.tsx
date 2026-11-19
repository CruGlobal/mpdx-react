import { ThemeProvider } from '@mui/material/styles';
import { render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import matchMediaMock from '__tests__/util/matchMediaMock';
import {
  desktopWidth,
  getGridColumnsAtWidth,
  getStyleAtWidth,
  phoneWidth,
} from '__tests__/util/styleAtWidth';
import { ContactPanelProvider } from 'src/components/Shared/ContactPanelProvider/ContactPanelProvider';
import theme from 'src/theme';
import Contact from './Contact';
import {
  ContactPrimaryAddressFragment,
  ContactPrimaryPersonFragment,
  InvalidNewsletterContactFragment,
} from './InvalidNewsletter.generated';

const accountListId = 'accountListId';
const router = {
  pathname:
    '/accountLists/[accountListId]/tools/fix/sendNewsletter/[[...contactId]]',
  query: { accountListId },
};

const TestComponent = ({
  primaryPerson,
  primaryAddress,
}: {
  primaryPerson: ContactPrimaryPersonFragment;
  primaryAddress: ContactPrimaryAddressFragment;
}) => {
  const contact: InvalidNewsletterContactFragment = {
    id: 'contact123',
    name: 'Test Contact',
    avatar: '',
    primaryPerson: primaryPerson,
    status: null,
    primaryAddress: primaryAddress,
  };
  return (
    <TestRouter router={router}>
      <ThemeProvider theme={theme}>
        <ContactPanelProvider>
          <Contact
            contact={contact}
            setContactUpdates={jest.fn()}
            handleSingleConfirm={jest.fn().mockResolvedValue(undefined)}
          />
        </ContactPanelProvider>
      </ThemeProvider>
    </TestRouter>
  );
};

describe('Fix Newsletter - Contact', () => {
  let primaryPerson = {} as ContactPrimaryPersonFragment;
  let primaryAddress = {} as ContactPrimaryAddressFragment;

  beforeEach(() => {
    primaryPerson = {
      firstName: '',
      lastName: '',
      primaryEmailAddress: {
        id: '',
        email: '',
      },
      optoutEnewsletter: false,
    } as ContactPrimaryPersonFragment;

    primaryAddress = {
      id: '',
      street: '',
      city: '',
      state: '',
      postalCode: '',
      source: '',
      createdAt: '',
    } as ContactPrimaryAddressFragment;
  });
  describe('inital value for dropdown', () => {
    it('should be None', () => {
      const { getByRole } = render(
        <TestComponent
          primaryPerson={primaryPerson}
          primaryAddress={primaryAddress}
        />,
      );

      expect(
        within(getByRole('combobox')).getByText('None'),
      ).toBeInTheDocument();
    });

    it('should be Physical and display startDate', () => {
      primaryAddress.street = '100 Test St';
      primaryAddress.startDate = '2022-12-10T16:05:26-05:00';
      primaryAddress.createdAt = '2022-10-10T16:05:26-05:00';
      primaryAddress.source = 'Siebel';

      const { getByRole, getByText } = render(
        <TestComponent
          primaryPerson={primaryPerson}
          primaryAddress={primaryAddress}
        />,
      );

      expect(getByText(/(12\/10\/2022)/i)).toBeInTheDocument();
      expect(
        within(getByRole('combobox')).getByText('Physical'),
      ).toBeInTheDocument();
    });

    it('should show createdAt if startDate is null', () => {
      primaryAddress.street = '100 Test St';
      primaryAddress.startDate = null;
      primaryAddress.createdAt = '2022-10-10T16:05:26-05:00';
      primaryAddress.source = 'Siebel';

      const { getByRole, getByText } = render(
        <TestComponent
          primaryPerson={primaryPerson}
          primaryAddress={primaryAddress}
        />,
      );

      expect(getByText(/(10\/10\/2022)/i)).toBeInTheDocument();
      expect(
        within(getByRole('combobox')).getByText('Physical'),
      ).toBeInTheDocument();
    });

    it('should be Digital', () => {
      primaryPerson.primaryEmailAddress = { id: '1', email: 'a@b.com' };

      const { getByRole } = render(
        <TestComponent
          primaryPerson={primaryPerson}
          primaryAddress={primaryAddress}
        />,
      );

      expect(
        within(getByRole('combobox')).getByText('Digital'),
      ).toBeInTheDocument();
    });

    it('should be None when opting out of emails', () => {
      primaryPerson.primaryEmailAddress = { id: '1', email: 'a@b.com' };
      primaryPerson.optoutEnewsletter = true;

      const { getByRole } = render(
        <TestComponent
          primaryPerson={primaryPerson}
          primaryAddress={primaryAddress}
        />,
      );

      expect(
        within(getByRole('combobox')).getByText('None'),
      ).toBeInTheDocument();
    });

    it('should be Both', () => {
      primaryAddress.street = '100 Test St';
      primaryPerson.primaryEmailAddress = { id: '1', email: 'a@b.com' };

      const { getByRole } = render(
        <TestComponent
          primaryPerson={primaryPerson}
          primaryAddress={primaryAddress}
        />,
      );

      expect(
        within(getByRole('combobox')).getByText('Both'),
      ).toBeInTheDocument();
    });

    it('should be Physical when opting out of emails', () => {
      primaryAddress.street = '100 Test St';
      primaryPerson.primaryEmailAddress = { id: '1', email: 'a@b.com' };
      primaryPerson.optoutEnewsletter = true;

      const { getByRole } = render(
        <TestComponent
          primaryPerson={primaryPerson}
          primaryAddress={primaryAddress}
        />,
      );

      expect(
        within(getByRole('combobox')).getByText('Physical'),
      ).toBeInTheDocument();
    });
  });

  it('should render link with correct href', async () => {
    const { findByRole } = render(
      <TestComponent
        primaryPerson={primaryPerson}
        primaryAddress={primaryAddress}
      />,
    );

    const contactName = await findByRole('link', { name: 'Test Contact' });
    expect(contactName).toHaveAttribute(
      'href',
      `/accountLists/${accountListId}/tools/fix/sendNewsletter/contact123`,
    );
  });

  it('should show newsletter options in correct order', async () => {
    const { findAllByRole, findByRole } = render(
      <TestComponent
        primaryPerson={primaryPerson}
        primaryAddress={primaryAddress}
      />,
    );

    const combobox = await findByRole('combobox');
    userEvent.click(combobox);
    const options = await findAllByRole('option');
    expect(options).toHaveLength(4);
    expect(options[0]).toHaveTextContent('None');
    expect(options[options.length - 1]).toHaveTextContent('Both');
  });

  describe('long email layout', () => {
    const longEmail = 'alexandra.montgomery-whitfield@example-ministry.org';
    const street = '1234 Long Street Name Ave';

    // Phone widths are below MUI's `sm` (600px) breakpoint
    const phoneWidths = [360, phoneWidth, 599];
    // Tablet widths sit between MUI's `sm` (600px) and `md` (900px) breakpoints
    const tabletWidths = [600, 768, 899];
    // Desktop widths are `md` (900px) and up
    const desktopWidths = [900, desktopWidth];
    const allWidths = [...phoneWidths, ...tabletWidths, ...desktopWidths];

    const renderLongEmail = (screenWidth = phoneWidth) => {
      matchMediaMock({ width: `${screenWidth}px` });
      primaryPerson.firstName = 'Alexandra';
      primaryPerson.lastName = 'Montgomery-Whitfield';
      primaryPerson.primaryEmailAddress = { id: 'email-1', email: longEmail };
      primaryAddress.street = street;
      primaryAddress.city = 'Springfield';
      primaryAddress.state = 'IL';
      primaryAddress.postalCode = '62704';
      primaryAddress.source = 'MPDX';
      primaryAddress.createdAt = '2022-10-10T16:05:26-05:00';

      const utils = render(
        <TestComponent
          primaryPerson={primaryPerson}
          primaryAddress={primaryAddress}
        />,
      );
      const emailText = utils.getByText(longEmail);
      const streetText = utils.getByText(street);
      return {
        ...utils,
        emailText,
        streetText,
        personColumn: emailText.closest('.MuiGrid-root') as HTMLElement,
        addressColumn: streetText.closest('.MuiGrid-root') as HTMLElement,
        newsletterColumn: utils
          .getByText('Send newsletter?')
          .closest('.MuiGrid-root') as HTMLElement,
      };
    };

    // Every element from `element` up to (but not including) `ancestor`
    const elementsBetween = (element: HTMLElement, ancestor: HTMLElement) => {
      const elements: HTMLElement[] = [];
      for (
        let el: HTMLElement | null = element;
        el && el !== ancestor;
        el = el.parentElement
      ) {
        elements.push(el);
      }
      return elements;
    };

    // The left margin or padding of `el` in px. jsdom keeps shorthands like
    // `padding: 16px` as written, so read the left side out of them.
    const leftSideAtWidth = (
      el: HTMLElement,
      box: 'margin' | 'padding',
      width: number,
    ) => {
      const left = getStyleAtWidth(el, `${box}-left`, width);
      if (left) {
        return parseFloat(left) || 0;
      }
      const sides = getStyleAtWidth(el, box, width).split(/\s+/);
      // 1 value: all sides, 2 or 3 values: the 2nd is left/right, 4: the 4th
      const leftValue = sides.length === 4 ? sides[3] : (sides[1] ?? sides[0]);
      return parseFloat(leftValue) || 0;
    };

    // How far in from the left edge of its grid column the text starts
    const leftOffsetAtWidth = (
      text: HTMLElement,
      column: HTMLElement,
      width: number,
    ) =>
      elementsBetween(text, column).reduce(
        (total, el) =>
          total +
          leftSideAtWidth(el, 'margin', width) +
          leftSideAtWidth(el, 'padding', width),
        0,
      );

    it.each(phoneWidths)(
      'stacks the person and address blocks full width on a %ipx phone',
      (width) => {
        const { personColumn, addressColumn, newsletterColumn } =
          renderLongEmail(width);

        expect(getGridColumnsAtWidth(personColumn, width)).toBe(12);
        expect(getGridColumnsAtWidth(addressColumn, width)).toBe(12);
        expect(getGridColumnsAtWidth(newsletterColumn, width)).toBe(12);
      },
    );

    it('puts the person block above the address block', () => {
      const { personColumn, addressColumn } = renderLongEmail();

      expect(personColumn).not.toBe(addressColumn);
      expect(
        personColumn.compareDocumentPosition(addressColumn) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    });

    it.each(tabletWidths)('keeps the 5/4/3 tablet columns at %ipx', (width) => {
      const { personColumn, addressColumn, newsletterColumn } =
        renderLongEmail(width);

      expect(getGridColumnsAtWidth(personColumn, width)).toBe(5);
      expect(getGridColumnsAtWidth(addressColumn, width)).toBe(4);
      expect(getGridColumnsAtWidth(newsletterColumn, width)).toBe(3);
    });

    it.each(desktopWidths)(
      'keeps the 4/4/4 desktop columns at %ipx',
      (width) => {
        const { personColumn, addressColumn, newsletterColumn } =
          renderLongEmail(width);

        expect(getGridColumnsAtWidth(personColumn, width)).toBe(4);
        expect(getGridColumnsAtWidth(addressColumn, width)).toBe(4);
        expect(getGridColumnsAtWidth(newsletterColumn, width)).toBe(4);
      },
    );

    it.each(allWidths)(
      'lets a long email break onto a second line at %ipx',
      (width) => {
        const { emailText } = renderLongEmail(width);

        const overflowWrap = getStyleAtWidth(emailText, 'overflow-wrap', width);
        const wordBreak = getStyleAtWidth(emailText, 'word-break', width);
        expect(
          ['anywhere', 'break-word'].includes(overflowWrap) ||
            ['break-all', 'break-word'].includes(wordBreak),
        ).toBe(true);
        // Not cut off with "..." or kept on one line
        expect(getStyleAtWidth(emailText, 'white-space', width)).not.toBe(
          'nowrap',
        );
        expect(getStyleAtWidth(emailText, 'text-overflow', width)).not.toBe(
          'ellipsis',
        );
      },
    );

    it.each(allWidths)(
      'lets the name and email column get narrower than the email at %ipx',
      (width) => {
        const { emailText, personColumn } = renderLongEmail(width);

        // A flex item in a row can't shrink below its content's width unless
        // its min-width is 0. Otherwise the email pushes past the column.
        const rowFlexItems = elementsBetween(emailText, personColumn).filter(
          (el) =>
            el.parentElement &&
            getStyleAtWidth(el.parentElement, 'display', width) === 'flex' &&
            !getStyleAtWidth(
              el.parentElement,
              'flex-direction',
              width,
            ).startsWith('column'),
        );
        expect(rowFlexItems.length).toBeGreaterThan(0);
        rowFlexItems.forEach((el) => {
          expect(['0', '0px']).toContain(
            getStyleAtWidth(el, 'min-width', width),
          );
        });
      },
    );

    it.each(phoneWidths)(
      'lines up the email and the address on a %ipx phone',
      (width) => {
        const { emailText, streetText, personColumn, addressColumn } =
          renderLongEmail(width);

        const emailOffset = leftOffsetAtWidth(emailText, personColumn, width);
        expect(emailOffset).toBeGreaterThan(0);
        expect(leftOffsetAtWidth(streetText, addressColumn, width)).toBe(
          emailOffset,
        );
      },
    );

    it('shows the whole email as a mailto link', () => {
      const { getByRole, getByText } = renderLongEmail();

      expect(getByRole('link', { name: longEmail })).toHaveAttribute(
        'href',
        `mailto:${longEmail}`,
      );
      expect(getByText('Alexandra Montgomery-Whitfield')).toBeInTheDocument();
    });
  });
});
