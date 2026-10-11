# Portfolio — Samih Habbani

Portfolio personnel — [samihhabbani.com](https://www.samihhabbani.com/)

## Technos utilisées

| Techno | Usage |
|---|---|
| **Next.js 16** (App Router) | Framework React, déployé sur Vercel |
| **React 19** | UI |
| **TypeScript** | Typage |
| **Tailwind CSS 4** | Styling (utilisé partiellement — beaucoup de styles inline aussi) |
| **Framer Motion** | Animations (scroll reveal, transitions, effets) |
| **EmailJS** (`@emailjs/browser`) | Envoi du formulaire de contact, sans backend |

## Structure du projet

```
src/
├── app/                    # Layout et page principale (App Router)
├── components/
│   ├── layout/              # Navbar, curseur custom
│   └── sections/            # Une section = un bloc de la page (Hero, Identity, Projects, Timeline, Contact...)
└── data/
    └── portfolio.ts         # Contenu texte centralisé (projets, expériences, identité)
```

Chaque section du site (Identity, FWDAI, Dev, Teach, Content Creator, Projects, Metrics, Network, Timeline, Contact) est un composant indépendant dans `src/components/sections/`.

## Développement local

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Déploiement (Vercel)

Le site est hébergé sur **Vercel** : chaque `git push` sur `main` déclenche un build et une mise en production automatiques. Rien à compiler ni à envoyer à la main.

### Configuration du projet Vercel
- **Framework Preset** : Next.js (détecté automatiquement)
- **Build Command / Output Directory** : laisser vide (valeurs par défaut)
- **Environment Variables** (Settings → Environment Variables, à renseigner pour Production, Preview et Development) : les 3 clés EmailJS `NEXT_PUBLIC_EMAILJS_*` listées plus bas. Le fichier `.env.local` n'est pas versionné, Vercel ne le voit donc pas — sans ces variables, le formulaire de contact ne fonctionne pas.
- **Domaine** : Settings → Domains → ajouter `samihhabbani.com` et `www.samihhabbani.com`, puis pointer le DNS chez OVH (enregistrement `A 76.76.21.21` pour la racine et `CNAME cname.vercel-dns.com` pour `www`, ou les valeurs affichées par Vercel).

### Cache
Les fichiers hachés de `/_next/static` sont mis en cache de façon permanente par Next/Vercel. Les médias de `public/` (images, vidéo) ont un cache de 30 jours défini dans `next.config.ts` ; les PDF (CV, catalogue) restent revalidés pour que leur remplacement soit visible immédiatement.

## Comment fonctionne l'envoi d'email (formulaire de contact)

Le formulaire de contact (section `// 11 · CONTACT`) utilise **EmailJS**, un service tiers qui permet d'envoyer des emails directement depuis le navigateur — **sans backend**.

### Fonctionnement
1. Le visiteur remplit le formulaire (nom, email, message) dans [`Contact.tsx`](src/components/sections/Contact.tsx)
2. Au clic sur "SEND_REQUEST", `handleSubmit` appelle `emailjs.send(...)`
3. EmailJS transmet les données à ton compte, qui envoie l'email directement dans ta boîte Gmail (`samihhabbani@gmail.com`), formaté avec le template configuré sur leur dashboard

### Configuration (`.env.local`, non versionné)
```
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_8zm5bow
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_uexqoqo
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=rwTYrOP2OVRFGaS5K
```

Ces clés sont volontairement publiques côté client (`NEXT_PUBLIC_*`) — c'est le fonctionnement normal d'EmailJS, pas une faille de sécurité.

### Gérer/modifier l'envoi
Tout se pilote depuis [dashboard.emailjs.com](https://dashboard.emailjs.com) :
- **Email Services** → le service Gmail connecté (à reconnecter si l'autorisation OAuth expire — cause la plus fréquente d'échec d'envoi)
- **Email Templates** → le format de l'email reçu (variables `from_name`, `from_email`, `message`)
- **Usage** → quota du plan gratuit (200 emails/mois)

Si le formulaire ne fonctionne plus, c'est presque toujours ici qu'il faut regarder en premier.
