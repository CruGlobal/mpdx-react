export interface DonationMoney {
  amount: number;
  currency: string;
  convertedAmount: number;
  convertedCurrency: string;
}

export const sumDonationsAcrossPartners = (
  donations: DonationMoney[],
): number => {
  return donations.reduce(
    (total, donation) => total + donation.convertedAmount,
    0,
  );
};

export interface AccountCurrencyGift {
  amount: number;
}

// AccountCurrencyGift.amount is always already expressed in the account's
// single reporting currency (there is no per-row currency to mix here,
// unlike the raw per-donation `amount` above), so summing it directly is safe.
export const sumAccountCurrencyGifts = (
  gifts: AccountCurrencyGift[],
): number => {
  return gifts.reduce((total, gift) => total + gift.amount, 0);
};
