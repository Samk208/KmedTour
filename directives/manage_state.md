# Directive: Manage State

## Goal
Decide the correct location for state logic to ensure consistency and performance.

## Rules

### 1. is it Data from "the Server"? (Even if mocked)
*   **Yes** → Use **TanStack React Query**.
*   **Why**: It handles caching, loading states, deduplication, and refetching automatically.
*   **Location**: `lib/api/hooks/`.
*   **Example**: User profile, list of clinics, list of treatments.

### 2. Is it Global UI State?
*   **Yes** → Use **Zustand**.
*   **Why**: It's lightweight and accessible anywhere in the component tree without prop drilling.
*   **Location**: `lib/stores/`.
*   **Example**: Sidebar open/close, Dark mode toggle, Current auth user session data (derived).

### 3. Is it Local Form/Component State?
*   **Yes** → Use `useState` or `react-hook-form`.
*   **Why**: Keep state collocated with where it's used.
*   **Location**: Inside the component file.
*   **Example**: Input field value, simplistic toggle, form validation steps.

## Decision Tree
1. Does it need to persist across pages?
   * *No* → Local State.
2. Is it async data fetching?
   * *Yes* → React Query.
3. Is it synchronous global app setting?
   * *Yes* → Zustand.
