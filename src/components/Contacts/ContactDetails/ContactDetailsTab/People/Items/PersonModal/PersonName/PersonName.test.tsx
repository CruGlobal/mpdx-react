import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Formik } from 'formik';
import { gqlMock } from '__tests__/util/graphqlMocking';
import {
  PersonCreateInput,
  PersonUpdateInput,
} from 'src/graphql/types.generated';
import { useIsOnline } from 'src/hooks/useIsOnline';
import { useNativeCamera } from 'src/hooks/useNativeCamera';
import theme from '../../../../../../../../theme';
import {
  ContactPeopleFragment,
  ContactPeopleFragmentDoc,
} from '../../../ContactPeople.generated';
import { NewSocial } from '../PersonModal';
import { PersonName } from './PersonName';

jest.mock('src/hooks/useNativeCamera');
jest.mock('src/hooks/useIsOnline');

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

const mockedUseNativeCamera = useNativeCamera as jest.MockedFunction<
  typeof useNativeCamera
>;
const mockedUseIsOnline = useIsOnline as jest.MockedFunction<
  typeof useIsOnline
>;
const getAvatarPhoto = jest.fn();
const setAvatar = jest.fn();

const mock = gqlMock<ContactPeopleFragment>(ContactPeopleFragmentDoc, {
  mocks: {
    people: {
      nodes: [
        {
          firstName: 'John',
          lastName: 'Doe',
          avatar: '',
        },
      ],
    },
  },
});
const mockPerson = mock.people.nodes[0];

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <Formik<(PersonUpdateInput | PersonCreateInput) & NewSocial>
      initialValues={{
        contactId: 'contact-1',
        firstName: 'John',
        lastName: 'Doe',
        title: '',
        suffix: '',
        newSocials: [],
      }}
      onSubmit={jest.fn()}
    >
      {(formikProps) => (
        <PersonName
          person={mockPerson}
          formikProps={formikProps}
          setAvatar={setAvatar}
        />
      )}
    </Formik>
  </ThemeProvider>
);

describe('PersonName', () => {
  beforeEach(() => {
    mockedUseIsOnline.mockReturnValue(true);
    mockedUseNativeCamera.mockReturnValue({
      isNative: false,
      getAvatarPhoto,
    });
  });

  describe('on the web (browser)', () => {
    it('clicks the hidden file input and renders no menu when the avatar button is clicked', () => {
      const { getByRole, getByTestId, queryByRole } = render(<TestComponent />);

      const fileInput = getByTestId('PersonNameUpload');
      const clickSpy = jest.spyOn(fileInput, 'click');

      userEvent.click(getByRole('button', { name: 'Change photo' }));

      expect(clickSpy).toHaveBeenCalledTimes(1);
      expect(queryByRole('menu')).not.toBeInTheDocument();
      expect(getAvatarPhoto).not.toHaveBeenCalled();
      // No menu on the web, so the trigger must not advertise one
      expect(getByRole('button', { name: 'Change photo' })).not.toHaveAttribute(
        'aria-haspopup',
      );
    });

    it('passes the selected file to setAvatar and resets the input', () => {
      const { getByTestId } = render(<TestComponent />);

      const fileInput = getByTestId('PersonNameUpload') as HTMLInputElement;
      const file = new File(['contents'], 'image.png', { type: 'image/png' });
      userEvent.upload(fileInput, file);

      expect(setAvatar).toHaveBeenCalledTimes(1);
      expect(setAvatar).toHaveBeenCalledWith(file);
      // Resetting the value is essential for the file size validation alert
      // on repeated uploads
      expect(fileInput.value).toBe('');
    });

    it('still opens the file input while offline (no native gating on the web)', () => {
      mockedUseIsOnline.mockReturnValue(false);
      const { getByRole, getByTestId, queryByRole } = render(<TestComponent />);

      const fileInput = getByTestId('PersonNameUpload');
      const clickSpy = jest.spyOn(fileInput, 'click');

      userEvent.click(getByRole('button', { name: 'Change photo' }));

      expect(clickSpy).toHaveBeenCalledTimes(1);
      expect(queryByRole('menu')).not.toBeInTheDocument();
      expect(mockEnqueue).not.toHaveBeenCalled();
    });
  });

  describe('in the native shell', () => {
    beforeEach(() => {
      mockedUseNativeCamera.mockReturnValue({
        isNative: true,
        getAvatarPhoto,
      });
    });

    it('shows the photo source menu instead of clicking the file input', async () => {
      const { findByRole, getByRole, getByTestId } = render(<TestComponent />);

      const fileInput = getByTestId('PersonNameUpload');
      const clickSpy = jest.spyOn(fileInput, 'click');

      userEvent.click(getByRole('button', { name: 'Change photo' }));

      expect(
        await findByRole('menuitem', { name: 'Take Photo' }),
      ).toBeInTheDocument();
      expect(
        getByRole('menuitem', { name: 'Choose from Library' }),
      ).toBeInTheDocument();
      expect(clickSpy).not.toHaveBeenCalled();
    });

    it('wires menu ARIA attributes onto the avatar trigger', async () => {
      const { findByRole, getByRole } = render(<TestComponent />);

      const trigger = getByRole('button', { name: 'Change photo' });
      expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(trigger).not.toHaveAttribute('aria-controls');

      userEvent.click(trigger);

      const menu = await findByRole('menu');
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      expect(trigger).toHaveAttribute('aria-controls', menu.id);
      expect(menu).toHaveAttribute('aria-labelledby', trigger.id);
    });

    it('takes a photo and passes the file to setAvatar', async () => {
      const file = new File(['camera-bytes'], 'avatar.jpeg', {
        type: 'image/jpeg',
      });
      getAvatarPhoto.mockResolvedValue({ outcome: 'success', file });
      const { findByRole, getByRole, queryByRole } = render(<TestComponent />);

      userEvent.click(getByRole('button', { name: 'Change photo' }));
      userEvent.click(await findByRole('menuitem', { name: 'Take Photo' }));

      await waitFor(() => expect(setAvatar).toHaveBeenCalledWith(file));
      expect(getAvatarPhoto).toHaveBeenCalledWith('camera');
      await waitFor(() => expect(queryByRole('menu')).not.toBeInTheDocument());
    });

    it('chooses a photo from the library and passes the file to setAvatar', async () => {
      const file = new File(['library-bytes'], 'avatar.jpeg', {
        type: 'image/jpeg',
      });
      getAvatarPhoto.mockResolvedValue({ outcome: 'success', file });
      const { findByRole, getByRole } = render(<TestComponent />);

      userEvent.click(getByRole('button', { name: 'Change photo' }));
      userEvent.click(
        await findByRole('menuitem', { name: 'Choose from Library' }),
      );

      await waitFor(() => expect(setAvatar).toHaveBeenCalledWith(file));
      expect(getAvatarPhoto).toHaveBeenCalledWith('photos');
    });

    it('shows an error when camera permission is denied', async () => {
      getAvatarPhoto.mockResolvedValue({
        outcome: 'permission-denied',
        source: 'camera',
      });
      const { findByRole, getByRole } = render(<TestComponent />);

      userEvent.click(getByRole('button', { name: 'Change photo' }));
      userEvent.click(await findByRole('menuitem', { name: 'Take Photo' }));

      await waitFor(() =>
        expect(mockEnqueue).toHaveBeenCalledWith(
          'MPDX does not have permission to use the camera. Enable camera access for MPDX in your device settings and try again.',
          { variant: 'error' },
        ),
      );
      expect(setAvatar).not.toHaveBeenCalled();
    });

    it('shows an error when photo library permission is denied', async () => {
      getAvatarPhoto.mockResolvedValue({
        outcome: 'permission-denied',
        source: 'photos',
      });
      const { findByRole, getByRole } = render(<TestComponent />);

      userEvent.click(getByRole('button', { name: 'Change photo' }));
      userEvent.click(
        await findByRole('menuitem', { name: 'Choose from Library' }),
      );

      await waitFor(() =>
        expect(mockEnqueue).toHaveBeenCalledWith(
          'MPDX does not have permission to access your photos. Enable photo access for MPDX in your device settings and try again.',
          { variant: 'error' },
        ),
      );
      expect(setAvatar).not.toHaveBeenCalled();
    });

    it('brands the permission-denied messages with the configured app name', async () => {
      const originalAppName = process.env.APP_NAME;
      process.env.APP_NAME = 'StaffApp';
      try {
        getAvatarPhoto.mockResolvedValue({
          outcome: 'permission-denied',
          source: 'camera',
        });
        const { findByRole, getByRole } = render(<TestComponent />);

        userEvent.click(getByRole('button', { name: 'Change photo' }));
        userEvent.click(await findByRole('menuitem', { name: 'Take Photo' }));

        await waitFor(() =>
          expect(mockEnqueue).toHaveBeenCalledWith(
            'StaffApp does not have permission to use the camera. Enable camera access for StaffApp in your device settings and try again.',
            { variant: 'error' },
          ),
        );
      } finally {
        process.env.APP_NAME = originalAppName;
      }
    });

    it('does nothing when the user cancels the capture', async () => {
      getAvatarPhoto.mockResolvedValue({ outcome: 'canceled' });
      const { findByRole, getByRole } = render(<TestComponent />);

      userEvent.click(getByRole('button', { name: 'Change photo' }));
      userEvent.click(await findByRole('menuitem', { name: 'Take Photo' }));

      await waitFor(() =>
        expect(getAvatarPhoto).toHaveBeenCalledWith('camera'),
      );
      expect(setAvatar).not.toHaveBeenCalled();
      expect(mockEnqueue).not.toHaveBeenCalled();
    });

    it('shows a generic error when the capture fails', async () => {
      getAvatarPhoto.mockResolvedValue({
        outcome: 'error',
        error: new Error('Native failure'),
      });
      const { findByRole, getByRole } = render(<TestComponent />);

      userEvent.click(getByRole('button', { name: 'Change photo' }));
      userEvent.click(await findByRole('menuitem', { name: 'Take Photo' }));

      await waitFor(() =>
        expect(mockEnqueue).toHaveBeenCalledWith(
          'Failed to get the photo. Please try again.',
          { variant: 'error' },
        ),
      );
      expect(setAvatar).not.toHaveBeenCalled();
    });

    it('shows an offline warning instead of the menu when offline', () => {
      mockedUseIsOnline.mockReturnValue(false);
      const { getByRole, getByTestId, queryByRole } = render(<TestComponent />);

      const fileInput = getByTestId('PersonNameUpload');
      const clickSpy = jest.spyOn(fileInput, 'click');

      userEvent.click(getByRole('button', { name: 'Change photo' }));

      expect(mockEnqueue).toHaveBeenCalledWith(
        'Cannot change the photo while offline.',
        { variant: 'warning' },
      );
      expect(queryByRole('menu')).not.toBeInTheDocument();
      expect(clickSpy).not.toHaveBeenCalled();
      expect(getAvatarPhoto).not.toHaveBeenCalled();
    });
  });
});
