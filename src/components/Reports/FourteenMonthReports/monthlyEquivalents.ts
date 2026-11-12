import { StatusEnum } from 'src/graphql/types.generated';
import { Contact } from './Layout/Table/TableHead/TableHead';

const SOLID_MONTHLY_SUPPORT_MONTHS = 12;
const MAX_MISSED_MONTHS = 2;

interface InHandMonthlyEquivalent {
  amount: number;
  months: Contact['months'];
  numMonths: number;
}

const isFinancialPartner = (contact: Contact): boolean =>
  contact.status?.toUpperCase() === StatusEnum.PartnerFinancial;

const getCommitment = (contact: Contact): number | null => {
  if (!isFinancialPartner(contact)) {
    return null;
  }
  const { pledgeAmount, pledgeFrequency } = contact;
  if (!pledgeAmount || !pledgeFrequency) {
    return null;
  }
  return pledgeAmount / parseFloat(pledgeFrequency);
};

export const getCommittedMonthlyEquivalent = (
  contact: Contact,
): number | null => {
  const commitment = getCommitment(contact);
  return commitment === null ? null : Math.round(commitment);
};

// The rate the contact's gifts in their commitment currency were converted to the report
// currency at, from the months whose gifts were all in that currency
const getGiftConversionRate = (contact: Contact): number | null => {
  let amount = 0;
  let converted = 0;
  contact.months.forEach(({ donations, total }) => {
    if (donations.length === 0) {
      return;
    }
    if (donations.some((gift) => gift.currency !== contact.pledgeCurrency)) {
      return;
    }
    amount += donations.reduce((sum, gift) => sum + gift.amount, 0);
    converted += total;
  });
  return amount > 0 ? converted / amount : null;
};

// The committed monthly equivalent in the report's currency
const getCommittedInCurrency = (
  contact: Contact,
  currency: string,
): number | null => {
  const commitment = getCommitment(contact);
  if (commitment === null) {
    return null;
  }
  if (!contact.pledgeCurrency || contact.pledgeCurrency === currency) {
    return Math.round(commitment);
  }
  const rate = getGiftConversionRate(contact);
  return rate === null ? null : Math.round(commitment * rate);
};

/*
 * Average the gifts over the most recent minMonths months, or over the commitment
 * frequency when it is longer. contact.months is newest first.
 */
export const getInHandMonthlyEquivalent = (
  contact: Contact,
  minMonths: number,
): InHandMonthlyEquivalent | null => {
  if (!isFinancialPartner(contact) || !contact.pledgeFrequency) {
    return null;
  }

  const numMonths = Math.max(minMonths, parseInt(contact.pledgeFrequency));
  // Skip the first month because it is the current month and monthly partners may
  // not have given yet.
  const months = contact.months.slice(1, numMonths + 1);
  const total = months.reduce((sum, month) => sum + month.total, 0);

  return { amount: Math.round(total / numMonths), months, numMonths };
};

// Only partners who give monthly or more often are expected to give every month
const missedTooManyMonths = (
  contact: Contact,
  months: Contact['months'],
): boolean => {
  if (parseFloat(contact.pledgeFrequency ?? '') > 1) {
    return false;
  }
  const missedMonths = months.filter((month) => month.total <= 0).length;
  return missedMonths > MAX_MISSED_MONTHS;
};

/*
 * The In Hand Monthly Equivalent over 12 months, capped at the commitment, in the
 * report's currency. Gifts above the commitment and gifts from anyone who is not a
 * financial partner are special gifts and are left out.
 */
export const getSolidMonthlySupport = (
  contact: Contact,
  currency: string,
): number => {
  const committed = getCommittedInCurrency(contact, currency);
  const inHand = getInHandMonthlyEquivalent(
    contact,
    SOLID_MONTHLY_SUPPORT_MONTHS,
  );
  if (committed === null || inHand === null) {
    return 0;
  }
  if (missedTooManyMonths(contact, inHand.months)) {
    return 0;
  }
  return Math.min(committed, inHand.amount);
};

export const calculateSolidMonthlySupport = (
  contacts: Contact[],
  currency: string,
): number =>
  contacts.reduce(
    (total, contact) => total + getSolidMonthlySupport(contact, currency),
    0,
  );
