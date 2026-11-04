# 📝 Todo List App

Une application de liste de tâches simple, réalisée en **HTML**, **CSS** et **JavaScript** vanille (sans framework ni dépendance).

## ✨ Fonctionnalités

- Ajouter une tâche
- Marquer une tâche comme terminée / en cours
- **Modifier le texte d'une tâche** (double-clic sur la tâche, validation avec `Entrée`, annulation avec `Échap`)
- Supprimer une tâche
- **Annuler une suppression** ↩️ : après la suppression d'une tâche (ou de toutes les tâches terminées), un message temporaire propose de revenir en arrière et de restaurer la ou les tâches à leur position d'origine
- Filtrer les tâches : **Toutes** / **En cours** / **Terminées**
- Supprimer toutes les tâches terminées en un clic
- **Mode sombre / clair** 🌙☀️ : bouton de bascule en haut de l'application, préférence mémorisée
- **Persistance locale** : les tâches et le thème choisi sont sauvegardés dans le `localStorage` du navigateur (ils restent après rafraîchissement de la page)

## 🗂️ Structure du projet

```
todo-list-app/
├── index.html    # Structure de la page
├── style.css     # Styles, variables CSS et thèmes
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

### ↩️ Annuler une suppression

- Après la suppression d'une tâche (bouton ✕) ou l'utilisation de **Supprimer les terminées**, un message apparaît en bas de l'écran pendant quelques secondes.
- Cliquez sur **Annuler** pour restaurer la ou les tâches supprimées à leur position initiale dans la liste.
- Passé le délai (6 secondes) ou en cas de nouvelle suppression, l'annulation n'est plus possible.

## 🛠️ Technologies

- HTML5
- CSS3 (flexbox, variables CSS, animations, snackbar)
- JavaScript (ES6+, `localStorage`, `setTimeout`)
