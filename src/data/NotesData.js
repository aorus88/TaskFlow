export const notesData = [
  {
    id: '1',
    title: 'Réunion d\'équipe',
    content: 'Discuter des objectifs du projet et attribuer les tâches pour la semaine prochaine.',
    date: new Date().toISOString().split('T')[0],
  },
  {
    id: '2',
    title: 'Idées pour le weekend',
    content: 'Faire une randonnée, visiter le nouveau musée, essayer le restaurant italien recommandé par Marie.',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Hier
  },
  {
    id: '3',
    title: 'Liste de courses',
    content: 'Lait, pain, œufs, fromage, fruits frais, légumes pour la salade.',
    date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0], // Avant-hier
  },
];
