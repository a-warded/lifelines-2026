Made for the Carnegie Mellon Qatar LifeLines hackathon 2026.

<div align="center">
  <a href="https://github.com/a-warded/lifelines-2026">
    <img src="https://github.com/a-warded/lifelines-2026/blob/main/repo_splashscreen.webp?raw=true" alt="FADES Logo Placeholder" width="100%">
  </a>

  <h3 align="center">FADES</h3>
  <p align="center">
    Food, Agriculture, and Distribution Ecosystem
    <br />
    <br />
    <a href="https://lifelines26.a-warded.org">Deployed Instance</a>
    •
    <a href="https://github.com/a-warded/lifelines-2026/blob/main/CREDITS.md">Credits</a>
  </p>
</div>

# The Problem

When a crisis hits, be it a climate catastrophe, conflict, or systemic collapse, the first thing to break is the food chain. We currently rely on centralized vulnerability: massive farms that are easily destroyed, supply lines that snap under pressure, and specialized knowledge locked away from the people who actually need it the most.

# The Solution

FADES, or Food, Agriculture, and Distribution Ecosystem, is a software solution that brings together local communities to rebuild food systems collectively. The platform addresses the core issue of food insecurity by enabling food to be grown in areas that were previously unused, such as small pots, containers, courtyards, rooftops, and damaged fields. This way, food systems will not be bound by a single point of failure. FADES will aid not just farmers but also entire communities in growing, sustaining, and distributing crops and seeds to create a self-sustaining food system that enables a circular economy. 

# Tech Stack

<div align="center">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg" height="30"/>
  <img width="12" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" height="30"  />
  <img width="12" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg" height="30"   />
  <img width="12" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongodb/mongodb-original.svg" height="30" />
  <img width="12" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg" height="30" />
  <img width="12" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg" height="30"  />
</div>

# Running or Deploying

We have a hosted instance at [lifelines26.a-warded.org](https://lifelines26.a-warded.org), however if you want to deploy it yourself here's how:

```bash
git clone https://github.com/a-warded/lifelines-2026.git
cd ./lifelines-2026
npm install
```

You then have to copy `example.env` to `.env.local`, and fill in all the credentials for your database and auth.

Finally:

```bash
npm run dev
```
