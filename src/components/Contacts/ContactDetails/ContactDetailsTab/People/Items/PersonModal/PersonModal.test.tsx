import React from 'react';
import { InMemoryCache } from '@apollo/client';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { cleanup, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { ContactDetailProvider } from 'src/components/Contacts/ContactDetails/ContactDetailContext';
import {
  GqlMockedProvider,
  gqlMock,
} from '../../../../../../../../__tests__/util/graphqlMocking';
import theme from '../../../../../../../theme';
import {
  ContactDetailsTabDocument,
  ContactDetailsTabQuery,
} from '../../../ContactDetailsTab.generated';
import {
  ContactPeopleFragment,
  ContactPeopleFragmentDoc,
} from '../../ContactPeople.generated';
import { PersonModal } from './PersonModal';
import { uploadAvatar, validateAvatar } from './uploadAvatar';

jest.mock('./uploadAvatar');

const handleClose = jest.fn();
const accountListId = '123';
const contactId = '321';
const mock = gqlMock<ContactPeopleFragment>(ContactPeopleFragmentDoc, {
  mocks: {
    people: {
      nodes: [
        {
          emailAddresses: {
            nodes: [
              {
                email: 'test1234@test.com',
                primary: true,
                historic: false,
                location: 'Work',
                source: 'MPDX',
              },
              {
                email: 'secondemail@test.com',
                location: 'Personal',
                primary: false,
                historic: false,
                source: 'MPDX',
              },
            ],
          },
          phoneNumbers: {
            nodes: [
              {
                number: '777-777-7777',
                location: 'Mobile',
                primary: true,
                historic: false,
                source: 'MPDX',
              },
              {
                number: '999-999-9999',
                location: 'Work',
                primary: false,
                historic: false,
                source: 'MPDX',
              },
            ],
          },
          facebookAccounts: {
            nodes: [
              {
                username: 'test guy',
              },
              {
                username: 'test guy 2',
              },
            ],
          },
          twitterAccounts: {
            nodes: [
              {
                screenName: '@testguy',
              },
              {
                screenName: '@testguy2',
              },
            ],
          },
          linkedinAccounts: {
            nodes: [
              {
                publicUrl: 'Test Guy',
              },
              {
                publicUrl: 'Test Guy 2',
              },
            ],
          },
          websites: {
            nodes: [
              {
                url: 'testguy.com',
              },
              {
                url: 'testguy2.com',
              },
            ],
          },
          optoutEnewsletter: false,
          anniversaryDay: 1,
          anniversaryMonth: 1,
          anniversaryYear: 1990,
          birthdayDay: 1,
          birthdayMonth: 1,
          birthdayYear: 1990,
          maritalStatus: 'Engaged',
          gender: 'Male',
          deceased: true,
        },
      ],
    },
  },
});

const mockPerson = mock.people.nodes[0];

const mockEnqueue = jest.fn();

jest.mock('notistack', () => ({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ...jest.requireActual('notistack'),
  useSnackbar: () => {
    return {
      enqueueSnackbar: mockEnqueue,
    };
  },
}));

describe('PersonModal', () => {
  beforeEach(() => {
    (uploadAvatar as jest.Mock).mockResolvedValue(undefined);
    (validateAvatar as jest.Mock).mockReturnValue({ success: true });
  });

  it('should render edit person modal', () => {
    const { getByText } = render(
      <SnackbarProvider>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider>
              <ContactDetailProvider>
                <PersonModal
                  contactId={contactId}
                  accountListId={accountListId}
                  handleClose={handleClose}
                  person={mockPerson}
                />
              </ContactDetailProvider>
            </GqlMockedProvider>
          </ThemeProvider>
        </LocalizationProvider>
      </SnackbarProvider>,
    );

    expect(getByText('Edit Person')).toBeInTheDocument();
  });

  it('should close edit contact modal', () => {
    const { getByLabelText, getByText } = render(
      <SnackbarProvider>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider>
              <ContactDetailProvider>
                <PersonModal
                  contactId={contactId}
                  accountListId={accountListId}
                  handleClose={handleClose}
                  person={mockPerson}
                />
              </ContactDetailProvider>
            </GqlMockedProvider>
          </ThemeProvider>
        </LocalizationProvider>
      </SnackbarProvider>,
    );
    expect(getByText('Edit Person')).toBeInTheDocument();
    userEvent.click(getByLabelText('Close'));
    expect(handleClose).toHaveBeenCalled();
  });

  it('should handle cancel click', () => {
    const { getByText } = render(
      <SnackbarProvider>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider>
              <ContactDetailProvider>
                <PersonModal
                  contactId={contactId}
                  accountListId={accountListId}
                  handleClose={handleClose}
                  person={mockPerson}
                />
              </ContactDetailProvider>
            </GqlMockedProvider>
          </ThemeProvider>
        </LocalizationProvider>
      </SnackbarProvider>,
    );
    expect(getByText('Edit Person')).toBeInTheDocument();
    userEvent.click(getByText('Cancel'));
    expect(handleClose).toHaveBeenCalled();
  });

  it('should handle save click', async () => {
    const mutationSpy = jest.fn();
    const { getByText } = render(
      <SnackbarProvider>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider onCall={mutationSpy}>
              <ContactDetailProvider>
                <PersonModal
                  contactId={contactId}
                  accountListId={accountListId}
                  handleClose={handleClose}
                  person={mockPerson}
                />
              </ContactDetailProvider>
            </GqlMockedProvider>
          </ThemeProvider>
        </LocalizationProvider>
      </SnackbarProvider>,
    );
    expect(getByText('Edit Person')).toBeInTheDocument();
    userEvent.click(getByText('Save'));
    await waitFor(() => expect(handleClose).toHaveBeenCalled());
    const { operation } = mutationSpy.mock.calls[0][0];
    expect(operation.variables.accountListId).toEqual(accountListId);
    expect(mockEnqueue).toHaveBeenCalledWith('Person updated successfully', {
      variant: 'success',
    });
  });

  it('should handle Show More click', async () => {
    const { queryAllByText, getByText } = render(
      <SnackbarProvider>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider>
              <ContactDetailProvider>
                <PersonModal
                  contactId={contactId}
                  accountListId={accountListId}
                  handleClose={handleClose}
                  person={mockPerson}
                />
              </ContactDetailProvider>
            </GqlMockedProvider>
          </ThemeProvider>
        </LocalizationProvider>
      </SnackbarProvider>,
    );
    expect(getByText('Edit Person')).toBeInTheDocument();
    userEvent.click(queryAllByText('Show More')[0]);
    await waitFor(() => expect(getByText('Show Less')).toBeInTheDocument());
  });

  it('should handle Show Less click', async () => {
    const { queryAllByText, getByText, queryByText } = render(
      <SnackbarProvider>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider>
              <ContactDetailProvider>
                <PersonModal
                  contactId={contactId}
                  accountListId={accountListId}
                  handleClose={handleClose}
                  person={mockPerson}
                />
              </ContactDetailProvider>
            </GqlMockedProvider>
          </ThemeProvider>
        </LocalizationProvider>
      </SnackbarProvider>,
    );
    expect(getByText('Edit Person')).toBeInTheDocument();
    userEvent.click(queryAllByText('Show More')[0]);
    await waitFor(() => expect(getByText('Show Less')).toBeInTheDocument());
    userEvent.click(queryAllByText('Show Less')[0]);
    await waitFor(() =>
      expect(queryByText('Show Less')).not.toBeInTheDocument(),
    );
  });
  describe('Updating', () => {
    const createObjectURL = jest
      .fn()
      .mockReturnValueOnce('blob:1')
      .mockReturnValueOnce('blob:2');
    const revokeObjectURL = jest.fn();
    beforeEach(() => {
      window.URL.createObjectURL = createObjectURL;
      window.URL.revokeObjectURL = revokeObjectURL;
    });

    it('should handle uploading an avatar', async () => {
      const { getByRole, getByTestId } = render(
        <SnackbarProvider>
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider>
                <ContactDetailProvider>
                  <PersonModal
                    contactId={contactId}
                    accountListId={accountListId}
                    handleClose={handleClose}
                    person={mockPerson}
                  />
                </ContactDetailProvider>
              </GqlMockedProvider>
            </ThemeProvider>
          </LocalizationProvider>
        </SnackbarProvider>,
      );

      const file1 = new File(['contents1'], 'image1.png', {
        type: 'image/png',
      });
      const file2 = new File(['contents2'], 'image2.png', {
        type: 'image/png',
      });
      const fileInput = getByTestId('PersonNameUpload');
      userEvent.upload(fileInput, file1);
      expect(revokeObjectURL).not.toHaveBeenCalledWith('blob:1');
      userEvent.upload(fileInput, file2);
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:1');

      userEvent.click(getByRole('button', { name: 'Save' }));

      await waitFor(() =>
        expect(uploadAvatar).toHaveBeenCalledWith(
          expect.objectContaining({
            personId: mockPerson.id,
            file: file2,
          }),
        ),
      );

      cleanup();
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:2');
    });

    it('should render avatar', async () => {
      mockPerson.avatar = 'https://cru.org/assets/image.jpg';
      mockPerson.firstName = 'James';
      mockPerson.lastName = 'Smith';
      mockPerson.avatar = 'https://cru.org/assets/image.jpg';
      render(
        <SnackbarProvider>
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider>
                <ContactDetailProvider>
                  <PersonModal
                    contactId={contactId}
                    accountListId={accountListId}
                    handleClose={handleClose}
                    person={mockPerson}
                  />
                </ContactDetailProvider>
              </GqlMockedProvider>
            </ThemeProvider>
          </LocalizationProvider>
        </SnackbarProvider>,
      );

      const avatarImage = document.querySelector('img') as HTMLImageElement;
      expect(avatarImage.src).toEqual('https://cru.org/assets/image.jpg');
      expect(avatarImage.alt).toEqual('James Smith');
    });

    it('should notify the user about validation errors', () => {
      (validateAvatar as jest.Mock).mockReturnValue({
        success: false,
        message: 'Invalid file',
      });

      const { getByTestId } = render(
        <SnackbarProvider>
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider>
                <ContactDetailProvider>
                  <PersonModal
                    contactId={contactId}
                    accountListId={accountListId}
                    handleClose={handleClose}
                    person={mockPerson}
                  />
                </ContactDetailProvider>
              </GqlMockedProvider>
            </ThemeProvider>
          </LocalizationProvider>
        </SnackbarProvider>,
      );

      const file = new File(['contents'], 'image.png', {
        type: 'image/png',
      });
      userEvent.upload(getByTestId('PersonNameUpload'), file);

      expect(mockEnqueue).toHaveBeenCalledWith('Invalid file', {
        variant: 'error',
      });
    });

    it('should notify the user about upload errors', async () => {
      (uploadAvatar as jest.Mock).mockRejectedValue(
        new Error('Upload failure'),
      );

      const { getByRole, getByTestId } = render(
        <SnackbarProvider>
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider>
                <ContactDetailProvider>
                  <PersonModal
                    contactId={contactId}
                    accountListId={accountListId}
                    handleClose={handleClose}
                    person={mockPerson}
                  />
                </ContactDetailProvider>
              </GqlMockedProvider>
            </ThemeProvider>
          </LocalizationProvider>
        </SnackbarProvider>,
      );

      const file = new File(['contents'], 'image.png', {
        type: 'image/png',
      });
      userEvent.upload(getByTestId('PersonNameUpload'), file);
      userEvent.click(getByRole('button', { name: 'Save' }));

      await waitFor(() =>
        expect(mockEnqueue).toHaveBeenCalledWith('Upload failure', {
          variant: 'error',
        }),
      );
    });

    it('should handle editing person name section', async () => {
      const mutationSpy = jest.fn();
      const newPersonFirstName = 'Test';
      const newPersonLastName = 'Guy';
      const newPersonTitle = 'Mr.';
      const newPersonSuffix = 'VI';

      const { getByText, getByLabelText } = render(
        <SnackbarProvider>
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider onCall={mutationSpy}>
                <ContactDetailProvider>
                  <PersonModal
                    contactId={contactId}
                    accountListId={accountListId}
                    handleClose={handleClose}
                    person={mockPerson}
                  />
                </ContactDetailProvider>
              </GqlMockedProvider>
            </ThemeProvider>
          </LocalizationProvider>
        </SnackbarProvider>,
      );
      expect(getByText('Edit Person')).toBeInTheDocument();

      userEvent.clear(getByLabelText('First Name'));
      userEvent.clear(getByLabelText('Last Name'));
      userEvent.clear(getByLabelText('Title'));
      userEvent.clear(getByLabelText('Suffix'));

      userEvent.type(getByLabelText('First Name'), newPersonFirstName);
      userEvent.type(getByLabelText('Last Name'), newPersonLastName);
      userEvent.type(getByLabelText('Title'), newPersonTitle);
      userEvent.type(getByLabelText('Suffix'), newPersonSuffix);

      userEvent.click(getByText('Save'));

      await waitFor(() =>
        expect(mockEnqueue).toHaveBeenCalledWith(
          'Person updated successfully',
          {
            variant: 'success',
          },
        ),
      );
      const { operation } = mutationSpy.mock.calls[0][0];
      expect(operation.variables.accountListId).toEqual(accountListId);
      expect(operation.variables.attributes.firstName).toEqual(
        newPersonFirstName,
      );
      expect(operation.variables.attributes.lastName).toEqual(
        newPersonLastName,
      );
      expect(operation.variables.attributes.title).toEqual(newPersonTitle);
      expect(operation.variables.attributes.suffix).toEqual(newPersonSuffix);
    });

    it('should handle editing person phone number section', async () => {
      const mutationSpy = jest.fn();
      const newPersonPhoneNumber = '888-888-8888';
      const { getByText, getAllByLabelText } = render(
        <SnackbarProvider>
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider onCall={mutationSpy}>
                <ContactDetailProvider>
                  <PersonModal
                    contactId={contactId}
                    accountListId={accountListId}
                    handleClose={handleClose}
                    person={mockPerson}
                  />
                </ContactDetailProvider>
              </GqlMockedProvider>
            </ThemeProvider>
          </LocalizationProvider>
        </SnackbarProvider>,
      );
      expect(getByText('Edit Person')).toBeInTheDocument();
      userEvent.clear(getAllByLabelText('Phone Number')[0]);
      userEvent.type(
        getAllByLabelText('Phone Number')[0],
        newPersonPhoneNumber,
      );
      userEvent.click(getAllByLabelText('Phone Number Type')[0]);
      userEvent.click(getAllByLabelText('Work')[0]);
      userEvent.click(getAllByLabelText('Primary')[1]);
      userEvent.click(getByText('Save'));

      await waitFor(() =>
        expect(mockEnqueue).toHaveBeenCalledWith(
          'Person updated successfully',
          {
            variant: 'success',
          },
        ),
      );
      const { operation } = mutationSpy.mock.calls[0][0];
      expect(operation.variables.accountListId).toEqual(accountListId);

      expect(operation.variables.attributes.phoneNumbers[0].number).toEqual(
        newPersonPhoneNumber,
      );
      expect(operation.variables.attributes.phoneNumbers[0].primary).toEqual(
        false,
      );
      expect(operation.variables.attributes.phoneNumbers[1].primary).toEqual(
        true,
      );
      expect(operation.variables.attributes.phoneNumbers[1].location).toEqual(
        'Work',
      );
    });

    it('should handle invalid phone numbers', async () => {
      const { findByText, getByRole, getAllByRole } = render(
        <SnackbarProvider>
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider>
                <ContactDetailProvider>
                  <PersonModal
                    contactId={contactId}
                    accountListId={accountListId}
                    handleClose={handleClose}
                    person={mockPerson}
                  />
                </ContactDetailProvider>
              </GqlMockedProvider>
            </ThemeProvider>
          </LocalizationProvider>
        </SnackbarProvider>,
      );

      const input = getAllByRole('textbox', { name: 'Phone Number' })[0];
      userEvent.clear(input);
      userEvent.type(input, 'abc');
      expect(input).toHaveValue('abc');
      expect(
        await findByText('This field is not a valid phone number'),
      ).toBeInTheDocument();
      expect(getByRole('button', { name: 'Save' })).toBeDisabled();
    });

    it('handles marking a phone number as invalid', async () => {
      const mutationSpy = jest.fn();
      const { getByRole, getAllByRole } = render(
        <SnackbarProvider>
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider onCall={mutationSpy}>
                <ContactDetailProvider>
                  <PersonModal
                    contactId={contactId}
                    accountListId={accountListId}
                    handleClose={handleClose}
                    person={mockPerson}
                  />
                </ContactDetailProvider>
              </GqlMockedProvider>
            </ThemeProvider>
          </LocalizationProvider>
        </SnackbarProvider>,
      );

      userEvent.click(getAllByRole('checkbox', { name: 'Invalid' })[0]);
      userEvent.click(getByRole('button', { name: 'Save' }));
      await waitFor(() => expect(mutationSpy).toHaveBeenCalled());

      const { phoneNumbers } =
        mutationSpy.mock.calls[0][0].operation.variables.attributes;
      expect(phoneNumbers[0].historic).toBe(true);
      expect(phoneNumbers[1].historic).toBe(false);
    });

    it('handles deleting a saved null phone number', async () => {
      const personMocks = {
        firstName: 'Test',
        lastName: 'lastName',
        primaryPhoneNumber: { number: null },
        emailAddresses: { nodes: [] },
        phoneNumbers: {
          nodes: [
            {
              id: 'ID123',
              number: null,
              location: 'Mobile',
              primary: false,
              historic: false,
              source: 'MPDX',
            },
          ],
        },
        facebookAccounts: { nodes: [] },
        twitterAccounts: { nodes: [] },
        linkedinAccounts: { nodes: [] },
        websites: { nodes: [] },
      };
      const mock = gqlMock<ContactPeopleFragment>(ContactPeopleFragmentDoc, {
        mocks: {
          people: {
            nodes: [personMocks],
          },
        },
      });
      const mockPerson = mock.people.nodes[0];
      const mutationSpy = jest.fn();
      const { getByText, getByRole, getAllByLabelText } = render(
        <SnackbarProvider>
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider onCall={mutationSpy}>
                <ContactDetailProvider>
                  <PersonModal
                    contactId={contactId}
                    accountListId={accountListId}
                    handleClose={handleClose}
                    person={mockPerson}
                  />
                </ContactDetailProvider>
              </GqlMockedProvider>
            </ThemeProvider>
          </LocalizationProvider>
        </SnackbarProvider>,
      );

      await waitFor(() =>
        expect(
          getByText('Please enter a valid phone number'),
        ).toBeInTheDocument(),
      );

      expect(getByRole('button', { name: 'Save' })).toBeDisabled();
      userEvent.click(getAllByLabelText('Modal Section Delete Icon')[1]);
      await waitFor(() =>
        expect(getByRole('button', { name: 'Save' })).not.toBeDisabled(),
      );
      userEvent.click(getByText('Save'));
      await waitFor(() =>
        expect(mockEnqueue).toHaveBeenCalledWith(
          'Person updated successfully',
          {
            variant: 'success',
          },
        ),
      );
      const { operation } = mutationSpy.mock.calls[0][0];
      expect(operation.variables.accountListId).toEqual(accountListId);
      expect(operation.variables.attributes.phoneNumbers[0].destroy).toEqual(
        true,
      );
      expect(operation.variables.attributes.phoneNumbers[0].number).toEqual(
        null,
      );
    });

    it('handles deleting a phone number', async () => {
      const mutationSpy = jest.fn();
      const { getByText, getAllByLabelText } = render(
        <SnackbarProvider>
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider onCall={mutationSpy}>
                <ContactDetailProvider>
                  <PersonModal
                    contactId={contactId}
                    accountListId={accountListId}
                    handleClose={handleClose}
                    person={mockPerson}
                  />
                </ContactDetailProvider>
              </GqlMockedProvider>
            </ThemeProvider>
          </LocalizationProvider>
        </SnackbarProvider>,
      );
      expect(getByText('Edit Person')).toBeInTheDocument();
      userEvent.click(getAllByLabelText('Modal Section Delete Icon')[2]);
      userEvent.click(getByText('Save'));
      await waitFor(() =>
        expect(mockEnqueue).toHaveBeenCalledWith(
          'Person updated successfully',
          {
            variant: 'success',
          },
        ),
      );
      const { operation } = mutationSpy.mock.calls[0][0];
      expect(operation.variables.accountListId).toEqual(accountListId);

      expect(operation.variables.attributes.phoneNumbers[1].destroy).toEqual(
        true,
      );
    });

    it('handles deleting a new phone number', async () => {
      const mutationSpy = jest.fn();
      const { getByText, getAllByLabelText, getByLabelText } = render(
        <SnackbarProvider>
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider onCall={mutationSpy}>
                <ContactDetailProvider>
                  <PersonModal
                    contactId={contactId}
                    accountListId={accountListId}
                    handleClose={handleClose}
                    person={mockPerson}
                  />
                </ContactDetailProvider>
              </GqlMockedProvider>
            </ThemeProvider>
          </LocalizationProvider>
        </SnackbarProvider>,
      );
      expect(getByText('Edit Person')).toBeInTheDocument();
      expect(getAllByLabelText('Modal Section Delete Icon')).toHaveLength(5);
      userEvent.click(getByLabelText('Add Phone Number'));
      expect(getAllByLabelText('Modal Section Delete Icon')).toHaveLength(6);
      userEvent.click(getAllByLabelText('Modal Section Delete Icon')[3]);
      expect(getAllByLabelText('Modal Section Delete Icon')).toHaveLength(5);
    });

    it('should handle editing person email section', async () => {
      const mutationSpy = jest.fn();
      const newPersonEmailAddress = 'testguy@fake.com';
      const { getByText, getByLabelText, getAllByLabelText } = render(
        <SnackbarProvider>
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider onCall={mutationSpy}>
                <ContactDetailProvider>
                  <PersonModal
                    contactId={contactId}
                    accountListId={accountListId}
                    handleClose={handleClose}
                    person={mockPerson}
                  />
                </ContactDetailProvider>
              </GqlMockedProvider>
            </ThemeProvider>
          </LocalizationProvider>
        </SnackbarProvider>,
      );
      userEvent.clear(getAllByLabelText('Email Address')[0]);
      expect(getByText('Edit Person')).toBeInTheDocument();

      userEvent.type(
        getAllByLabelText('Email Address')[0],
        newPersonEmailAddress,
      );
      userEvent.click(getAllByLabelText('Email Address Type')[0]);
      userEvent.click(getAllByLabelText('Personal')[0]);
      userEvent.click(getAllByLabelText('Primary')[1]);
      userEvent.click(getByLabelText('Opt-out of Email Newsletter'));

      userEvent.click(getByText('Save'));

      await waitFor(() =>
        expect(mockEnqueue).toHaveBeenCalledWith(
          'Person updated successfully',
          {
            variant: 'success',
          },
        ),
      );

      const { operation } = mutationSpy.mock.calls[0][0];
      expect(operation.variables.accountListId).toEqual(accountListId);
      expect(operation.variables.attributes.emailAddresses[0].email).toEqual(
        newPersonEmailAddress,
      );
      expect(operation.variables.attributes.emailAddresses[1].location).toEqual(
        'Personal',
      );
      expect(operation.variables.attributes.emailAddresses[0].primary).toEqual(
        true,
      );
      expect(operation.variables.attributes.emailAddresses[1].primary).toEqual(
        false,
      );
      expect(operation.variables.attributes.optoutEnewsletter).toEqual(true);
    });

    it('handles marking an email address as invalid', async () => {
      const mutationSpy = jest.fn();
      const { getByRole, getAllByRole } = render(
        <SnackbarProvider>
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider onCall={mutationSpy}>
                <ContactDetailProvider>
                  <PersonModal
                    contactId={contactId}
                    accountListId={accountListId}
                    handleClose={handleClose}
                    person={mockPerson}
                  />
                </ContactDetailProvider>
              </GqlMockedProvider>
            </ThemeProvider>
          </LocalizationProvider>
        </SnackbarProvider>,
      );

      userEvent.click(getAllByRole('checkbox', { name: 'Invalid' })[2]);
      userEvent.click(getByRole('button', { name: 'Save' }));
      await waitFor(() => expect(mutationSpy).toHaveBeenCalled());

      const { emailAddresses } =
        mutationSpy.mock.calls[0][0].operation.variables.attributes;
      expect(emailAddresses[0].historic).toBe(true);
      expect(emailAddresses[1].historic).toBe(false);
    });

    it('handles deleting an email address', async () => {
      const mutationSpy = jest.fn();
      const { getByText, getAllByLabelText } = render(
        <SnackbarProvider>
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider onCall={mutationSpy}>
                <ContactDetailProvider>
                  <PersonModal
                    contactId={contactId}
                    accountListId={accountListId}
                    handleClose={handleClose}
                    person={mockPerson}
                  />
                </ContactDetailProvider>
              </GqlMockedProvider>
            </ThemeProvider>
          </LocalizationProvider>
        </SnackbarProvider>,
      );
      expect(getByText('Edit Person')).toBeInTheDocument();
      userEvent.click(getAllByLabelText('Modal Section Delete Icon')[4]);
      userEvent.click(getByText('Save'));
      await waitFor(() =>
        expect(mockEnqueue).toHaveBeenCalledWith(
          'Person updated successfully',
          {
            variant: 'success',
          },
        ),
      );
      const { operation } = mutationSpy.mock.calls[0][0];
      expect(operation.variables.accountListId).toEqual(accountListId);

      expect(operation.variables.attributes.emailAddresses[1].destroy).toEqual(
        true,
      );
    });

    it('handles deleting a new email address', async () => {
      const mutationSpy = jest.fn();
      const { getByText, getAllByLabelText, getByLabelText } = render(
        <SnackbarProvider>
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider onCall={mutationSpy}>
                <ContactDetailProvider>
                  <PersonModal
                    contactId={contactId}
                    accountListId={accountListId}
                    handleClose={handleClose}
                    person={mockPerson}
                  />
                </ContactDetailProvider>
              </GqlMockedProvider>
            </ThemeProvider>
          </LocalizationProvider>
        </SnackbarProvider>,
      );
      expect(getByText('Edit Person')).toBeInTheDocument();
      expect(getAllByLabelText('Modal Section Delete Icon')).toHaveLength(5);
      userEvent.click(getByLabelText('Add Email Address'));
      expect(getAllByLabelText('Modal Section Delete Icon')).toHaveLength(6);
      userEvent.click(getAllByLabelText('Modal Section Delete Icon')[5]);
      expect(getAllByLabelText('Modal Section Delete Icon')).toHaveLength(5);
    });

    it('should handle editing show more section', async () => {
      const mutationSpy = jest.fn();
      const newPersonAlmaMater = 'Some Cool School';
      const newPersonEmployer = 'Cru';
      const newPersonOccupation = 'Dev';
      const newPersonLegalFirstName = 'Jim';
      const { getByText, getByLabelText } = render(
        <SnackbarProvider>
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider onCall={mutationSpy}>
                <ContactDetailProvider>
                  <PersonModal
                    contactId={contactId}
                    accountListId={accountListId}
                    handleClose={handleClose}
                    person={mockPerson}
                  />
                </ContactDetailProvider>
              </GqlMockedProvider>
            </ThemeProvider>
          </LocalizationProvider>
        </SnackbarProvider>,
      );
      expect(getByText('Edit Person')).toBeInTheDocument();
      userEvent.click(getByText('Show More'));

      userEvent.clear(getByLabelText('Alma Mater'));
      userEvent.clear(getByLabelText('Employer'));
      userEvent.clear(getByLabelText('Occupation'));
      userEvent.clear(getByLabelText('Legal First Name'));

      userEvent.click(getByLabelText('Relationship Status'));
      userEvent.click(getByLabelText('Married'));
      userEvent.click(getByLabelText('Gender'));
      userEvent.click(getByLabelText('Female'));
      userEvent.type(getByLabelText('Alma Mater'), newPersonAlmaMater);
      userEvent.type(getByLabelText('Employer'), newPersonEmployer);
      userEvent.type(getByLabelText('Occupation'), newPersonOccupation);
      userEvent.type(
        getByLabelText('Legal First Name'),
        newPersonLegalFirstName,
      );
      userEvent.click(getByLabelText('Deceased'));
      userEvent.click(getByText('Show Less'));
      userEvent.click(getByText('Save'));

      await waitFor(() =>
        expect(mockEnqueue).toHaveBeenCalledWith(
          'Person updated successfully',
          {
            variant: 'success',
          },
        ),
      );
      const { operation } = mutationSpy.mock.calls[0][0];
      expect(operation.variables.accountListId).toEqual(accountListId);
      expect(operation.variables.attributes.maritalStatus).toEqual('Married');
      expect(operation.variables.attributes.gender).toEqual('Female');
      expect(operation.variables.attributes.almaMater).toEqual(
        newPersonAlmaMater,
      );
      expect(operation.variables.attributes.employer).toEqual(
        newPersonEmployer,
      );
      expect(operation.variables.attributes.occupation).toEqual(
        newPersonOccupation,
      );
      expect(operation.variables.attributes.legalFirstName).toEqual(
        newPersonLegalFirstName,
      );
      expect(operation.variables.attributes.deceased).toEqual(false);
    });

    it('should handle editing anniversary', async () => {
      const mutationSpy = jest.fn();
      const { getByText, getByLabelText } = render(
        <SnackbarProvider>
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider onCall={mutationSpy}>
                <ContactDetailProvider>
                  <PersonModal
                    contactId={contactId}
                    accountListId={accountListId}
                    handleClose={handleClose}
                    person={mockPerson}
                  />
                </ContactDetailProvider>
              </GqlMockedProvider>
            </ThemeProvider>
          </LocalizationProvider>
        </SnackbarProvider>,
      );
      expect(getByText('Edit Person')).toBeInTheDocument();
      userEvent.click(getByText('Show More'));
      userEvent.click(getByLabelText('Anniversary'));
      userEvent.click(getByText('30'));
      const AnniversaryOkayButton = await waitFor(() => getByText('OK'));
      userEvent.click(AnniversaryOkayButton);
      userEvent.click(getByText('Show Less'));
      userEvent.click(getByText('Save'));
      await waitFor(() =>
        expect(mockEnqueue).toHaveBeenCalledWith(
          'Person updated successfully',
          {
            variant: 'success',
          },
        ),
      );
      const { operation } = mutationSpy.mock.calls[0][0];
      expect(operation.variables.accountListId).toEqual(accountListId);
      expect(operation.variables.attributes.anniversaryDay).toEqual(30);
    });

    it('should handle editing birthday', async () => {
      const mutationSpy = jest.fn();
      const { getByText, getByLabelText } = render(
        <SnackbarProvider>
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider onCall={mutationSpy}>
                <ContactDetailProvider>
                  <PersonModal
                    contactId={contactId}
                    accountListId={accountListId}
                    handleClose={handleClose}
                    person={mockPerson}
                  />
                </ContactDetailProvider>
              </GqlMockedProvider>
            </ThemeProvider>
          </LocalizationProvider>
        </SnackbarProvider>,
      );
      expect(getByText('Edit Person')).toBeInTheDocument();
      userEvent.click(getByText('Show More'));
      userEvent.click(getByLabelText('Birthday'));
      userEvent.click(getByText('30'));
      const birthdayOkayButton = await waitFor(() => getByText('OK'));
      userEvent.click(birthdayOkayButton);

      userEvent.click(getByText('Save'));
      await waitFor(() =>
        expect(mockEnqueue).toHaveBeenCalledWith(
          'Person updated successfully',
          {
            variant: 'success',
          },
        ),
      );
      const { operation } = mutationSpy.mock.calls[0][0];
      expect(operation.variables.accountListId).toEqual(accountListId);
      expect(operation.variables.attributes.birthdayDay).toEqual(30);
    });

    it('should handle editing socials section', async () => {
      const mutationSpy = jest.fn();
      const newPersonFacebookAccount = 'Test Guy';
      const newPersonTwitterAccount = '@testguy';
      const newPersonLinkedInAccount = 'Professional Test Guy';
      const newPersonWebsite = 'testguy.com';
      const { getByText, getAllByLabelText } = render(
        <SnackbarProvider>
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider onCall={mutationSpy}>
                <ContactDetailProvider>
                  <PersonModal
                    contactId={contactId}
                    accountListId={accountListId}
                    handleClose={handleClose}
                    person={mockPerson}
                  />
                </ContactDetailProvider>
              </GqlMockedProvider>
            </ThemeProvider>
          </LocalizationProvider>
        </SnackbarProvider>,
      );
      expect(getByText('Edit Person')).toBeInTheDocument();
      userEvent.click(getByText('Show More'));

      userEvent.clear(getAllByLabelText('Facebook Account')[0]);
      userEvent.clear(getAllByLabelText('Twitter Account')[0]);
      userEvent.clear(getAllByLabelText('LinkedIn Account')[0]);
      userEvent.clear(getAllByLabelText('Website')[0]);

      userEvent.type(
        getAllByLabelText('Facebook Account')[0],
        newPersonFacebookAccount,
      );
      userEvent.type(
        getAllByLabelText('Twitter Account')[0],
        newPersonTwitterAccount,
      );
      userEvent.type(
        getAllByLabelText('LinkedIn Account')[0],
        newPersonLinkedInAccount,
      );
      userEvent.type(getAllByLabelText('Website')[0], newPersonWebsite);
      userEvent.click(getByText('Show Less'));
      userEvent.click(getByText('Save'));
      await waitFor(() =>
        expect(mockEnqueue).toHaveBeenCalledWith(
          'Person updated successfully',
          {
            variant: 'success',
          },
        ),
      );
      const { operation } = mutationSpy.mock.calls[0][0];
      expect(operation.variables.accountListId).toEqual(accountListId);
      expect(
        operation.variables.attributes.facebookAccounts[0].username,
      ).toEqual(newPersonFacebookAccount);
      expect(
        operation.variables.attributes.twitterAccounts[0].screenName,
      ).toEqual(newPersonTwitterAccount);
      expect(
        operation.variables.attributes.linkedinAccounts[0].publicUrl,
      ).toEqual(newPersonLinkedInAccount);
      expect(operation.variables.attributes.websites[0].url).toEqual(
        newPersonWebsite,
      );
    });

    it('should handle deleting socials', async () => {
      const mutationSpy = jest.fn();
      const { getByText, getAllByLabelText } = render(
        <SnackbarProvider>
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider onCall={mutationSpy}>
                <ContactDetailProvider>
                  <PersonModal
                    contactId={contactId}
                    accountListId={accountListId}
                    handleClose={handleClose}
                    person={mockPerson}
                  />
                </ContactDetailProvider>
              </GqlMockedProvider>
            </ThemeProvider>
          </LocalizationProvider>
        </SnackbarProvider>,
      );
      expect(getByText('Edit Person')).toBeInTheDocument();
      userEvent.click(getByText('Show More'));
      userEvent.click(getAllByLabelText('Modal Section Delete Icon')[6]);
      userEvent.click(getAllByLabelText('Modal Section Delete Icon')[8]);
      userEvent.click(getAllByLabelText('Modal Section Delete Icon')[10]);
      userEvent.click(getAllByLabelText('Modal Section Delete Icon')[12]);

      userEvent.click(getByText('Save'));
      await waitFor(() =>
        expect(mockEnqueue).toHaveBeenCalledWith(
          'Person updated successfully',
          {
            variant: 'success',
          },
        ),
      );
      const { operation } = mutationSpy.mock.calls[0][0];
      expect(operation.variables.accountListId).toEqual(accountListId);
      expect(
        operation.variables.attributes.facebookAccounts[1].destroy,
      ).toEqual(true);
      expect(operation.variables.attributes.twitterAccounts[1].destroy).toEqual(
        true,
      );
      expect(
        operation.variables.attributes.linkedinAccounts[1].destroy,
      ).toEqual(true);
      expect(operation.variables.attributes.websites[1].destroy).toEqual(true);
    });

    it('handles deleting a new social', async () => {
      const mutationSpy = jest.fn();
      const { getByText, getAllByLabelText, getByLabelText } = render(
        <SnackbarProvider>
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider onCall={mutationSpy}>
                <ContactDetailProvider>
                  <PersonModal
                    contactId={contactId}
                    accountListId={accountListId}
                    handleClose={handleClose}
                    person={mockPerson}
                  />
                </ContactDetailProvider>
              </GqlMockedProvider>
            </ThemeProvider>
          </LocalizationProvider>
        </SnackbarProvider>,
      );
      expect(getByText('Edit Person')).toBeInTheDocument();
      userEvent.click(getByText('Show More'));
      expect(getAllByLabelText('Modal Section Delete Icon')).toHaveLength(13);
      userEvent.click(getByLabelText('Add Social'));
      expect(getAllByLabelText('Modal Section Delete Icon')).toHaveLength(14);
      userEvent.click(getAllByLabelText('Modal Section Delete Icon')[13]);
      expect(getAllByLabelText('Modal Section Delete Icon')).toHaveLength(13);
    });

    it('should handle deleting a person', async () => {
      const { getByRole, getByText } = render(
        <SnackbarProvider>
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider>
                <ContactDetailProvider>
                  <PersonModal
                    contactId={contactId}
                    accountListId={accountListId}
                    handleClose={handleClose}
                    person={mockPerson}
                  />
                </ContactDetailProvider>
              </GqlMockedProvider>
            </ThemeProvider>
          </LocalizationProvider>
        </SnackbarProvider>,
      );
      userEvent.click(getByRole('button', { hidden: true, name: 'Delete' }));
      expect(getByText('Confirm')).toBeInTheDocument();

      userEvent.click(getByRole('button', { hidden: true, name: 'Yes' }));
      await waitFor(() =>
        expect(mockEnqueue).toHaveBeenCalledWith(
          'Person deleted successfully',
          {
            variant: 'success',
          },
        ),
      );
    });
  });

  describe('Creating', () => {
    it('should handle creating a new person', async () => {
      const cache = new InMemoryCache();
      jest.spyOn(cache, 'writeQuery');
      const mutationSpy = jest.fn();
      const newPersonFirstName = 'Test';
      const newPersonLastName = 'Guy';
      const newPersonTitle = 'Mr.';
      const newPersonSuffix = 'VI';

      const mocks = {
        ContactDetailsTab: {
          contact: {
            id: contactId,
            name: 'Person, Test',
            addresses: {
              nodes: [
                {
                  id: 'addres-1',
                  street: '123 Sesame Street',
                  city: 'New York',
                  state: 'NY',
                  postalCode: '10001',
                  country: 'USA',
                  primaryMailingAddress: true,
                  historic: false,
                  region: 'some region',
                  source: 'some source',
                },
              ],
            },
            tagList: ['tag1', 'tag2', 'tag3'],
            people: {
              nodes: [
                {
                  ...mockPerson,
                },
              ],
            },
          },
        },
        CreatePerson: {
          createPerson: {
            person: {
              id: '456',
              firstName: newPersonFirstName,
              lastName: newPersonLastName,
              title: newPersonTitle,
              suffix: newPersonSuffix,
              phoneNumbers: [],
              emailAddresses: [],
              optoutEnewsletter: false,
              birthdayDay: null,
              birthdayMonth: null,
              birthdayYear: null,
              maritalStatus: null,
              gender: 'Male',
              anniversaryDay: null,
              anniversaryMonth: null,
              anniversaryYear: null,
              almaMater: null,
              employer: null,
              occupation: null,
              facebookAccounts: [],
              twitterAccounts: [],
              linkedinAccounts: [],
              websites: [],
              legalFirstName: null,
              deceased: false,
            },
          },
        },
      };

      const data: ContactDetailsTabQuery = {
        contact: {
          id: contactId,
          name: 'Person, Test',
          tagList: ['tag1', 'tag2', 'tag3'],
          contactDonorAccounts: {
            nodes: [],
          },
          contactReferralsToMe: {
            nodes: [
              {
                id: '112233',
                referredBy: {
                  id: '221133',
                  name: 'Referred By',
                },
              },
            ],
          },
          addresses: {
            nodes: [
              {
                id: 'addres-1',
                street: '123 Sesame Street',
                city: 'New York',
                state: 'NY',
                postalCode: '10001',
                country: 'USA',
                primaryMailingAddress: true,
                historic: false,
                region: 'some region',
                source: 'some source',
                createdAt: '2023-01-01T00:00:00.000Z',
              },
            ],
          },
          people: {
            nodes: [
              {
                ...mockPerson,
              },
            ],
          },
        },
      };

      cache.writeQuery({
        query: ContactDetailsTabDocument,
        variables: {
          accountListId,
          contactId,
        },
        data,
      });

      const { getByText, getByLabelText } = render(
        <SnackbarProvider>
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider<{ ContactDetailsTab: ContactDetailsTabQuery }>
                mocks={mocks}
                cache={cache}
                onCall={mutationSpy}
              >
                <ContactDetailProvider>
                  <PersonModal
                    contactId={contactId}
                    accountListId={accountListId}
                    handleClose={handleClose}
                    person={undefined}
                  />
                </ContactDetailProvider>
              </GqlMockedProvider>
            </ThemeProvider>
          </LocalizationProvider>
        </SnackbarProvider>,
      );

      expect(getByText('Create Person')).toBeInTheDocument();

      userEvent.type(getByLabelText('First Name'), newPersonFirstName);
      userEvent.type(getByLabelText('Last Name'), newPersonLastName);
      userEvent.type(getByLabelText('Title'), newPersonTitle);
      userEvent.type(getByLabelText('Suffix'), newPersonSuffix);

      userEvent.click(getByText('Save'));

      await waitFor(() =>
        expect(mockEnqueue).toHaveBeenCalledWith(
          'Person created successfully',
          {
            variant: 'success',
          },
        ),
      );

      const { operation } = mutationSpy.mock.calls[0][0];
      expect(operation.variables.accountListId).toEqual(accountListId);
      expect(operation.variables.attributes.contactId).toEqual(contactId);
      expect(operation.variables.attributes.firstName).toEqual(
        newPersonFirstName,
      );
      expect(operation.variables.attributes.lastName).toEqual(
        newPersonLastName,
      );
      expect(operation.variables.attributes.title).toEqual(newPersonTitle);
      expect(operation.variables.attributes.suffix).toEqual(newPersonSuffix);
    });
  });
});
