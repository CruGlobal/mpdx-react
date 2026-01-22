import { AdditionalSalaryRequestSectionEnum } from '../../AdditionalSalaryRequestHelper';
import { getHeader } from './getHeader';

describe('getHeader', () => {
  it('returns the text About this Form with step AboutForm', () => {
    expect(getHeader(AdditionalSalaryRequestSectionEnum.AboutForm)).toBe(
      'About this Form',
    );
  });
  it('returns the text Complete the Form with step CompleteForm', () => {
    expect(getHeader(AdditionalSalaryRequestSectionEnum.CompleteForm)).toBe(
      'Complete the Form',
    );
  });
  it('returns the text Receipt with step Receipt', () => {
    expect(getHeader(AdditionalSalaryRequestSectionEnum.Receipt)).toBe(
      'Receipt',
    );
  });
});
