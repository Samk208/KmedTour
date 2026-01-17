# Directive: Implement New Feature

## Goal
Implement a new feature in the KmedTour web application while adhering to the Stub-First approach and Project Tech Stack.

## Inputs
- Feature Request / PRD Requirement
- UI/UX Design (if available) or "Premium/Clean" aesthetic guidelines

## Steps

1.  **Requirement Checks**
    *   [ ] Does this match the PRD?
    *   [ ] Does this match the `GEMINI.md` architectural rules?

2.  **Schema Definition (Layer 1)**
    *   Create or update a Zod schema in `lib/schemas/`.
    *   *Example*: `lib/schemas/my-feature.ts`
    *   **Rule**: Use `z.object()` and strict types.

3.  **Data Mocking (Layer 2)**
    *   Create a "Stub Hook" in `lib/api/hooks/`.
    *   *Example*: `use-submit-form.ts`
    *   **Rule**: Return a React Query `useMutation` or `useQuery` object.
    *   **Rule**: `console.log` the action instead of calling a real API.
    *   **Rule**: Use `setTimeout` to simulate network delay (e.g., 1000ms).

4.  **UI Implementation (Layer 3)**
    *   Create components in `components/[feature-name]/`.
    *   Use `scaffold_component.js` if available.
    *   **Style**: TailwindCSS + Radix UI (Shadcn).
    *   **Forms**: `react-hook-form` + `zodResolver`.
    *   **Text**: Wrap ALL user strings in `t('key')` (i18next).

5.  **Integration**
    *   Add the page to `app/`.
    *   Connect the UI component to the Stub Hook.

## Output
- A working frontend feature that validates input, shows loading states, and "succeeds" without a real backend.
