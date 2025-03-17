# TaskFlow - Application de gestion des tâches et notes

## Nouvel éditeur de notes style Office

Le nouvel éditeur de notes présente les caractéristiques suivantes :

### Fonctionnalités

- Interface utilisateur inspirée de Microsoft Office avec ruban
- Vue Kanban améliorée et fiable pour la gestion des notes par statut
- Éditeur de texte riche avec barre d'outils complète
- Gestion des métadonnées (catégories, tags, statuts)
- Multiples modes d'affichage (éditeur, kanban, liste)
- Sauvegarde automatique des modifications
- Insertion d'images et médias

### Structure technique

- Architecture basée sur des composants React modulaires
- Gestion d'état centralisée avec Context API
- Séparation claire entre UI, logique métier et services API
- Styles CSS organisés par domaine fonctionnel

## Installation

```bash
npm install
npm start
```

## Utilisation

Accédez à l'éditeur de notes via le menu "Notes" ou en naviguant vers `/notes` dans l'URL.

## Technologies utilisées

- React 18
- React Router
- React Beautiful DnD pour le glisser-déposer
- ReactQuill pour l'édition de texte riche
- Bootstrap pour la mise en page responsive
- Font Awesome pour les icônes
- Date-fns pour la manipulation des dates
