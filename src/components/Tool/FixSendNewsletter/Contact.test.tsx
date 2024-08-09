import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { SendNewsletterEnum } from 'src/graphql/types.generated';
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
      contactUpdates={[
        { id: '', sendNewsletter: null as unknown as SendNewsletterEnum },
      ]}
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
          email: '',
        },
        optoutEnewsletter: false,
      } as ContactPrimaryPersonFragment;

      primaryAddress = {
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

      expect(getByRole('combobox')).toHaveDisplayValue(['None']);
    });

    it('should be Physical', () => {
      primaryAddress.street = '100 Test St';

      const { getByRole } = render(
        <TestComponent
          primaryPerson={primaryPerson}
          primaryAddress={primaryAddress}
        />,
      );

      expect(getByRole('combobox')).toHaveDisplayValue(['Physical']);
    });

    it('should be Email', () => {
      primaryPerson.primaryEmailAddress = { email: 'a@b.com' };

      const { getByRole } = render(
        <TestComponent
          primaryPerson={primaryPerson}
          primaryAddress={primaryAddress}
        />,
      );

      expect(getByRole('combobox')).toHaveDisplayValue(['Email']);
    });

    it('should be None when opting out of emails', () => {
      primaryPerson.primaryEmailAddress = { email: 'a@b.com' };
      primaryPerson.optoutEnewsletter = true;

      const { getByRole } = render(
        <TestComponent
          primaryPerson={primaryPerson}
          primaryAddress={primaryAddress}
        />,
      );

      expect(getByRole('combobox')).toHaveDisplayValue(['None']);
    });

    it('should be Both', () => {
      primaryAddress.street = '100 Test St';
      primaryPerson.primaryEmailAddress = { email: 'a@b.com' };

      const { getByRole } = render(
        <TestComponent
          primaryPerson={primaryPerson}
          primaryAddress={primaryAddress}
        />,
      );

      expect(getByRole('combobox')).toHaveDisplayValue(['Both']);
    });

    it('should be Physical when opting out of emails', () => {
      primaryAddress.street = '100 Test St';
      primaryPerson.primaryEmailAddress = { email: 'a@b.com' };
      primaryPerson.optoutEnewsletter = true;

      const { getByRole } = render(
        <TestComponent
          primaryPerson={primaryPerson}
          primaryAddress={primaryAddress}
        />,
      );

      expect(getByRole('combobox')).toHaveDisplayValue(['Physical']);
    });
  });
});
