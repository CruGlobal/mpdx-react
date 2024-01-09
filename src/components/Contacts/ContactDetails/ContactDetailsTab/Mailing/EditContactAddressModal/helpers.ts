import { ContactMailingFragment } from '../ContactMailing.generated';
import { DonationServicesEmailQuery } from './EditContactAddress.generated';

export const generateEmailBody = (
  emailData: DonationServicesEmailQuery,
  address: ContactMailingFragment['addresses']['nodes'][0],
): string => {
  const donorAccount = address.sourceDonorAccount;
  const donorName = donorAccount
    ? `${emailData.contact.name} (ministry partner #${donorAccount.accountNumber})`
    : emailData.contact.name;
  const previousAddress = address.street
    ? `\nThey were previously located at:\n${address.street}\n${address.city}, ` +
      `${address.state} ${address.postalCode}\n`
    : '';
  return (
    `Dear Donation Services,\n\nOne of my ministry partners, ${donorName} ` +
    `has a new current address.\n${previousAddress}\nPlease update their address to:\n` +
    'REPLACE WITH NEW STREET\nREPLACE WITH NEW CITY, STATE, ZIP\n\nThanks,\n\n' +
    `${emailData.user.firstName}`
  );
};
