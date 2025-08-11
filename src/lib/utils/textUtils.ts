export const formatNoteText = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/\\\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\\/g, '');
}; 