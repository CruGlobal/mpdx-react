import { StatusEnum } from 'src/graphql/types.generated';
import { convertStatus } from './convertContactStatus';

describe('convertContactStatus', () => {
  it('converts to StatusEnum or null', () => {
    // old status
    expect(convertStatus('Partner - Financial')).toEqual(
      StatusEnum.PartnerFinancial,
    );
    // new lowercase status
    expect(convertStatus('partner_financial')).toEqual(
      StatusEnum.PartnerFinancial,
    );
    // uppercase ENUM
    expect(convertStatus('CONTACT_FOR_APPOINTMENT')).toEqual(
      StatusEnum.ContactForAppointment,
    );
    // invalid
    expect(convertStatus('hidden')).toEqual(null);
    expect(convertStatus(undefined)).toEqual(null);
    expect(convertStatus('')).toEqual(null);
  });
});
