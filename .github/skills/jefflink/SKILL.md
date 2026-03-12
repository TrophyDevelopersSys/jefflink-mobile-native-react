---
name: jefflink
description: "Use when: working on JeffLink platform — mobile app, backend API, database schema, shared packages, or web app. Provides project conventions, architecture overview, data flow patterns, and step-by-step workflows for adding features, debugging builds, and updating the knowledge bank. USE FOR: adding new features, debugging Android builds, creating API endpoints, updating DB schema, understanding data flows, maintaining the knowledge bank. DO NOT USE FOR: generic React Native questions without JeffLink context."
---

# JeffLink Platform Skill

## Reference First
> Before writing any code, consult the **Knowledge Bank** at [`.github/KNOWLEDGE_BANK.md`](.github/KNOWLEDGE_BANK.md).
> It contains the full architecture, all module maps, data flow diagrams, and conventions.
> **Do not re-analyse the codebase.** Load the knowledge bank, then act.

---

## Quick Facts

| | |
|-|-|
| **Canonical Mobile App** | `jefflink-mobile/` (Expo 55 + RN 0.83.2) |
| **Canonical Backend** | `jefflink-mobile/backend/` (NestJS 10) |
| **Database** | Neon PostgreSQL via Drizzle ORM |
| **API Base** | `https://jefflink.onrender.com/api/v1` |
| **Shared Packages** | `packages/` → `@jefflink/types, api, auth, ui, utils, design-tokens` |
| **Web App** | `apps/web/` (Next.js 15) |
| **State** | Zustand 5 stores + React Context |
| **Styling** | NativeWind 4 (mobile) / Tailwind CSS 3 (web) |
| **Brand Primary** | `#0E7C3A` (green) |

---

## Workflows

### 1. Add a New Feature (Mobile)

1. **Read** the knowledge bank section § 3.7 (Features) and § 3.3 (API Layer).
2. **Create feature module** (`jefflink-mobile/src/features/{name}/`):
   - `index.ts` — barrel export
   - `types.ts` — feature-specific types (extend from `@jefflink/types` where possible)
   - `service.ts` — API calls (`import { api } from '../../api/axios'`)
   - `hooks.ts` — React hooks wrapping the service
   - `constants.ts` — feature constants
3. **Add API endpoint constant** in `src/constants/endpoints.ts`.
4. **Add API module** in `src/api/{name}.api.ts`.
5. **Create screen** in `src/screens/{role}/{FeatureName}Screen.tsx` using `ScreenWrapper` + `ScrollContainer`.
6. **Register in navigator** in `src/navigation/{Role}Navigator.tsx`.
7. **Add Zustand store** (if new persistent state needed) in `src/store/{name}.store.ts`.
8. **Update knowledge bank** — add the feature to § 3.7 and any new endpoints to § 3.3.

### 2. Add a New Backend Endpoint

1. **Read** knowledge bank § 4 (Backend API) and § 4.3 (Auth Module) for patterns.
2. **Create or update module** in `jefflink-mobile/backend/src/modules/{name}/`:
   - `{name}.controller.ts` — route decorators + guards
   - `{name}.service.ts` — business logic + Drizzle queries
   - `dto/{action}.dto.ts` — class-validator DTOs
   - `{name}.module.ts` — NestJS module definition
3. **Register** the module in `app.module.ts` imports.
4. **Apply guards**: `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles(...)` where needed.
5. **Response format**: all responses auto-wrapped by `TransformInterceptor` → `{ success, data }`.
6. **Update mobile** `src/constants/endpoints.ts` + `src/api/{name}.api.ts`.
7. **Update knowledge bank** § 4 and § 3.3.

### 3. Database Schema Change

1. **Read** knowledge bank § 5 (Database Schema) for existing tables and triggers.
2. **Write migration SQL** in `jefflink-mobile/database/` (or `database/`).
3. **Update Drizzle schema** in `jefflink-mobile/backend/src/database/schema/`.
4. **Run Drizzle commands**:
   ```bash
   cd jefflink-mobile/backend
   npm run db:generate    # Generate migration from schema
   npm run db:migrate     # Apply to Neon DB
   # or
   npm run db:push        # Push directly (dev only)
   ```
5. **Update shared types** in `packages/types/src/` if new fields are exposed via API.
6. **Update knowledge bank** § 5.3 (Core Tables) and § 5.4 (FSM) if applicable.

### 4. Debug Android Build

1. Check the build log for the root cause (Gradle error | Metro bundler | Native module).
2. **Common fixes**:
   - Gradle sync: `cd jefflink-mobile/android && ./gradlew clean`
   - Metro cache: `cd jefflink-mobile && npx expo start --clear`
   - Node modules: `pnpm install` from root
   - Composite build issue: Check `settings.gradle` for `includeBuild` conflicts
3. Run: `npx expo run:android 2>&1 | Tee-Object -FilePath "C:\jl\build-log.txt"` to capture full log.
4. Search log for `FAILURE:` or `error:` to locate root cause.
5. Fix root cause before retrying. Never retry the same failing command unchanged.

### 5. Add a New Shared Package

1. Create `packages/{name}/` with `src/index.ts`, `package.json`, `tsconfig.json`.
2. Name it `@jefflink/{name}` in `package.json`.
3. Reference from apps: `"@jefflink/{name}": "workspace:*"`.
4. Add path alias in `jefflink-mobile/tsconfig.json` paths section.
5. Update knowledge bank § 6.

### 6. Update Knowledge Bank

After **any** of these events, update [`.github/KNOWLEDGE_BANK.md`](.github/KNOWLEDGE_BANK.md):

| Event | Section to Update |
|-------|------------------|
| New screen/navigator | § 3.6 Navigation |
| New feature module | § 3.7 Feature Modules |
| New API endpoint | § 3.3 API Layer endpoints list |
| New Zustand store | § 3.4 State Management |
| New shared package | § 6 Shared Packages |
| DB table added/changed | § 5.3 Core Tables |
| New env variable | § 11 Environment |
| Deployment change | § 11 Environment |
| New data flow | § 9 Data Flow Diagrams |

Always append a row to the **Update Log** (§ 13) with the date and a brief description.

---

## Architecture Decision Rules

1. **Feature logic** goes in `src/features/{name}/service.ts` — NOT in screens.
2. **Screen components** call hooks only — never call API directly.
3. **Shared types** always go in `@jefflink/types` — never redeclare in app code.
4. **Auth tokens** are managed only by `tokenManager.ts` and `useAuthStore` — no manual SecureStore calls elsewhere.
5. **API responses** are always `{ success: true, data }` — always destructure `data` in hooks.
6. **Role guards** on every protected backend route — `@Roles()` and `@UseGuards(JwtAuthGuard, RolesGuard)`.
7. **Database financial operations** must use stored functions/procedures — never raw UPDATE on wallet balance.
8. **Contract FSM** transitions enforced by DB trigger — do NOT update contract status directly via ORM; call the appropriate service function.

---

## Code Patterns to Reuse

### Standard Hook Pattern
```typescript
// features/listings/hooks.ts
export function useListings(query?: ListingQuery) {
  const [data, setData] = useState<ListingSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    listingsService.getAll(query)
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [JSON.stringify(query)]);

  return { data, loading, error };
}
```

### Standard Screen Pattern
```typescript
// screens/customer/ExampleScreen.tsx
export function ExampleScreen() {
  const { data, loading, error } = useExample();
  return (
    <ScreenWrapper>
      <Header title="Example" />
      <ScrollContainer>
        {loading && <Spinner />}
        {error && <AlertBanner message={error} />}
        {data.map(item => <Card key={item.id} {...item} />)}
      </ScrollContainer>
    </ScreenWrapper>
  );
}
```

### Standard Backend Controller Pattern
```typescript
@Controller('resource')
@UseGuards(JwtAuthGuard)
export class ResourceController {
  constructor(private readonly resourceService: ResourceService) {}

  @Get()
  async getAll(@CurrentUser() user: UserPayload, @Query() query: PaginationDto) {
    return this.resourceService.getAll(user.sub, query);
  }
}
```

### Standard Zustand Store Pattern
```typescript
interface ExampleState {
  items: Item[];
  setItems: (items: Item[]) => void;
  clear: () => void;
}

export const useExampleStore = create<ExampleState>()((set) => ({
  items: [],
  setItems: (items) => set({ items }),
  clear: () => set({ items: [] }),
}));
```
