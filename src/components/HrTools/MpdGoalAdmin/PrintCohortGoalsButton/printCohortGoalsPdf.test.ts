import { attendeeToRow, cohortNodeToCohort } from '../mpdGoalAdminHelpers';
import { attendees, cohortsMock } from '../mpdGoalAdminMocks';
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

  it('throws when the lines exceed the single-page capacity', () => {
    expect(() => buildPlaceholderPdf(Array(45).fill('x'))).toThrow();
  });
});

const cohort = cohortNodeToCohort(
  cohortsMock.newStaffCohorts.nodes[0],
  'en-US',
);
const rows = attendees.map(attendeeToRow);

describe('generateCohortGoalsPdf', () => {
  // jsdom does not implement Blob.text(), so read the blob with a FileReader.
  const readBlobText = (blob: Blob) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(blob);
    });

  it('builds a blob URL for a PDF listing every goal in the cohort', async () => {
    const createObjectURL = jest.fn().mockReturnValue('blob:cohort-pdf');
    window.URL.createObjectURL = createObjectURL;

    await expect(generateCohortGoalsPdf(cohort, rows)).resolves.toBe(
      'blob:cohort-pdf',
    );
    const blob = createObjectURL.mock.calls[0][0] as Blob;
    expect(blob.type).toBe('application/pdf');

    const pdf = await readBlobText(blob);
    expect(pdf).toContain('(MPD Goals - Fall NSO 2026) Tj');
    expect(pdf).toContain('(John & Jane Doe: $6,430.25) Tj');
    expect(pdf).toContain('(Sam Smith: $4,200) Tj');
    // An attendee with no goal calculation still gets a line, marked Pending.
    expect(pdf).toContain('(Carlos & Michaela Everts: Pending) Tj');
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
