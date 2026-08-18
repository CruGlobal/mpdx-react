import { mockCohorts } from '../mockData';
import {
  buildPlaceholderPdf,
  downloadPdf,
  generateCohortGoalsPdf,
} from './printCohortGoalsPdf';

describe('buildPlaceholderPdf', () => {
  it('produces a well-formed PDF document', () => {
    const pdf = buildPlaceholderPdf(['Hello', 'World']);
    expect(pdf).toMatch(/^%PDF-1\.4\n/);
    expect(pdf).toMatch(/%%EOF$/);
    expect(pdf).toContain('(Hello) Tj');
    expect(pdf).toContain('(World) Tj');
    // The xref offset in startxref must point at the xref keyword.
    const xrefOffset = Number(pdf.match(/startxref\n(\d+)/)?.[1]);
    expect(pdf.slice(xrefOffset, xrefOffset + 4)).toBe('xref');
  });

  it('escapes characters that would terminate a PDF string', () => {
    const pdf = buildPlaceholderPdf(['John (Jack) Doe \\ Co']);
    expect(pdf).toContain('(John \\(Jack\\) Doe \\\\ Co) Tj');
  });
});

describe('generateCohortGoalsPdf', () => {
  it('builds a blob URL for a PDF listing every goal in the cohort', async () => {
    const createObjectURL = jest.fn().mockReturnValue('blob:cohort-pdf');
    window.URL.createObjectURL = createObjectURL;

    await expect(generateCohortGoalsPdf(mockCohorts[0])).resolves.toBe(
      'blob:cohort-pdf',
    );
    const blob = createObjectURL.mock.calls[0][0] as Blob;
    expect(blob.type).toBe('application/pdf');
  });
});

describe('downloadPdf', () => {
  it('downloads via a temporary anchor and releases the URL', () => {
    const revokeObjectURL = jest.fn();
    window.URL.revokeObjectURL = revokeObjectURL;
    const click = jest
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {});
    let anchor: HTMLAnchorElement | undefined;
    const realCreateElement = document.createElement.bind(document);
    const createElement = jest
      .spyOn(document, 'createElement')
      .mockImplementation((tagName) => {
        const element = realCreateElement(tagName);
        if (element instanceof HTMLAnchorElement) {
          anchor = element;
        }
        return element;
      });

    downloadPdf('blob:cohort-pdf', 'MPD Goals - Fall NSO 2026.pdf');

    expect(click).toHaveBeenCalled();
    expect(anchor?.download).toBe('MPD Goals - Fall NSO 2026.pdf');
    expect(anchor?.href).toContain('blob:cohort-pdf');
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:cohort-pdf');
    click.mockRestore();
    createElement.mockRestore();
  });
});
