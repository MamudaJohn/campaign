// Replace the empty image and link fields with your published assets and URLs.
// The Scene Studio also lets you preview edits locally in your own browser.
export const campaign = {
  name: 'Upgrade RUNACOS',
  tagline: 'A future worth building. Together.',
  themeImage: '',
  candidates: [
    {
      id: 'john-mamuda', name: 'John Mamuda', position: 'ICT Director',
      statement: 'Meet the candidate. Explore the vision. Be part of what comes next.',
      detail: 'The full candidate statement and campaign details will be added here.',
      image: '', link: '', initials: 'JM', configured: true,
    },
    ...Array.from({ length: 4 }, (_, index) => ({
      id: `candidate-${index + 2}`, name: `Candidate slot ${String(index + 2).padStart(2, '0')}`,
      position: 'Position to be announced', statement: 'A space for the next voice. Candidate details and portrait will appear here.',
      detail: 'This is an empty candidate slot, ready for a name, position, photograph, statement, and destination link.',
      image: '', link: '', initials: String(index + 2).padStart(2, '0'), configured: false,
    })),
  ],
};
