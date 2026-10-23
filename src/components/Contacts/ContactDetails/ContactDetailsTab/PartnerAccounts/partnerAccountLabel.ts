// Mirrors DonorAccountDecorator#display_name in mpdx_api when it is given an account list
export const partnerAccountLabel = (
  contactName: string | null | undefined,
  accountNumber: string,
): string => {
  if (!contactName) {
    return accountNumber;
  }
  if (!accountNumber || contactName.includes(accountNumber)) {
    return contactName;
  }
  return `${contactName} (${accountNumber})`;
};
