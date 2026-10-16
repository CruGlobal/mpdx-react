import { SecaStatusEnum } from 'src/graphql/types.generated';
import i18n from 'src/lib/i18n';
import { getSecaNote } from './getSecaNote';

const { t } = i18n;

const noStatusWarning =
  'HCM has no SECA status on file for John, so no SECA is included and the cap may be too low. Contact HR or Payroll to fix it.';

describe('getSecaNote', () => {
  const john = { name: 'John', requestedSeca: 0 };

  it('says nothing for a SECA payer, even when the estimate is zero', () => {
    expect(
      getSecaNote({ ...john, secaStatus: SecaStatusEnum.Seca }, t),
    ).toBeNull();
  });

  it('says who opted out of SECA', () => {
    expect(getSecaNote({ ...john, secaStatus: SecaStatusEnum.Optout }, t)).toBe(
      'John has opted out of SECA',
    );
  });

  it('says who pays FICA instead of SECA', () => {
    expect(getSecaNote({ ...john, secaStatus: SecaStatusEnum.Fica }, t)).toBe(
      'John pays FICA instead of SECA',
    );
  });

  it('warns when HCM has no SECA status on file', () => {
    expect(getSecaNote({ ...john, secaStatus: null }, t)).toBe(noStatusWarning);
    expect(getSecaNote({ ...john, secaStatus: undefined }, t)).toBe(
      noStatusWarning,
    );
  });

  it('stays silent while the calculation still includes SECA', () => {
    const withSeca = { name: 'John', requestedSeca: 1234.56 };

    expect(
      getSecaNote({ ...withSeca, secaStatus: SecaStatusEnum.Optout }, t),
    ).toBeNull();
    expect(
      getSecaNote({ ...withSeca, secaStatus: SecaStatusEnum.Fica }, t),
    ).toBeNull();
    expect(getSecaNote({ ...withSeca, secaStatus: null }, t)).toBeNull();
  });

  it('treats an amount under half a cent as zero', () => {
    expect(
      getSecaNote(
        {
          name: 'John',
          requestedSeca: 0.004,
          secaStatus: SecaStatusEnum.Optout,
        },
        t,
      ),
    ).toBe('John has opted out of SECA');
  });
});
