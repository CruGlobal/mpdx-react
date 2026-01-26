import { SecaStatusEnum } from 'pages/api/graphql-rest.page.generated';
import i18n from 'src/lib/i18n';
import { getLocalizedTaxStatus } from './getLocalizedTaxStatus';

describe('getLocalizedSecaStatus', () => {
  const { t } = i18n;

  it('should return localized string for Optout status', () => {
    expect(getLocalizedTaxStatus(SecaStatusEnum.Optout, t)).toBe('Exempt');
  });

  it('should return localized string for Seca status', () => {
    expect(getLocalizedTaxStatus(SecaStatusEnum.Seca, t)).toBe(
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
