import {
  UserDevice,
  UserDeviceDeletion,
} from '../../graphql-rest.page.generated';

export interface UserDeviceResponse {
  id: string;
  type: string;
  attributes: {
    platform: string;
    version: string;
    locale: string;
    // Timestamps are returned by the serializer but intentionally ignored.
    // The device token is never returned by the serializer.
    created_at?: string;
    updated_at?: string;
  };
}

export const RegisterUserDevice = (data: UserDeviceResponse): UserDevice => ({
  id: data.id,
  platform: data.attributes.platform,
  version: data.attributes.version,
  locale: data.attributes.locale,
});

export const DestroyUserDevice = (): UserDeviceDeletion => ({
  success: true,
});
