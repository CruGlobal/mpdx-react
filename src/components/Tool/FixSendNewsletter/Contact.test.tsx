import { ThemeProvider } from '@mui/material/styles';
import { render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { SendNewsletterEnum } from 'src/graphql/types.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import theme from 'src/theme';
import Contact from './Contact';
import {
  ContactPrimaryAddressFragment,
  ContactPrimaryPersonFragment,
  InvalidNewsletterContactFragment,
} from './InvalidNewsletter.generated';

jest.mock('src/hooks/useAccountListId');
const accountListId = 'accountListId';
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
    <TestRouter>
      <ThemeProvider theme={theme}>
        <Contact
          contact={contact}
          contactUpdates={[
            { id: '', sendNewsletter: null as unknown as SendNewsletterEnum },
          ]}
          setContactUpdates={jest.fn()}
          handleSingleConfirm={jest.fn()}
        />
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
    (useAccountListId as jest.Mock).mockReturnValue(accountListId);

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
});
