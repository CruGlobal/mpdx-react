import { DonationRow } from 'src/components/DonationTable/DonationTable';
import { useDonationTableQuery } from 'src/components/DonationTable/DonationTable.generated';
import {
  DonationUpdateInput,
  PledgeStatusEnum,
} from 'src/graphql/types.generated';
import { AppealContactInfoFragment } from '../../AppealsContext/contacts.generated';

type ConnectDonationsProps = {
  selectedDonations: DonationRow[];
  donationTableQueryResult: ReturnType<typeof useDonationTableQuery>;
  appealId: string;
  pledge?: AppealContactInfoFragment['pledges'][0];
};
// Returns all the donations that should be connected to the pledge
// In other words, ones which the user has selected
export const connectDonations = ({
  selectedDonations,
  donationTableQueryResult,
  appealId,
  pledge,
}: ConnectDonationsProps) => {
  return selectedDonations.reduce<DonationUpdateInput[]>(
    (result, selectedDonation) => {
      const initialDonation =
        donationTableQueryResult.data?.donations.nodes.find(
          (donation) => donation.id === selectedDonation.id,
        );

      // If the donation is not already connected to the pledge, connect it
      // Or if the donation is connected to the pledge but the pledge is NOT_RECEIVED, connect it
      if (
        initialDonation?.appeal?.id !== appealId ||
        (pledge?.status === PledgeStatusEnum.NotReceived &&
          initialDonation?.appeal?.id === appealId)
      ) {
        return [
          ...result,
          {
            id: selectedDonation.id,
            appealId,
          },
        ];
      }

      return result;
    },
    [],
  );
};

type DisconnectDonationsProps = {
  selectedDonations: DonationRow[];
  donationTableQueryResult: ReturnType<typeof useDonationTableQuery>;
  appealId: string;
};
// Returns all the donations that should be disconnected from the pledge
// In other words, ones which the user has unselected
export const disconnectDonations = ({
  selectedDonations,
  donationTableQueryResult,
  appealId,
}: DisconnectDonationsProps) => {
  return (
    donationTableQueryResult.data?.donations.nodes.reduce<
      DonationUpdateInput[]
    >((result, donation) => {
      const appealMatch = donation.appeal?.id === appealId;
      const donationNotSelected = !selectedDonations.find(
        (selectedDonation) => selectedDonation.id === donation.id,
      );
      if (appealMatch && donationNotSelected) {
        return [
          ...result,
          {
            id: donation.id,
            appealId: 'none',
          },
        ];
      }
      return result;
    }, []) ?? []
  );
};
