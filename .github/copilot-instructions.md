# Jornada Mais - Next.js Project

## Stack

- Next.js 14+ (App Router)
- TypeScript
- Auth.js v5 (Google OAuth)
- TailwindCSS (dark theme)
- TanStack Query v5
- Prisma (SQLite dev / PostgreSQL prod)
- Cloudinary (video uploads)
- Shadcn/ui components

## Theme

- Background: slate-900
- Accent: purple-500/600
- Dark mode by default

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (login)
│   ├── (dashboard)/       # Protected candidate routes
│   ├── admin/             # Admin panel
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # Shadcn components
│   └── ...               # Feature components
├── lib/                   # Utilities
│   ├── auth.ts           # Auth.js config
│   ├── db.ts             # Prisma client
│   ├── cloudinary.ts     # Cloudinary config
│   └── query-client.ts   # TanStack Query
├── hooks/                 # Custom hooks
└── types/                 # TypeScript types
```
