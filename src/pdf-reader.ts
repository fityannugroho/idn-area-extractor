import Pdfparser, { Output } from 'pdf2json';

export default class PdfReader {
  // TODO: this can make memory leaks when the PDF contains many pages
  protected output: Output | undefined;

  protected pdfParser: Pdfparser;

  constructor() {
    this.pdfParser = new Pdfparser();
  }

  async load(filePath: string) {
    await this.pdfParser.loadPDF(filePath);

    this.output = await new Promise<Output>((resolve, reject) => {
      this.pdfParser.on('pdfParser_dataError', (err) => {
        reject(err);
      });

      this.pdfParser.on('pdfParser_dataReady', (data) => {
        resolve(data);
      });
    });

    return this;
  }

  getNumPages() {
    if (!this.output) {
      throw new Error('PDF not loaded');
    }

    return this.output.Pages.length;
  }

  /**
   * @param pageNumber The page number to get. The first page is 1.
   */
  getPageContentString(pageNumber = 1) {
    if (!this.output) {
      throw new Error('PDF not loaded');
    }

    const texts = this.output.Pages.at(pageNumber - 1)?.Texts;

    if (!texts) {
      throw new Error(`Page ${pageNumber} not found`);
    }

    let strInPage = '';
    let prevY: number;

    texts.forEach((text) => {
      const { y, R } = text;

      if (prevY && y - prevY > 0.7) {
        strInPage += '\n';
      }

      R.forEach((textRun) => {
        const phrase = decodeURIComponent(textRun.T)
          .trim().split(' ')
          .filter((word) => word !== '')
          .join(' ');

        strInPage = `${strInPage} ${phrase}`.trim();
      });

      prevY = y;
    });

    return `${strInPage}\n`;
  }
}
