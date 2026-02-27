# Deep WebApp Audit Report: webapp/channels/src

## **Executive Summary**
The Mattermost WebApp exhibits significant performance bottlenecks primarily related to **React re-rendering cycles** and **legacy component patterns**. The "chat lag" experienced by users is largely a result of O(N) re-renders in the post list where N is the number of visible posts, triggered by non-memoized global state changes.

---

## **1. Module Analysis: Core Orchestration**
**Health: Warning**

| File | Observation | Impact |
| :--- | :--- | :--- |
| `src/entry.tsx` | React 18 automatic batching is explicitly disabled. | Prevents significant optimization of state updates. |
| `src/module_registry.ts` | Global module storage lacks unregistration/cleanup. | Potential memory leak with dynamic plugins. |
| `src/root.tsx` | Brittle manual string manipulation for public pathing. | Potential for routing breakage if static paths change. |

---

## **2. Module Analysis: Components (Post & Sidebar)**
**Health: Refactor Needed (High Priority)**

| File | Observation | Impact |
| :--- | :--- | :--- |
| `post_component.tsx` | **No React.memo usage.** 970+ line "God Component". | Massive re-render overhead on every state change. |
| `post_component.tsx` | Direct DOM manipulation for jump-highlights. | Bypasses React reconciliation; brittle UI state. |
| `sidebar_list.tsx` | Manual height injection via `document.querySelectorAll`. | Layout thrashing and potential "Ghost" layout issues. |
| `sidebar.tsx` | Continued reliance on Legacy Class Components. | High technical debt; difficult to optimize with modern Hooks. |

---

## **3. Module Analysis: Actions & Selectors**
**Health: Refactor Needed**

| File | Observation | Impact |
| :--- | :--- | :--- |
| `selectors/posts.ts` | Multi-select and Edit-mode selectors are not memoized. | Every checkbox click re-renders the entire thread. |
| `actions/post_actions.ts` | Post creation dispatches multiple unbatched actions. | Multiple React commit phases per user action. |
| `actions/post_actions.ts` | $O(N \log N)$ sorting for search results in thunks. | Performance degradation as search results grow. |

---

## **4. Module Analysis: Hooks & Reducers**
**Health: OK**

| File | Observation | Impact |
| :--- | :--- | :--- |
| `useBurnOnReadTimer.ts` | Global synchronized ticker implementation. | **Positive:** Excellent O(1) performance for multiple timers. |
| `reducers/views/posts.ts`| `menuActions` state never purges old post IDs. | Memory growth over long sessions. |

---

## **Critical Bottlenecks & Recommendations**

1.  **Re-render Explosion:** The lack of memoization on the `PostComponent` is the #1 cause of UI lag.
    *   *Action:* Wrap `PostComponent` in `React.memo` and memoize `getMultiSelectedPostIds`.
2.  **State Update Consolidation:**
    *   *Action:* Use `redux-batched-actions` in `post_actions.ts` to reduce commit frequency.
3.  **Legacy Debt:**
    *   *Action:* Prioritize refactoring the Sidebar and SidebarRight to Functional Components to eliminate manual DOM/setTimeout hacks.
4.  **Memory Management:**
    *   *Action:* Implement unregistration logic in `module_registry.ts` and cleanup logic for attachment menu reducers.
