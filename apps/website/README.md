# Vite React Basic

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Features

- ⚡️ **Vite** - Next generation frontend tooling
- ⚛️ **React 18** - Latest React with concurrent features
- 🔥 **TanStack Router** - Type-safe file-based routing
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 🧩 **Shadcn UI** - Beautiful, accessible components
- 📦 **TypeScript** - Type safety and developer experience
- 🔧 **ESLint** - Code quality and consistency

## Getting Started

### Development

```bash
pnpm dev
```

### Build

```bash
pnpm build
```

### Type Checking

```bash
pnpm check-types
```

### Linting

```bash
pnpm lint
```

## Project Structure

```
src/
├── components/
│   └── ui/          # Shadcn UI components
├── lib/
│   └── utils.ts     # Utility functions
├── routes/          # TanStack Router file-based routes
│   ├── __root.tsx   # Root layout
│   ├── index.tsx    # Home page
│   └── about.tsx    # About page
└── main.tsx         # App entry point
```

## Adding New Routes

Create new files in the `src/routes` directory. TanStack Router will automatically generate the route tree based on your file structure.

Example:
- `src/routes/blog.tsx` → `/blog`
- `src/routes/blog/[id].tsx` → `/blog/:id`
- `src/routes/blog/index.tsx` → `/blog`

## Adding Shadcn UI Components

You can add more Shadcn UI components using their CLI or by manually copying the component files into `src/components/ui/`.