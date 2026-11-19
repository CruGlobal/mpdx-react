import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { act, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { placePromise, setupMocks } from '__tests__/util/googlePlacesMock';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import {
  desktopWidth,
  getStyleAtWidth,
  phoneWidth,
} from '__tests__/util/styleAtWidth';
import { loadConstantsMockData } from 'src/components/Constants/LoadConstantsMock';
import { CreateContactAddressMutation } from 'src/components/Contacts/ContactDetails/ContactDetailsTab/Mailing/AddAddressModal/CreateContactAddress.generated';
import { StatusEnum } from 'src/graphql/types.generated';
import theme from '../../../../../../../../theme';
import { CreateContactMutation } from '../CreateContact/CreateContact.generated';
import { CreateMultipleContacts } from './CreateMultipleContacts';

jest.mock('@react-google-maps/api');

interface CreateContactMocks {
  CreateContact: CreateContactMutation;
  CreateContactAddress: CreateContactAddressMutation;
}

const accountListId = '111';
const handleClose = jest.fn();

const router = {
  push: jest.fn(),
};

describe('CreateMultipleContacts', () => {
  beforeEach(() => {
    setupMocks();
  });

  it('default', () => {
    const { queryByText } = render(
      <ThemeProvider theme={theme}>
        <SnackbarProvider>
          <TestRouter router={router}>
            <GqlMockedProvider>
              <CreateMultipleContacts
                accountListId={accountListId}
                handleClose={handleClose}
                rows={3}
              />
            </GqlMockedProvider>
          </TestRouter>
        </SnackbarProvider>
      </ThemeProvider>,
    );
    expect(queryByText('First')).toBeInTheDocument();
    expect(queryByText('Spouse')).toBeInTheDocument();
    expect(queryByText('Last')).toBeInTheDocument();
    expect(queryByText('Street Address')).toBeInTheDocument();
    expect(queryByText('Phone')).toBeInTheDocument();
    expect(queryByText('Email')).toBeInTheDocument();
  });

  it('labels each field cell for the stacked phone layout', () => {
    const { getAllByRole } = render(
      <ThemeProvider theme={theme}>
        <SnackbarProvider>
          <TestRouter router={router}>
            <GqlMockedProvider>
              <CreateMultipleContacts
                accountListId={accountListId}
                handleClose={handleClose}
                rows={1}
              />
            </GqlMockedProvider>
          </TestRouter>
        </SnackbarProvider>
      </ThemeProvider>,
    );
    const bodyRow = getAllByRole('row')[1];
    const labels = Array.from(bodyRow.querySelectorAll('td')).map((cell) =>
      cell.getAttribute('data-label'),
    );
    expect(labels).toEqual([
      'First',
      'Spouse',
      'Last',
      'Street Address',
      'Phone',
      'Email',
      'Status',
    ]);
  });

  describe('layout by screen width', () => {
    // A tablet in portrait, between MUI's sm (600px) and md (900px)
    const tabletWidth = 768;
    const columns = [
      'First',
      'Spouse',
      'Last',
      'Street Address',
      'Phone',
      'Email',
      'Status',
    ];
    const wideColumns = ['Street Address', 'Email', 'Status'];

    // jsdom doesn't lay anything out, so every element reports 0 for its
    // widths and scroll position. Report the sizes a browser would measure for
    // the element that scrolls the table and leave every other element alone.
    const scrollMetrics = { scrollWidth: 0, clientWidth: 0, scrollLeft: 0 };
    type ScrollMetric = keyof typeof scrollMetrics;
    const metricNames: ScrollMetric[] = [
      'scrollWidth',
      'clientWidth',
      'scrollLeft',
    ];
    const metricDescriptors = metricNames.map((name) => ({
      name,
      inherited: Object.getOwnPropertyDescriptor(Element.prototype, name),
      own: Object.getOwnPropertyDescriptor(HTMLElement.prototype, name),
    }));

    const isTableScroller = (element: Element): boolean =>
      element.firstElementChild?.tagName === 'TABLE';

    const mockScrollMetrics = (
      metrics: Pick<typeof scrollMetrics, 'scrollWidth' | 'clientWidth'>,
    ) => {
      Object.assign(scrollMetrics, metrics, { scrollLeft: 0 });
      metricDescriptors.forEach(({ name, inherited }) => {
        Object.defineProperty(HTMLElement.prototype, name, {
          configurable: true,
          get(this: HTMLElement) {
            return isTableScroller(this)
              ? scrollMetrics[name]
              : inherited?.get?.call(this);
          },
          set(this: HTMLElement, value: number) {
            if (isTableScroller(this)) {
              scrollMetrics[name] = value;
            } else {
              inherited?.set?.call(this, value);
            }
          },
        });
      });
    };

    afterEach(() => {
      metricDescriptors.forEach(({ name, own }) => {
        if (own) {
          Object.defineProperty(HTMLElement.prototype, name, own);
        } else {
          Reflect.deleteProperty(HTMLElement.prototype, name);
        }
      });
    });

    // Swiping the table in a browser moves its scroll position and fires a
    // scroll event, so do the same here
    const scrollTable = (table: HTMLElement, scrollLeft: number) => {
      const scroller = table.parentElement as HTMLElement;
      act(() => {
        scroller.scrollLeft = scrollLeft;
        scroller.dispatchEvent(new Event('scroll'));
      });
    };

    const renderOneRow = () =>
      render(
        <ThemeProvider theme={theme}>
          <SnackbarProvider>
            <TestRouter router={router}>
              <GqlMockedProvider>
                <CreateMultipleContacts
                  accountListId={accountListId}
                  handleClose={handleClose}
                  rows={1}
                />
              </GqlMockedProvider>
            </TestRouter>
          </SnackbarProvider>
        </ThemeProvider>,
      );

    it('keeps the 7-column table with its header row on tablets', () => {
      const { getAllByRole } = renderOneRow();
      const [headerRow, bodyRow] = getAllByRole('row');

      expect(
        getAllByRole('columnheader').map((cell) => cell.textContent),
      ).toEqual(columns);
      expect(getStyleAtWidth(headerRow, 'display', tabletWidth)).toBe('flex');
      expect(getStyleAtWidth(bodyRow, 'display', tabletWidth)).toBe('flex');
      expect(getStyleAtWidth(bodyRow, 'flex-direction', tabletWidth)).not.toBe(
        'column',
      );
    });

    it('gives each tablet field room to read what you type', () => {
      const { getAllByRole } = renderOneRow();
      const headerCells = getAllByRole('columnheader');
      const bodyCells = Array.from(
        getAllByRole('row')[1].querySelectorAll('td'),
      );

      expect(bodyCells).toHaveLength(columns.length);
      bodyCells.forEach((cell, index) => {
        const column = cell.getAttribute('data-label') ?? '';
        const minWidth = parseFloat(
          getStyleAtWidth(cell, 'min-width', tabletWidth),
        );

        expect(column).toBe(columns[index]);
        expect(minWidth).toBeGreaterThanOrEqual(
          wideColumns.includes(column) ? 200 : 160,
        );
        // The header cell above it is just as wide, so the columns line up
        expect(
          getStyleAtWidth(headerCells[index], 'min-width', tabletWidth),
        ).toBe(getStyleAtWidth(cell, 'min-width', tabletWidth));
      });
    });

    it('still stacks each contact into a labeled card on phones', () => {
      const { getAllByRole } = renderOneRow();
      const [headerRow, bodyRow] = getAllByRole('row');

      expect(getStyleAtWidth(bodyRow, 'flex-direction', phoneWidth)).toBe(
        'column',
      );
      expect(getStyleAtWidth(headerRow, 'display', phoneWidth)).toBe('none');
      expect(
        Array.from(bodyRow.querySelectorAll('td')).map((cell) =>
          cell.getAttribute('data-label'),
        ),
      ).toEqual(columns);
    });

    it('fades the edge that has more columns past it', () => {
      // About how wide the 7 tablet columns are next to a tablet-sized dialog
      mockScrollMetrics({ scrollWidth: 1350, clientWidth: 700 });
      const { getByRole, getByTestId, queryByTestId } = renderOneRow();

      expect(getByTestId('TableScrollFadeRight')).toBeInTheDocument();
      expect(queryByTestId('TableScrollFadeLeft')).not.toBeInTheDocument();

      scrollTable(getByRole('table'), 300);
      expect(getByTestId('TableScrollFadeLeft')).toBeInTheDocument();
      expect(getByTestId('TableScrollFadeRight')).toBeInTheDocument();

      scrollTable(getByRole('table'), 650);
      expect(getByTestId('TableScrollFadeLeft')).toBeInTheDocument();
      expect(queryByTestId('TableScrollFadeRight')).not.toBeInTheDocument();
    });

    it('shows no scroll fade when the whole table fits', () => {
      mockScrollMetrics({ scrollWidth: 1100, clientWidth: 1100 });
      const { queryByTestId } = renderOneRow();

      expect(queryByTestId('TableScrollFadeLeft')).not.toBeInTheDocument();
      expect(queryByTestId('TableScrollFadeRight')).not.toBeInTheDocument();
    });

    it('keeps desktop the same from 900px up', () => {
      mockScrollMetrics({ scrollWidth: 1350, clientWidth: 700 });
      const { getAllByRole, getByTestId } = renderOneRow();
      const [headerRow, bodyRow] = getAllByRole('row');
      const fade = getByTestId('TableScrollFadeRight');
      const firstCell = bodyRow.querySelector('td') as HTMLElement;

      expect(getStyleAtWidth(fade, 'display', tabletWidth)).not.toBe('none');
      expect(getStyleAtWidth(fade, 'display', 900)).toBe('none');
      expect(getStyleAtWidth(fade, 'display', desktopWidth)).toBe('none');

      expect(getAllByRole('columnheader')).toHaveLength(columns.length);
      expect(getStyleAtWidth(headerRow, 'display', 900)).toBe('flex');
      expect(getStyleAtWidth(bodyRow, 'flex-direction', 900)).not.toBe(
        'column',
      );
      // The tablet widths stop at 900px, so desktop keeps its old column size
      expect(getStyleAtWidth(firstCell, 'min-width', 1000)).toBe('130px');
    });
  });
  it('closes menu', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <SnackbarProvider>
          <TestRouter router={router}>
            <GqlMockedProvider>
              <CreateMultipleContacts
                accountListId={accountListId}
                handleClose={handleClose}
                rows={3}
              />
            </GqlMockedProvider>
          </TestRouter>
        </SnackbarProvider>
      </ThemeProvider>,
    );

    userEvent.click(getByText('Cancel'));
    expect(handleClose).toHaveBeenCalled();
  });

  describe('Contact Creation', () => {
    const mutationSpy = jest.fn();
    const first = 'Christian';
    const last = 'Huffman';
    const spouse = 'Kaylee';
    const address = '123 Main Street';
    const phone = '+1 (111) 222-3344';
    const email = 'christian.huffman@cru.org';
    const status = StatusEnum.PartnerFinancial;
    const statusTextName =
      loadConstantsMockData.constant.status?.find((s) => s.id === status)
        ?.value || '';

    const first2 = 'Robert';
    const last2 = 'Eldredge';
    const spouse2 = 'Sarah';

    const first3 = 'Cool';

    it('creates one contact', async () => {
      const { getByText, getAllByRole } = render(
        <ThemeProvider theme={theme}>
          <SnackbarProvider>
            <TestRouter router={router}>
              <GqlMockedProvider<CreateContactMocks>
                onCall={mutationSpy}
                mocks={{
                  CreateContact: {
                    createContact: {
                      contact: {
                        id: 'contact-1',
                      },
                    },
                  },
                  CreateContactAddress: {
                    createAddress: {
                      address: {
                        id: 'address-1',
                      },
                    },
                  },
                }}
              >
                <CreateMultipleContacts
                  accountListId={accountListId}
                  handleClose={handleClose}
                  rows={3}
                />
              </GqlMockedProvider>
            </TestRouter>
          </SnackbarProvider>
        </ThemeProvider>,
      );

      userEvent.type(getAllByRole('textbox', { name: 'First' })[0], first);
      userEvent.type(getAllByRole('textbox', { name: 'Last' })[0], last);
      userEvent.type(getAllByRole('textbox', { name: 'Spouse' })[0], spouse);
      userEvent.type(getAllByRole('combobox')[0], address);
      userEvent.type(getAllByRole('textbox', { name: 'Phone' })[0], phone);
      userEvent.type(getAllByRole('textbox', { name: 'Email' })[0], email);
      userEvent.type(
        getAllByRole('listbox', { name: 'Status' })[0],
        statusTextName,
      );
      await waitFor(() => expect(getByText('Save')).not.toBeDisabled());
      userEvent.click(getByText('Save'));
      await waitFor(() => expect(handleClose).toHaveBeenCalled());

      expect(mutationSpy).toHaveGraphqlOperation('CreateContact', {
        accountListId,
        attributes: {
          name: `${last}, ${first} and ${spouse}`,
          contactReferralsToMe: undefined,
          status: StatusEnum.NeverContacted,
        },
      });

      expect(mutationSpy).toHaveGraphqlOperation('CreatePerson', {
        accountListId,
        attributes: {
          contactId: 'contact-1',
          emailAddresses: [{ email: email, primary: true }],
          firstName: first,
          lastName: last,
          phoneNumbers: [{ number: phone, primary: true }],
        },
      });

      expect(mutationSpy).toHaveGraphqlOperation('CreateContactAddress', {
        accountListId,
        attributes: {
          contactId: 'contact-1',
          street: address,
        },
      });
      expect(mutationSpy).toHaveGraphqlOperation('SetContactPrimaryAddress', {
        contactId: 'contact-1',
        primaryAddressId: 'address-1',
      });

      expect(router.push).toHaveBeenCalledWith({
        pathname: '/accountLists/[accountListId]/contacts',
        query: {
          accountListId,
          filters: JSON.stringify({ ids: ['contact-1'] }),
        },
      });
    }, 20000);

    it('creates one referral', async () => {
      const { getByRole, getAllByRole } = render(
        <ThemeProvider theme={theme}>
          <SnackbarProvider>
            <TestRouter router={router}>
              <GqlMockedProvider<{ CreateContact: CreateContactMutation }>
                onCall={mutationSpy}
                mocks={{
                  CreateContact: {
                    createContact: {
                      contact: {
                        id: 'contact-1',
                      },
                    },
                  },
                }}
              >
                <CreateMultipleContacts
                  accountListId={accountListId}
                  handleClose={handleClose}
                  rows={3}
                  referredById={'referrer-1'}
                />
              </GqlMockedProvider>
            </TestRouter>
          </SnackbarProvider>
        </ThemeProvider>,
      );

      userEvent.type(getAllByRole('textbox', { name: 'First' })[0], first);
      userEvent.click(getByRole('button', { name: 'Save' }));

      await waitFor(() => expect(mutationSpy).toHaveBeenCalled());

      expect(mutationSpy).toHaveGraphqlOperation('CreateContact', {
        accountListId,
        attributes: {
          contactReferralsToMe: [{ referredById: 'referrer-1' }],
        },
      });
    });

    it('creates multiple contacts - part 1', async () => {
      const { getByText, getAllByRole } = render(
        <ThemeProvider theme={theme}>
          <SnackbarProvider>
            <TestRouter router={router}>
              <GqlMockedProvider onCall={mutationSpy}>
                <CreateMultipleContacts
                  accountListId={accountListId}
                  handleClose={handleClose}
                  rows={3}
                />
              </GqlMockedProvider>
            </TestRouter>
          </SnackbarProvider>
        </ThemeProvider>,
      );

      userEvent.type(getAllByRole('textbox', { name: 'First' })[0], first);
      userEvent.type(getAllByRole('textbox', { name: 'First' })[1], first2);

      userEvent.type(getAllByRole('textbox', { name: 'Last' })[0], last);
      userEvent.type(getAllByRole('textbox', { name: 'Last' })[1], last2);

      userEvent.type(getAllByRole('textbox', { name: 'Spouse' })[0], spouse);

      userEvent.type(getAllByRole('textbox', { name: 'Phone' })[0], phone);

      userEvent.type(getAllByRole('textbox', { name: 'Email' })[0], email);

      await waitFor(() => expect(getByText('Save')).not.toBeDisabled());
      userEvent.click(getByText('Save'));
      await waitFor(() => expect(handleClose).toHaveBeenCalled());

      // Contact 1
      expect(mutationSpy).toHaveGraphqlOperation('CreateContact', {
        accountListId,
        attributes: {
          name: `${last}, ${first} and ${spouse}`,
        },
      });
      // Contact 2
      expect(mutationSpy).toHaveGraphqlOperation('CreateContact', {
        accountListId,
        attributes: {
          name: `${last2}, ${first2}`,
        },
      });

      // Contact 1 Person 1
      expect(mutationSpy).toHaveGraphqlOperation('CreatePerson', {
        accountListId,
        attributes: {
          emailAddresses: [{ email: email, primary: true }],
          firstName: first,
          lastName: last,
          phoneNumbers: [{ number: phone, primary: true }],
        },
      });
      // Contact 2  Person 1
      expect(mutationSpy).toHaveGraphqlOperation('CreatePerson', {
        accountListId,
        attributes: {
          firstName: first2,
          lastName: last2,
        },
      });

      // Contact 1 Person 2 - Awaiting on Contact 1 Person 1 to resolve.
      expect(mutationSpy).toHaveGraphqlOperation('CreatePerson', {
        accountListId,
        attributes: {
          firstName: spouse,
          lastName: last,
        },
      });
    });

    it('creates multiple contacts - part 2', async () => {
      const { getByText, getAllByRole } = render(
        <ThemeProvider theme={theme}>
          <SnackbarProvider>
            <TestRouter router={router}>
              <GqlMockedProvider onCall={mutationSpy}>
                <CreateMultipleContacts
                  accountListId={accountListId}
                  handleClose={handleClose}
                  rows={3}
                />
              </GqlMockedProvider>
            </TestRouter>
          </SnackbarProvider>
        </ThemeProvider>,
      );

      userEvent.type(getAllByRole('textbox', { name: 'First' })[0], first2);
      userEvent.type(getAllByRole('textbox', { name: 'First' })[1], first3);

      userEvent.type(getAllByRole('textbox', { name: 'Spouse' })[0], spouse2);

      await waitFor(() => expect(getByText('Save')).not.toBeDisabled());
      userEvent.click(getByText('Save'));
      await waitFor(() => expect(handleClose).toHaveBeenCalled());

      // Contact 1
      expect(mutationSpy).toHaveGraphqlOperation('CreateContact', {
        accountListId,
        attributes: {
          name: `${first2} and ${spouse2}`,
        },
      });

      // Contact 2
      expect(mutationSpy).toHaveGraphqlOperation('CreateContact', {
        accountListId,
        attributes: {
          name: first3,
        },
      });

      // Contact 2  Person 1
      expect(mutationSpy).toHaveGraphqlOperation('CreatePerson', {
        accountListId,
        attributes: {
          firstName: first2,
          lastName: '',
        },
      });

      // Contact 3  Person 1
      expect(mutationSpy).toHaveGraphqlOperation('CreatePerson', {
        accountListId,
        attributes: {
          firstName: first3,
          lastName: '',
        },
      });

      // Contact 2  Person 2 - Awaiting on Contact 2 Person 1 to resolve
      expect(mutationSpy).toHaveGraphqlOperation('CreatePerson', {
        accountListId,
        attributes: {
          firstName: spouse2,
          lastName: '',
        },
      });
    });

    it('handles chosen address predictions', async () => {
      jest.useFakeTimers();

      const { getAllByRole, getByRole } = render(
        <SnackbarProvider>
          <ThemeProvider theme={theme}>
            <TestRouter router={router}>
              <GqlMockedProvider onCall={mutationSpy}>
                <CreateMultipleContacts
                  accountListId={accountListId}
                  handleClose={handleClose}
                  rows={3}
                />
              </GqlMockedProvider>
            </TestRouter>
          </ThemeProvider>
        </SnackbarProvider>,
      );

      // Let Google Maps initialize
      jest.runOnlyPendingTimers();

      userEvent.type(getAllByRole('textbox', { name: 'First' })[0], first);
      const addressAutocomplete = getAllByRole('combobox')[0];
      userEvent.type(addressAutocomplete, '100 Lake Hart');

      jest.advanceTimersByTime(2000);
      await act(async () => {
        await placePromise;
      });

      userEvent.click(
        getByRole('option', {
          name: '100 Lake Hart Dr, Orlando, FL 32832, USA',
        }),
      );
      expect(addressAutocomplete).toHaveValue('100 Lake Hart Drive A');
      userEvent.click(getByRole('button', { name: 'Save' }));

      await waitFor(() => expect(mutationSpy).toHaveBeenCalled());

      await waitFor(() =>
        expect(mutationSpy).toHaveGraphqlOperation('CreateContactAddress', {
          accountListId,
          attributes: {
            street: '100 Lake Hart Drive A',
            city: 'Orlando',
            region: 'Orange County',
            metroArea: 'Orlando',
            state: 'FL',
            country: 'United States',
            postalCode: '32832',
          },
        }),
      );
    }, 20000);

    it('creates one contact with default status', async () => {
      const { getByText, getAllByRole } = render(
        <ThemeProvider theme={theme}>
          <SnackbarProvider>
            <TestRouter router={router}>
              <GqlMockedProvider<CreateContactMocks>
                onCall={mutationSpy}
                mocks={{
                  CreateContact: {
                    createContact: {
                      contact: {
                        id: 'contact-1',
                      },
                    },
                  },
                  CreateContactAddress: {
                    createAddress: {
                      address: {
                        id: 'address-1',
                      },
                    },
                  },
                }}
              >
                <CreateMultipleContacts
                  accountListId={accountListId}
                  handleClose={handleClose}
                  rows={3}
                />
              </GqlMockedProvider>
            </TestRouter>
          </SnackbarProvider>
        </ThemeProvider>,
      );

      userEvent.type(getAllByRole('textbox', { name: 'First' })[0], first);
      userEvent.type(getAllByRole('textbox', { name: 'Last' })[0], last);
      userEvent.type(getAllByRole('textbox', { name: 'Spouse' })[0], spouse);
      userEvent.type(getAllByRole('combobox')[0], address);
      userEvent.type(getAllByRole('textbox', { name: 'Phone' })[0], phone);
      userEvent.type(getAllByRole('textbox', { name: 'Email' })[0], email);

      await waitFor(() => expect(getByText('Save')).not.toBeDisabled());
      userEvent.click(getByText('Save'));
      await waitFor(() => expect(handleClose).toHaveBeenCalled());

      expect(mutationSpy).toHaveGraphqlOperation('CreateContact', {
        accountListId,
        attributes: {
          name: `${last}, ${first} and ${spouse}`,
          contactReferralsToMe: undefined,
          status: 'NEVER_CONTACTED',
        },
      });

      expect(mutationSpy).toHaveGraphqlOperation('CreatePerson', {
        accountListId,
        attributes: {
          contactId: 'contact-1',
          emailAddresses: [{ email: email, primary: true }],
          firstName: first,
          lastName: last,
          phoneNumbers: [{ number: phone, primary: true }],
        },
      });

      expect(mutationSpy).toHaveGraphqlOperation('CreateContactAddress', {
        accountListId,
        attributes: {
          contactId: 'contact-1',
          street: address,
        },
      });
      expect(mutationSpy).toHaveGraphqlOperation('SetContactPrimaryAddress', {
        contactId: 'contact-1',
        primaryAddressId: 'address-1',
      });
    }, 20000);

    it('sets the contact status when creating new contacts', async () => {
      const { getByText, getAllByRole, findByRole } = render(
        <ThemeProvider theme={theme}>
          <SnackbarProvider>
            <TestRouter router={router}>
              <GqlMockedProvider<CreateContactMocks>
                onCall={mutationSpy}
                mocks={{
                  CreateContact: {
                    createContact: {
                      contact: {
                        id: 'contact-1',
                      },
                    },
                  },
                  CreateContactAddress: {
                    createAddress: {
                      address: {
                        id: 'address-1',
                      },
                    },
                  },
                }}
              >
                <CreateMultipleContacts
                  accountListId={accountListId}
                  handleClose={handleClose}
                  rows={3}
                />
              </GqlMockedProvider>
            </TestRouter>
          </SnackbarProvider>
        </ThemeProvider>,
      );

      userEvent.type(getAllByRole('textbox', { name: 'First' })[0], first);
      userEvent.type(getAllByRole('textbox', { name: 'Last' })[0], last);
      userEvent.type(getAllByRole('textbox', { name: 'Spouse' })[0], spouse);
      userEvent.type(getAllByRole('combobox')[0], address);
      userEvent.type(getAllByRole('textbox', { name: 'Phone' })[0], phone);
      userEvent.type(getAllByRole('textbox', { name: 'Email' })[0], email);

      userEvent.tab();
      userEvent.keyboard('{arrowdown}');
      userEvent.keyboard('{arrowdown}');

      userEvent.click(
        await findByRole('option', { name: 'Partner - Financial' }),
      );
      await waitFor(() => expect(getByText('Save')).not.toBeDisabled());
      userEvent.click(getByText('Save'));
      await waitFor(() => expect(handleClose).toHaveBeenCalled());

      expect(mutationSpy).toHaveGraphqlOperation('CreateContact', {
        accountListId,
        attributes: {
          name: `${last}, ${first} and ${spouse}`,
          contactReferralsToMe: undefined,
          status: 'PARTNER_FINANCIAL',
        },
      });
    }, 20000);
  });
});
