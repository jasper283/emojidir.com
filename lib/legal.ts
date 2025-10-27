import { readFile, readdir } from 'fs/promises';
import { join } from 'path';

export type LegalDocType = 'privacy' | 'terms';

export interface LegalDocument {
  content: string;
  locale: string;
}

export async function getLegalDocument(
  type: LegalDocType,
  locale: string
): Promise<LegalDocument | null> {
  try {
    const contentPath = join(process.cwd(), 'content', type);
    const filePath = join(contentPath, `${locale}.mdx`);

    const content = await readFile(filePath, 'utf-8');

    return {
      content,
      locale,
    };
  } catch (error) {
    // 如果没有找到对应语言的文件，尝试使用英文版本
    if (locale !== 'en') {
      return getLegalDocument(type, 'en');
    }
    return null;
  }
}

export async function getAllLegalDocumentLocales(
  type: LegalDocType
): Promise<string[]> {
  try {
    const contentPath = join(process.cwd(), 'content', type);
    const files = await readdir(contentPath);

    return files
      .filter(file => file.endsWith('.mdx'))
      .map(file => file.replace('.mdx', ''));
  } catch {
    return [];
  }
}

