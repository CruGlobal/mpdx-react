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

// The rate gifts in giftCurrency were converted to the report currency at, from the
// months whose gifts were all in that currency
const getConversionRate = (
  contacts: Contact[],
  giftCurrency: string,
): number | null => {
  let amount = 0;
  let converted = 0;
  contacts.forEach((contact) =>
    contact.months.forEach(({ donations, total }) => {
      if (donations.length === 0) {
        return;
      }
      if (donations.some((gift) => gift.currency !== giftCurrency)) {
        return;
      }
      amount += donations.reduce((sum, gift) => sum + gift.amount, 0);
      converted += total;
    }),
  );
  return amount > 0 ? converted / amount : null;
};

// The rate to convert the commitment to the report's currency at: the contact's own
// gifts' rate, else the rate other contacts on the report got for that currency
const getCommitmentRate = (
  contact: Contact,
  currency: string,
  reportContacts: Contact[],
): number | null => {
  const { pledgeCurrency } = contact;
  if (!pledgeCurrency || pledgeCurrency === currency) {
    return 1;
  }
  return (
    getConversionRate([contact], pledgeCurrency) ??
    getConversionRate(reportContacts, pledgeCurrency)
  );
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

// Gifts in each month beyond the partner's usual number per month
const getExtraGifts = (contact: Contact, frequency: number): number[] => {
  const giftsPerMonth = Math.max(1, Math.floor(1 / frequency));
  return contact.months.map(({ total, donations }) => {
    if (total <= 0) {
      return 0;
    }
    const gifts = donations.filter((gift) => gift.amount > 0).length;
    return Math.max(0, gifts - giftsPerMonth);
  });
};

/*
 * Only partners who give monthly or more often are expected to give every month. An
 * empty month next to a month with more gifts than the partner's usual number counts as
 * given: a gift that slips from the 31st to the 1st empties one month and doubles up the
 * next. Each extra gift makes up for one empty month.
 */
const missedTooManyMonths = (contact: Contact, numMonths: number): boolean => {
  const frequency = parseFloat(contact.pledgeFrequency ?? '');
  if (frequency > 1) {
    return false;
  }
  // Includes the current month and the oldest month, so gifts that slipped across the
  // window's edges still count
  const extraGifts = getExtraGifts(contact, frequency);
  let missedMonths = 0;
  // contact.months is newest first, and the current month (index 0) is outside the window
  for (let index = 1; index <= numMonths; index++) {
    if ((contact.months[index]?.total ?? 0) > 0) {
      continue;
    }
    const neighbor = [index + 1, index - 1].find(
      (other) => (extraGifts[other] ?? 0) > 0,
    );
    if (neighbor === undefined) {
      missedMonths++;
    } else {
      extraGifts[neighbor]--;
    }
  }
  return missedMonths > MAX_MISSED_MONTHS;
};

interface ContactSolidMonthlySupport {
  amount: number;
  // Counted at 0 because the commitment could not be converted to the report's currency
  unconverted: boolean;
}

const getContactSolidMonthlySupport = (
  contact: Contact,
  currency: string,
  reportContacts: Contact[],
): ContactSolidMonthlySupport => {
  const commitment = getCommitment(contact);
  const inHand = getInHandMonthlyEquivalent(
    contact,
    SOLID_MONTHLY_SUPPORT_MONTHS,
  );
  if (
    commitment === null ||
    inHand === null ||
    missedTooManyMonths(contact, inHand.numMonths)
  ) {
    return { amount: 0, unconverted: false };
  }
  const rate = getCommitmentRate(contact, currency, reportContacts);
  if (rate === null) {
    return { amount: 0, unconverted: true };
  }
  return {
    amount: Math.min(Math.round(commitment * rate), inHand.amount),
    unconverted: false,
  };
};

/*
 * The In Hand Monthly Equivalent over 12 months, capped at the commitment, in the
 * report's currency. Gifts above the commitment and gifts from anyone who is not a
 * financial partner are special gifts and are left out.
 */
export const getSolidMonthlySupport = (
  contact: Contact,
  currency: string,
): number => getContactSolidMonthlySupport(contact, currency, [contact]).amount;

export interface SolidMonthlySupport {
  amount: number;
  // Financial partners counted at 0 because no gift on the report was in their
  // commitment currency, so it could not be converted
  unconvertedPartners: string[];
}

export const calculateSolidMonthlySupport = (
  contacts: Contact[],
  currency: string,
): SolidMonthlySupport =>
  contacts.reduce<SolidMonthlySupport>(
    (total, contact) => {
      const { amount, unconverted } = getContactSolidMonthlySupport(
        contact,
        currency,
        contacts,
      );
      return {
        amount: total.amount + amount,
        unconvertedPartners: unconverted
          ? [...total.unconvertedPartners, contact.name]
          : total.unconvertedPartners,
      };
    },
    { amount: 0, unconvertedPartners: [] },
  );
