import pdfjs from 'pdfjs-dist';
import { TextItem } from 'pdfjs-dist/types/src/display/api.js';

function isTextItem(item: unknown): item is TextItem {
  return typeof (item as TextItem).str === 'string';
}

export default class PdfReader {
  protected filePath: string;

  protected pdf?: pdfjs.PDFDocumentProxy;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  async load() {
    this.pdf = await pdfjs.getDocument(this.filePath).promise;
  }

  getNumPages() {
    if (!this.pdf) {
      throw new Error('PDF not loaded');
    }
    return this.pdf.numPages;
  }

  async getPageContent(pageNumber = 1) {
    if (!this.pdf) {
      throw new Error('PDF not loaded');
    }

    const page = await this.pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const contentItems = textContent.items;

    return contentItems;
  }

  async getPageContentString(pageNumber = 1) {
    const contentItems = await this.getPageContent(pageNumber);
    const res: string[] = [];

    contentItems.forEach((item) => {
      if (isTextItem(item)) {
        if (item.hasEOL) {
          res.push(item.str, '\n');
        } else {
          res.push(item.str);
        }
      }
    });

    return res.join('');
  }
}
