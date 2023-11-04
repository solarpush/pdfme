import type { PDFRenderProps } from '@pdfme/common';
import type { ImageSchema } from './types';
import { convertForPdfLayoutProps } from '../renderUtils';

export const pdfRender = async (arg: PDFRenderProps<ImageSchema>) => {
  const { value, schema, pdfDoc, page, _cache, cacheKey } = arg;

  let image = _cache.get(cacheKey);
  if (!image) {
    const isPng = value.startsWith('data:image/png;');
    image = await (isPng ? pdfDoc.embedPng(value) : pdfDoc.embedJpg(value));
    _cache.set(cacheKey, image);
  }

  const pageHeight = page.getHeight();
  const {
    width,
    height,
    rotate,
    position: { x, y },
  } = convertForPdfLayoutProps({ schema, pageHeight });

  page.drawImage(image, { x, y, rotate, width, height });
};
