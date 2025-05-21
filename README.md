# Billed

Billed est une application SaaS pour gérer les notes de frais des équipes RH.
Les employés soumettent leurs dépenses, et les administrateurs les valident facilement.

## Sommaire

- [Installation](#installation)
- [Fonctionnalités](#fonctionnalites)

## Installation

Pour installer le projet, clonez le dépôt GitHub

### Setup le back

Utiliser la version node 18.16.1

```
nvm use 18.16.1
```

Aller dans le fichier du back

```
cd Billed-app-FR-Back
```

Installer les dépendances

```
npm install
```

### Setup le front

Aller dans le fichier du front

```
cd Billed-app-FR-Front
```

Installer les dépendances

```
npm install
```

Installez live-server pour lancer un serveur local :

```
npm install -g live-server
```

### Lancement

Pour lancer le back :

```
cd Billed-app-FR-Back
```

```
npm run run:dev
```

Pour lancer le front :

```
cd Billed-app-FR-Front
```

```
live-server
```

Pour se connecter aux comptes :

administrateur :

```
utilisateur : admin@test.tld
mot de passe : admin
```

employé :

```
utilisateur : employee@test.tld
mot de passe : employee
```

### Tests

Pour lancer tous les tests en local avec Jest

```
npm run test
```

Pour lancer un seul test
Installez jest-cli

```
npm i -g jest-cli
```

Lancer le test

```
npx jest src/__tests__/your_test_file.js
```

## Fonctionnalités

- **Authentification** : Connexion en tant qu’employé ou administrateur RH via la page Login.
- **Gestion des notes de frais (employé)** : Création, envoi, suivi du statut, et visualisation des justificatifs.
- **Dashboard administratif** : Consultation, validation ou refus des notes de frais par statut.
- **Navigation et session** : Maintien de la session active et redirection fluide lors de la déconnexion.
