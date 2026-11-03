import { ThemeProvider } from '@mui/material/styles';
import { render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import matchMediaMock from '__tests__/util/matchMediaMock';
import { SendNewsletterEnum } from 'src/graphql/types.generated';
import theme from '../../../../../theme';
import { ContactDetailProvider } from '../../ContactDetailContext';
import { ContactDetailsTabMailing } from './ContactDetailsTabMailing';
import { ContactMailingFragment } from './ContactMailing.generated';

const accountListId = 'account-list-1';
const router = {
  query: { accountListId },
};

const data: ContactMailingFragment = {
  id: 'contact-1',
  name: 'John Doe',
  greeting: 'John',
  envelopeGreeting: 'John Doe',
  sendNewsletter: SendNewsletterEnum.None,
  addresses: {
    nodes: [
      {
        id: 'address-1',
        city: 'Orlando',
        country: 'USA',
        historic: false,
        location: '100 Lake Hart Dr',
        metroArea: null,
        postalCode: '32832',
        primaryMailingAddress: true,
        region: null,
        source: 'MPDX',
        state: null,
        street: '100 Lake Hart Dr',
        createdAt: new Date(2023, 0, 1).toISOString(),
        startDate: null,
      },
      {
        id: 'address-2',
        city: 'Orlando',
        country: 'USA',
        historic: false,
        location: '101 Lake Hart Dr',
        metroArea: null,
        postalCode: '32832',
        primaryMailingAddress: false,
        region: null,
        source: 'MPDX',
        state: null,
        street: '101 Lake Hart Dr',
        createdAt: new Date(2023, 0, 2).toISOString(),
        startDate: new Date(2023, 0, 30).toISOString(),
      },
    ],
  },
  latestAddressChange: {
    id: 'change-1',
    date: '2023-01-01',
    source: 'MPDX',
    createdByUser: null,
  },
};

describe('ContactDetailsTabMailing', () => {
  it('shows address createdAt date', () => {
    const { getByText } = render(
      <TestRouter router={router}>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider>
            <ContactDetailProvider>
              <ContactDetailsTabMailing
                accountListId={accountListId}
                data={data}
              />
            </ContactDetailProvider>
          </GqlMockedProvider>
        </ThemeProvider>
      </TestRouter>,
    );

    expect(getByText('Source: MPDX (Jan 1, 2023)')).toBeInTheDocument();
  });

  it('shows address startDate instead of createdAt date', () => {
    const { getByText } = render(
      <TestRouter router={router}>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider>
            <ContactDetailProvider>
              <ContactDetailsTabMailing
                accountListId={accountListId}
                data={data}
              />
            </ContactDetailProvider>
          </GqlMockedProvider>
        </ThemeProvider>
      </TestRouter>,
    );
    userEvent.click(getByText('Show 1 More'));
    expect(getByText('Source: MPDX (Jan 30, 2023)')).toBeInTheDocument();
  });

  it('does not show state if null', () => {
    const { getByText, getByTestId } = render(
      <TestRouter router={router}>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider>
            <ContactDetailProvider>
              <ContactDetailsTabMailing
                accountListId={accountListId}
                data={data}
              />
            </ContactDetailProvider>
          </GqlMockedProvider>
        </ThemeProvider>
      </TestRouter>,
    );

    expect(getByText('Orlando, 32832')).toBeInTheDocument();

    userEvent.click(getByText('Show 1 More'));
    const { getByText: getByTextInTestId } = within(
      getByTestId('NonPrimaryAddresses'),
    );
    expect(getByTextInTestId('Orlando, 32832')).toBeInTheDocument();
  });

  it('shows state if present', () => {
    data.addresses.nodes[0].state = 'FL';
    data.addresses.nodes[1].state = 'FL';

    const { getByText, getByTestId } = render(
      <TestRouter router={router}>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider>
            <ContactDetailProvider>
              <ContactDetailsTabMailing
                accountListId={accountListId}
                data={data}
              />
            </ContactDetailProvider>
          </GqlMockedProvider>
        </ThemeProvider>
      </TestRouter>,
    );

    expect(getByText('Orlando, FL 32832')).toBeInTheDocument();

    userEvent.click(getByText('Show 1 More'));
    const { getByText: getByTextInTestId } = within(
      getByTestId('NonPrimaryAddresses'),
    );
    expect(getByTextInTestId('Orlando, FL 32832')).toBeInTheDocument();
  });

  describe('Add Address button', () => {
    // The ticket was found at 390px wide.
    const phoneWidth = '390px';
    const desktopWidth = '1024px';

    const renderMailing = (mailingData: ContactMailingFragment = data) =>
      render(
        <TestRouter router={router}>
          <SnackbarProvider>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider>
                <ContactDetailProvider>
                  <ContactDetailsTabMailing
                    accountListId={accountListId}
                    data={mailingData}
                  />
                </ContactDetailProvider>
              </GqlMockedProvider>
            </ThemeProvider>
          </SnackbarProvider>
        </TestRouter>,
      );

    // jsdom has no real layout, so we can't measure overlap. What lets the
    // button sit on top of the address row is an absolutely positioned wrapper,
    // so look for that instead.
    const findAbsoluteAncestor = (element: HTMLElement): HTMLElement | null => {
      let current: HTMLElement | null = element;
      while (current && current !== document.body) {
        if (window.getComputedStyle(current).position === 'absolute') {
          return current;
        }
        current = current.parentElement;
      }
      return null;
    };

    const comesBefore = (first: Node, second: Node) =>
      Boolean(
        first.compareDocumentPosition(second) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      );

    describe('on phones', () => {
      beforeEach(() => {
        matchMediaMock({ width: phoneWidth });
      });

      it('renders exactly one Add Address button', () => {
        const { getAllByRole } = renderMailing();

        expect(getAllByRole('button', { name: 'Add Address' })).toHaveLength(1);
      });

      it('does not float Add Address on top of the addresses', () => {
        const { getByRole } = renderMailing();

        expect(
          findAbsoluteAncestor(getByRole('button', { name: 'Add Address' })),
        ).toBeNull();
      });

      it('puts Add Address on its own row below the primary address', () => {
        const { getByRole, getByText } = renderMailing();
        const addAddress = getByRole('button', { name: 'Add Address' });

        expect(comesBefore(getByText('100 Lake Hart Dr'), addAddress)).toBe(
          true,
        );
        expect(comesBefore(getByText('- Primary'), addAddress)).toBe(true);
        expect(
          comesBefore(
            getByRole('button', { name: 'Edit Address' }),
            addAddress,
          ),
        ).toBe(true);
        expect(
          comesBefore(getByRole('button', { name: 'Show 1 More' }), addAddress),
        ).toBe(true);
      });

      it('keeps Add Address below every address after Show More', () => {
        const { getByRole, getAllByRole } = renderMailing();
        userEvent.click(getByRole('button', { name: 'Show 1 More' }));

        const addAddress = getByRole('button', { name: 'Add Address' });
        const pencils = getAllByRole('button', { name: 'Edit Address' });
        expect(pencils).toHaveLength(2);
        pencils.forEach((pencil) => {
          expect(comesBefore(pencil, addAddress)).toBe(true);
        });
        expect(
          comesBefore(getByRole('button', { name: 'Show Fewer' }), addAddress),
        ).toBe(true);
      });

      it('opens Edit Address for the primary address from its pencil', async () => {
        const { getByRole, findByRole } = renderMailing();

        userEvent.click(getByRole('button', { name: 'Edit Address' }));

        const dialog = await findByRole('dialog', { name: 'Edit Address' });
        expect(
          within(dialog).getByRole('combobox', { name: 'Street' }),
        ).toHaveValue('100 Lake Hart Dr');
      });
    });

    describe('on larger screens', () => {
      beforeEach(() => {
        matchMediaMock({ width: desktopWidth });
      });

      it('renders exactly one Add Address button, above the addresses', () => {
        const { getAllByRole, getByText } = renderMailing();

        const addAddress = getAllByRole('button', { name: 'Add Address' });
        expect(addAddress).toHaveLength(1);
        expect(comesBefore(addAddress[0], getByText('100 Lake Hart Dr'))).toBe(
          true,
        );
      });

      // Same corner offsets as before the fix (sx `right: 2, top: 2` is pixels).
      it('keeps Add Address pinned to the top right corner', () => {
        const { getByRole } = renderMailing();

        const pinned = findAbsoluteAncestor(
          getByRole('button', { name: 'Add Address' }),
        );
        expect(pinned).toBeInstanceOf(HTMLElement);
        expect(pinned).toHaveStyle({
          position: 'absolute',
          right: '2px',
          top: '2px',
        });
      });
    });

    it.each([
      ['phones', phoneWidth],
      ['larger screens', desktopWidth],
    ])('opens the Add Address modal on %s', async (_, width) => {
      matchMediaMock({ width });
      const { getByRole, findByRole } = renderMailing();

      userEvent.click(getByRole('button', { name: 'Add Address' }));

      expect(
        await findByRole('dialog', { name: 'Add Address' }),
      ).toBeInTheDocument();
    });

    it.each([
      ['phones', phoneWidth],
      ['larger screens', desktopWidth],
    ])(
      'shows one Add Address button on %s when there are no addresses',
      (_, width) => {
        matchMediaMock({ width });
        const { getAllByRole, queryByRole } = renderMailing({
          ...data,
          addresses: { nodes: [] },
        });

        expect(getAllByRole('button', { name: 'Add Address' })).toHaveLength(1);
        expect(
          queryByRole('button', { name: 'Edit Address' }),
        ).not.toBeInTheDocument();
      },
    );

    it.each([
      ['599px', 'below'],
      ['600px', 'above'],
    ])('at %s wide puts Add Address %s the addresses', (width, placement) => {
      matchMediaMock({ width });
      const { getByRole, getByText } = renderMailing();

      expect(
        comesBefore(
          getByRole('button', { name: 'Add Address' }),
          getByText('100 Lake Hart Dr'),
        ),
      ).toBe(placement === 'above');
    });
  });

  it('opens the address history', async () => {
    const { getByRole, findByRole } = render(
      <TestRouter router={router}>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider>
            <ContactDetailProvider>
              <ContactDetailsTabMailing
                accountListId={accountListId}
                data={data}
              />
            </ContactDetailProvider>
          </GqlMockedProvider>
        </ThemeProvider>
      </TestRouter>,
    );

    userEvent.click(getByRole('button', { name: 'History' }));

    expect(
      within(await findByRole('dialog')).getByText('Address History'),
    ).toBeInTheDocument();
  });

  it('shows who changed the primary address and when, and only for the primary', async () => {
    const { findByText, getByText, getByTestId } = render(
      <TestRouter router={router}>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider>
            <ContactDetailProvider>
              <ContactDetailsTabMailing
                accountListId={accountListId}
                data={data}
              />
            </ContactDetailProvider>
          </GqlMockedProvider>
        </ThemeProvider>
      </TestRouter>,
    );

    expect(
      await findByText('Address changed Jan 1, 2023 · in MPDX'),
    ).toBeInTheDocument();

    userEvent.click(getByText('Show 1 More'));
    expect(
      within(getByTestId('NonPrimaryAddresses')).queryByText(/Address changed/),
    ).not.toBeInTheDocument();
  });
});
