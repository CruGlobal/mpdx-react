import { renderHook } from '@testing-library/react-hooks';
import { gqlMock } from '__tests__/util/graphqlMocking';
import {
  LoadConstantsDocument,
  LoadConstantsQuery,
} from 'src/components/Constants/LoadConstants.generated';
import { loadConstantsMockData } from 'src/components/Constants/LoadConstantsMock';
import { useApiConstants } from 'src/components/Constants/UseApiConstants';
import { useContactPartnershipStatuses } from './useContactPartnershipStatuses';

jest.mock('src/components/Constants/UseApiConstants.tsx');

// Mock useApiConstants to make the data available synchronously instead of having to wait for the GraphQL call
(useApiConstants as jest.MockedFn<typeof useApiConstants>).mockReturnValue(
  gqlMock<LoadConstantsQuery>(LoadConstantsDocument, {
    mocks: loadConstantsMockData,
  }).constant,
);

describe('useContactPartnershipStatuses', () => {
  it('should return correctly formatted contactPartnershipStatuses.test', () => {
    const { result } = renderHook(() => useContactPartnershipStatuses());
    // contactStatuses
    expect(result.current.contactStatuses.ACTIVE).toEqual({
      name: 'active',
      phase: null,
      translated: '-- All Active --',
    });
    expect(result.current.contactStatuses.PARTNER_FINANCIAL).toEqual({
      name: 'Partner - Financial',
      phase: 'PARTNER_CARE',
      translated: 'Partner - Financial',
    });

    //statusArray
    expect(result.current.statusArray[0]).toEqual({
      id: 'NEVER_CONTACTED',
      name: 'New Connection',
      phase: 'CONNECTION',
      translated: 'New Connection',
    });

    //statusMap
    expect(result.current.statusMap).toEqual({
      'Appointment Scheduled': 'APPOINTMENT_SCHEDULED',
      'Ask in Future': 'ASK_IN_FUTURE',
      'Cultivate Relationship': 'CULTIVATE_RELATIONSHIP',
      'Expired Connection': 'EXPIRED_REFERRAL',
      'Follow Up for Decision': 'CALL_FOR_DECISION',
      'Initiate for Appointment': 'CONTACT_FOR_APPOINTMENT',
      'Never Ask': 'NEVER_ASK',
      'New Connection': 'NEVER_CONTACTED',
      'Not Interested': 'NOT_INTERESTED',
      'Partner - Financial': 'PARTNER_FINANCIAL',
      'Partner - Pray': 'PARTNER_PRAY',
      'Partner - Special': 'PARTNER_SPECIAL',
      'Research Abandoned': 'RESEARCH_ABANDONED',
      'Research Contact Info': 'RESEARCH_CONTACT_INFO',
      Unresponsive: 'UNRESPONSIVE',
    });

    // statusMapForFilters
    expect(result.current.statusMapForFilters).toEqual({
      'Appointment Scheduled': 'APPOINTMENT_SCHEDULED',
      'Ask in Future': 'ASK_IN_FUTURE',
      'Cultivate Relationship': 'CULTIVATE_RELATIONSHIP',
      'Expired Connection': 'EXPIRED_REFERRAL',
      'Follow Up for Decision': 'CALL_FOR_DECISION',
      'Initiate for Appointment': 'CONTACT_FOR_APPOINTMENT',
      'Never Ask': 'NEVER_ASK',
      'New Connection': 'NEVER_CONTACTED',
      'Not Interested': 'NOT_INTERESTED',
      'Partner - Financial': 'PARTNER_FINANCIAL',
      'Partner - Pray': 'PARTNER_PRAY',
      'Partner - Special': 'PARTNER_SPECIAL',
      'Research Abandoned': 'RESEARCH_ABANDONED',
      'Research Contact Info': 'RESEARCH_CONTACT_INFO',
      Unresponsive: 'UNRESPONSIVE',
      active: 'ACTIVE',
      hidden: 'HIDDEN',
      null: 'NULL',
    });
  });
});
