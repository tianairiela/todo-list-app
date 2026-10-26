# 📝 Todo List App

Une application de liste de tâches simple, réalisée en **HTML**, **CSS** et **JavaScript** vanille (sans framework ni dépendance).

## ✨ Fonctionnalités

- Ajouter une tâche
- Marquer une tâche comme terminée / en cours
- **Modifier le texte d'une tâche** (double-clic, validation avec `Entrée`, annulation avec `Échap`)
- **Marquer une tâche comme prioritaire** ⭐ (remontée automatique en tête de liste)
- **Ajouter une date d'échéance** 📅 optionnelle, avec mise en évidence des tâches en retard
- **Rechercher une tâche** 🔍 en temps réel, insensible à la casse et aux accents, combinée aux filtres
- **Exporter / Importer les tâches** 💾 au format JSON (sauvegarde, transfert entre appareils)
- Supprimer une tâche
- Filtrer les tâches : **Toutes** / **En cours** / **Terminées**
- Supprimer toutes les tâches terminées en un clic
- **Mode sombre / clair** 🌙☀️ : bouton de bascule, détection de la préférence système, choix mémorisé
- **Persistance locale** : les tâches et le thème sont sauvegardés dans le `localStorage` du navigateur (ils restent après rafraîchissement de la page)

## 🗂️ Structure du projet

```
todo-list-app/
├── index.html    # Structure de la page
├── style.css     # Styles, thèmes clair/sombre et mise en page
├── script.js     # Logique de l'application
└── README.md
```

## 🚀 Utilisation

1. Cloner le dépôt :
   ```bash
   git clone https://github.com/tianairiela/todo-list-app.git
   ```
2. Ouvrir le fichier `index.html` dans votre navigateur.

Aucune installation ni serveur n'est nécessaire.

### 💾 Sauvegarder / restaurer ses tâches

- Cliquez sur **⬇️ Exporter** pour télécharger un fichier `todo-list-AAAA-MM-JJ.json` contenant toutes vos tâches.
- Cliquez sur **⬆️ Importer** et sélectionnez un fichier JSON précédemment exporté pour restaurer vos tâches (remplace la liste actuelle).

## 🛠️ Technologies

- HTML5
- CSS3 (flexbox, animations, thème sombre)
- JavaScript (ES6+, `localStorage`, `Blob`/`FileReader`, `Intl`/`Date`, normalisation Unicode)
