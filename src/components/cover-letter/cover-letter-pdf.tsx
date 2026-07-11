'use client';

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { memo } from 'react';
import type { Resume } from '@/lib/types';

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontFamily: 'Helvetica',
    fontSize: 10.5,
    color: '#111827',
  },
  paragraph: {
    marginBottom: 14,
  },
  paragraphText: {
    textAlign: 'justify',
    lineHeight: 0.8,
  },
});

function extractText(html: string): string {
  // Replace <br> with newline before stripping tags
  return html.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '').trim();
}

function getParagraphs(html: string): string[] {
  const ps: string[] = [];
  const blockRegex = /<(p|h1|h2|div)(\s[^>]*)?>([\s\S]*?)<\/\1>/gi;
  let match;
  while ((match = blockRegex.exec(html)) !== null) {
    const text = extractText(match[3]);
    if (text) ps.push(text);
  }
  if (ps.length === 0) {
    const text = extractText(html);
    if (text) ps.push(text);
  }
  return ps;
}

interface CoverLetterPDFProps {
  resume: Resume;
}

export const CoverLetterPDF = memo(function CoverLetterPDF({ resume }: CoverLetterPDFProps) {
  const raw = resume.cover_letter?.content;
  const html = typeof raw === 'string' ? raw : '';
  const paragraphs = getParagraphs(html);

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {paragraphs.map((p, i) => {
          const lines = p.split('\n');
          return (
            <View key={i} style={styles.paragraph}>
              {lines.map((line, li) => (
                <Text key={li} style={styles.paragraphText}>{line}{li < lines.length - 1 ? '\n' : ''}</Text>
              ))}
            </View>
          );
        })}
      </Page>
    </Document>
  );
});
