import { ThemeProvider } from '@mui/material/styles';
import { render, within } from '@testing-library/react';
import theme from 'src/theme';
import Contact from './Contact';
import {
  ContactPrimaryAddressFragment,
  ContactPrimaryPersonFragment,
} from './InvalidNewsletter.generated';

const TestComponent = ({
  primaryPerson,
  primaryAddress,
}: {
  primaryPerson: ContactPrimaryPersonFragment;
  primaryAddress: ContactPrimaryAddressFragment;
}) => (
  <ThemeProvider theme={theme}>
    <Contact
      id=""
      name=""
      primaryPerson={primaryPerson}
      status=""
      primaryAddress={primaryAddress}
      handleSingleConfirm={jest.fn()}
      setContactFocus={jest.fn()}
    />
  </ThemeProvider>
);

describe('Fix Newsletter - Contact', () => {
  describe('inital value for dropdown', () => {
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

    it('should be Physical', () => {
      primaryAddress.street = '100 Test St';

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

    it('should be Email', () => {
      primaryPerson.primaryEmailAddress = { id: '1', email: 'a@b.com' };

      const { getByRole } = render(
        <TestComponent
          primaryPerson={primaryPerson}
          primaryAddress={primaryAddress}
        />,
      );

      expect(
        within(getByRole('combobox')).getByText('Email'),
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
});
