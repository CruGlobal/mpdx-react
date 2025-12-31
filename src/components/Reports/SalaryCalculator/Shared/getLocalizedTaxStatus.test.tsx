import { TFunction } from 'react-i18next';
import { SecaStatusEnum } from 'pages/api/graphql-rest.page.generated';
import { getLocalizedTaxStatus } from './getLocalizedTaxStatus';

describe('getLocalizedSecaStatus', () => {
  const t: TFunction = (key) => key;

  it('should return localized string for Exempt status', () => {
    expect(getLocalizedTaxStatus(SecaStatusEnum.Exempt, t)).toBe('Exempt');
  });

  it('should return localized string for NonExempt status', () => {
    expect(getLocalizedTaxStatus(SecaStatusEnum.NonExempt, t)).toBe(
      'Subject to SECA',
    );
  });

  it('should return localized string for FICA status', () => {
    expect(getLocalizedTaxStatus(SecaStatusEnum.Fica, t)).toBe(
      'Subject to FICA',
    );
  });

  it('should return undefined for null and undefined status', () => {
    expect(getLocalizedTaxStatus(null, t)).toBeUndefined();
    expect(getLocalizedTaxStatus(undefined, t)).toBeUndefined();
  });
});
