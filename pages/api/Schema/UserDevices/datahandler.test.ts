import {
  DestroyUserDevice,
  RegisterUserDevice,
  UserDeviceResponse,
} from './datahandler';

describe('RegisterUserDevice', () => {
  it('maps a JSON:API device resource to a UserDevice', () => {
    const data: UserDeviceResponse = {
      id: 'device-1',
      type: 'user_devices',
      attributes: {
        platform: 'APNS',
        version: '1.2.3',
        locale: 'fr-FR',
        created_at: '2026-06-10T12:00:00Z',
        updated_at: '2026-06-10T12:00:00Z',
      },
    };

    expect(RegisterUserDevice(data)).toEqual({
      id: 'device-1',
      platform: 'APNS',
      version: '1.2.3',
      locale: 'fr-FR',
    });
  });

  it('maps a GCM device resource without timestamps', () => {
    const data: UserDeviceResponse = {
      id: 'device-2',
      type: 'user_devices',
      attributes: {
        platform: 'GCM',
        version: '0.0.0',
        locale: 'en',
      },
    };

    expect(RegisterUserDevice(data)).toEqual({
      id: 'device-2',
      platform: 'GCM',
      version: '0.0.0',
      locale: 'en',
    });
  });
});

describe('DestroyUserDevice', () => {
  it('returns success', () => {
    expect(DestroyUserDevice()).toEqual({ success: true });
  });
});
