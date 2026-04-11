# Businext — Frontend

Next.js 15 + React 19 + TypeScript app for the Businext business booking & management SaaS.

## Stack

- **Next.js 15** App Router
- **React 19**
- **TypeScript**
- **Tailwind CSS** — utility-first styling, mobile-first
- **SWR** — data fetching, caching and optimistic updates
- **React Hook Form** — form management
- **Supabase** — authentication
- **Lucide React** — icons

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── api/               # Next.js API routes (proxy to FastAPI backend)
│   ├── configuration/     # Business configuration page
│   ├── finances/          # Finances page
│   ├── products/          # Products page
│   ├── reservation/       # Reservations page
│   ├── login/             # Auth pages
│   └── layout.tsx         # Root layout (AppShell + ErrorBoundary)
├── components/
│   ├── common/
│   │   ├── AppShell.tsx         # Layout shell (sidebar visibility)
│   │   ├── ConfirmDialog.tsx    # Accessible confirmation modal (replaces window.confirm)
│   │   ├── SkeletonLoader.tsx   # Section-level loading skeletons
│   │   ├── Toast.tsx            # Non-blocking notifications (replaces window.alert)
│   │   ├── Sidebar.tsx          # Navigation sidebar
│   │   └── ...
│   ├── configuration/
│   ├── finances/
│   └── reservation/
├── hooks/
│   ├── useAccessContext.ts  # User role + capabilities (SWR, shared cache)
│   ├── useConfiguration.ts  # Business config CRUD (SWR + optimistic UI)
│   ├── useProduct.ts        # Products CRUD (SWR + optimistic UI)
│   ├── useFinances.ts       # Finances CRUD (SWR)
│   └── useReservation.ts    # Reservations CRUD (SWR)
├── lib/
│   ├── auth/              # Server session helpers
│   ├── fetcher.ts         # SWR fetcher with retry logic (3 retries, exponential backoff)
│   └── utils.ts           # API mappers (snake_case → camelCase)
└── middleware.ts           # Supabase auth middleware
```

## Key Patterns

### Data Fetching — SWR
All hooks use SWR. Data is fetched automatically on mount — **do not** call refresh methods
inside `useEffect` with an empty dependency array:

```typescript
// ❌ Wrong — causes a duplicate request
useEffect(() => { getAllProducts(); }, []);

// ✅ Correct — SWR fetches on mount automatically
const { productData, loading } = useProduct();
```

### Optimistic UI
All CRUD operations update the UI instantly via `mutate(asyncFn, { optimisticData, rollbackOnError: true })`.
No spinner needed for individual item operations.

### Access Context
`useAccessContext()` calls `/api/auth/me` once per 60 seconds and shares the result across
all components (AppShell, Sidebar, pages). Never call `/api/auth/me` directly.

Gate permission-guarded data fetches behind `!contextLoading`:

```typescript
useEffect(() => {
  if (!contextLoading && capabilities.canManageTeam) loadTeam();
}, [contextLoading, capabilities.canManageTeam]);
```

### Shared UI Components
- **`ConfirmDialog`** — replaces `window.confirm`. Accessible, Escape-to-cancel, focus-managed.
- **`Toast` + `useToast`** — replaces `window.alert`. Auto-dismiss, `aria-live`, success/error.
- **`SectionSkeleton` / `ProductGridSkeleton` / `TeamListSkeleton`** — per-section loading states.

## Environment Variables

```env
NEXT_PUBLIC_API_BASE=http://localhost:8000    # FastAPI backend URL
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```
