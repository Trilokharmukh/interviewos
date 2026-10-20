import type { Lesson } from "./types";
// Lessons are plain typed content: UI and persistence never depend on their order.
function lesson(
  id: string,
  title: string,
  category: string,
  minutes: number,
  summary: string,
  analogy: string,
  sections: Lesson["sections"],
  code: string,
  walkthrough: string[],
  flow: string[],
  question: string,
  answer: string,
  quiz: Lesson["quiz"],
): Lesson {
  return {
    id,
    title,
    category,
    minutes,
    summary,
    analogy,
    level: "Core",
    sections,
    code,
    walkthrough,
    flow,
    takeaways: sections.map(
      (s) => s.body.split(". ")[0] + (s.body.includes(". ") ? "." : ""),
    ),
    interview: { question, answer },
    quiz,
  };
}
export const additionalLessons: Lesson[] = [
  lesson(
    "promises",
    "Promises & Concurrent Async Work",
    "JavaScript",
    40,
    "Understand promise states, chaining, error propagation, and when to use all or allSettled.",
    "A promise is a claim ticket for a future result. Collecting several tickets does not force you to wait for each one before starting the next job.",
    [
      {
        heading: "States and chaining",
        body: "A promise begins pending and settles once as fulfilled or rejected. then returns a new promise; returning a value fulfills that next promise, while throwing rejects it. Return asynchronous work from the handler so the chain waits for it.",
      },
      {
        heading: "Choose a concurrency combinator",
        body: "Promise.all preserves input order and rejects when any input rejects. It does not cancel the other operations. allSettled waits for every outcome; any resolves on the first fulfillment; race settles on the first settlement.",
      },
      {
        heading: "Control failure and concurrency",
        body: "Use try/catch around awaited work. Starting thousands of requests at once can overload an API; use a bounded worker pool. Promise concurrency overlaps waiting, but does not turn synchronous CPU work into parallel JavaScript execution.",
      },
    ],
    `const fetchName = async (id) => {
  const response = await fetch('/api/users/' + id);
  if (!response.ok) throw new Error('User request failed');
  return response.json();
};
try {
  const [first, second] = await Promise.all([
    fetchName(1), fetchName(2)
  ]);
  console.log(first, second);
} catch (error) {
  console.error(error);
}`,
    [
      "Both fetchName calls start before Promise.all is awaited.",
      "If request 2 finishes first, its result still stays in position 2.",
      "Both must fulfill for the await to return the result array.",
      "One rejection transfers control to catch; the other fetch keeps running.",
    ],
    [
      "Start independent requests",
      "Collect promises",
      "Await all outcomes",
      "Fulfill array or reject",
      "Handle the result",
    ],
    "Does Promise.all cancel other promises after one rejects?",
    "No. It rejects its own result early, but the underlying work continues. Use an AbortController for fetch cancellation when that is appropriate.",
    {
      question: "Which combinator keeps every success and failure?",
      options: ["all", "allSettled", "race", "any"],
      correct: 1,
      explanation:
        "allSettled fulfills with one status object for each input, in input order.",
    },
  ),
  lesson(
    "debounce-throttle",
    "Debouncing, Throttling & Cleanup",
    "JavaScript",
    35,
    "Limit frequent event handlers without losing the final user intent.",
    "Debouncing waits for the room to become quiet. Throttling allows one speaker at regular intervals.",
    [
      {
        heading: "Debounce after inactivity",
        body: "Reset a timeout on each call. Run the operation after calls stop for the delay. Search suggestions often benefit because intermediate keystrokes do not need requests.",
      },
      {
        heading: "Throttle repeated work",
        body: "Allow execution at most once per interval. Scroll position analytics can use throttling; animation updates are often better coordinated with requestAnimationFrame. Specify leading and trailing behavior in an interview.",
      },
      {
        heading: "Avoid stale requests",
        body: "Debouncing does not cancel a request that has already started. Abort obsolete fetches or check a request sequence before applying a response. Cancel pending timers on unmount to avoid unnecessary work.",
      },
    ],
    `function debounce(fn, delay) {
  let timer;
  function debounced(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  }
  debounced.cancel = () => clearTimeout(timer);
  return debounced;
}
const search = debounce((value) => console.log(value), 300);
search('r');
search('re');
search('react'); // Only react is logged, after inactivity`,
    [
      "The first call schedules a timer.",
      "The next call cancels the earlier timer and creates another.",
      "The final timer closes over the last arguments and receiver.",
      "If no call occurs for 300 ms, react is printed once.",
    ],
    [
      "Input event",
      "Cancel prior timer",
      "Schedule latest call",
      "Wait for quiet period",
      "Run latest operation",
    ],
    "Why can a debounced search still show an old result?",
    "An earlier request may already be in flight and finish after a newer request. Debounce controls when requests start; cancellation or a response sequence check controls which result can update the UI.",
    {
      question: "Which behavior describes a trailing debounce?",
      options: [
        "Run every call",
        "Run after a quiet interval",
        "Run only on first page load",
        "Make requests synchronous",
      ],
      correct: 1,
      explanation:
        "A trailing debounce postpones execution until no call has occurred for the delay.",
    },
  ),
  lesson(
    "js-values",
    "JavaScript Values, Equality & References",
    "JavaScript",
    30,
    "Predict coercion, shallow copying, reference equality, and mutation.",
    "A primitive assignment copies a value. An object assignment copies a reference to the same shared whiteboard.",
    [
      {
        heading: "Primitives and objects",
        body: "Strings, numbers, booleans, undefined, null, bigint, and symbols are primitive values. Objects are compared by identity. Two separately created object literals are different even when their fields match.",
      },
      {
        heading: "Equality rules",
        body: "Strict equality avoids type coercion, but NaN is not strictly equal to itself. Object.is treats NaN as equal to itself and distinguishes positive and negative zero. Loose equality applies coercion rules and should be used deliberately.",
      },
      {
        heading: "Shallow copy",
        body: "Object spread copies own enumerable properties into a new outer object. Nested objects remain shared. Use structuredClone for supported structured data when a deep copy is needed; it cannot clone functions.",
      },
    ],
    `const original = { profile: { score: 1 } };
const shallow = { ...original };
shallow.profile.score = 2;
console.log(original.profile.score); // 2
console.log(shallow === original); // false
console.log(shallow.profile === original.profile); // true
console.log(NaN === NaN); // false
console.log(Object.is(NaN, NaN)); // true`,
    [
      "Spread creates a new outer object.",
      "Both profile properties still refer to the same nested object.",
      "Changing score through shallow affects original.profile.",
      "Object.is handles NaN differently from strict equality.",
    ],
    [
      "Read assignment",
      "Identify primitive or object",
      "Copy value or reference",
      "Check nested sharing",
      "Predict mutation",
    ],
    "Does const make an object immutable?",
    "No. const prevents rebinding the variable. Its object can still be mutated. Object.freeze freezes an object’s own properties shallowly; deep immutability requires controlling nested objects too.",
    {
      question: "What does object spread do with a nested object?",
      options: [
        "Deep clones it",
        "Keeps its reference",
        "Freezes it",
        "Converts it to JSON",
      ],
      correct: 1,
      explanation: "Spread is shallow, so nested object references are shared.",
    },
  ),
  lesson(
    "react-effects",
    "Effects, Dependencies & Race Conditions",
    "React",
    45,
    "Synchronize React with external systems and clean up obsolete work.",
    "An effect is a subscription contract: connect for the current inputs, then disconnect before replacing that connection.",
    [
      {
        heading: "When an effect is needed",
        body: "Use an effect to synchronize with a browser API, subscription, or external system after a commit. Derive display values during rendering and handle user actions in event handlers when possible. Avoid effects that merely copy one state variable into another.",
      },
      {
        heading: "Dependencies and cleanup",
        body: "Include reactive values used by the effect in its dependency list. React cleans up the old effect before running the next one and on unmount. Strict Mode runs an extra setup and cleanup cycle in development to expose missing cleanup.",
      },
      {
        heading: "Fetch races",
        body: "A request for an earlier input can finish later. Abort the old fetch and ignore obsolete responses. Check response.ok because fetch does not reject merely because the server returned an HTTP error status.",
      },
    ],
    `useEffect(() => {
  const controller = new AbortController();
  let active = true;
  async function load() {
    try {
      const response = await fetch('/api/search?q=' + encodeURIComponent(query),
        { signal: controller.signal });
      if (!response.ok) throw new Error('Search failed');
      const result = await response.json();
      if (active) setResults(result);
    } catch (error) {
      if (active) setError(String(error));
    }
  }
  load();
  return () => { active = false; controller.abort(); };
}, [query]);`,
    [
      "Render with query A and commit; start request A.",
      "Query becomes B; cleanup aborts A and marks its result inactive.",
      "Start request B.",
      "Only B can apply its response while active.",
    ],
    [
      "Commit render",
      "Run effect",
      "Dependency changes",
      "Clean up old work",
      "Run new effect",
    ],
    "Why is an empty dependency array not a general fix for an effect loop?",
    "It can capture stale values and hide the real data dependency. First decide whether the effect is needed, then remove unnecessary state updates or unstable object dependencies while keeping the reactive values it reads.",
    {
      question: "When does an effect cleanup run?",
      options: [
        "Only after a crash",
        "Before the next setup and on unmount",
        "Before every JSX expression",
        "Only on page refresh",
      ],
      correct: 1,
      explanation:
        "React uses cleanup to undo the previous synchronization before replacement or removal.",
    },
  ),
  lesson(
    "react-forms",
    "Forms, Validation & Accessible Errors",
    "React",
    40,
    "Build predictable forms with validation, pending states, and useful failure handling.",
    "A form is a conversation: explain what is expected, show what needs correction, and clearly acknowledge the result.",
    [
      {
        heading: "Controlled and uncontrolled fields",
        body: "A controlled input receives value and onChange from React. An uncontrolled input keeps its current value in the DOM and can be read with FormData. Choose based on the interactions required instead of controlling every field automatically.",
      },
      {
        heading: "Validation boundaries",
        body: "Client validation gives quick feedback; server validation protects the system. Validate types, lengths, business rules, and authorization on the server. Use explicit labels and connect error text with aria-describedby.",
      },
      {
        heading: "Submission lifecycle",
        body: "Track pending state and prevent accidental duplicate submissions. Keep entered values when submission fails. Do not display success until the server confirms the write; retryable operations may need an idempotency key.",
      },
    ],
    `function ProfileForm() {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  async function submit(event) {
    event.preventDefault();
    setPending(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'POST', body: new FormData(event.currentTarget)
      });
      if (!response.ok) throw new Error('Could not save. Please retry.');
      setMessage('Profile saved');
    } catch (error) { setMessage(error.message); }
    finally { setPending(false); }
  }
  return <form onSubmit={submit}>
    <label htmlFor="name">Name</label>
    <input id="name" name="name" required maxLength={80} />
    <button disabled={pending}>{pending ? 'Saving…' : 'Save'}</button>
    <p role="status">{message}</p>
  </form>;
}`,
    [
      "Browser checks the required field before submit.",
      "Read values from the submitted form.",
      "Show pending state while the request runs.",
      "Confirm success or retain the form and show an error.",
    ],
    [
      "User enters data",
      "Client checks format",
      "Submit to server",
      "Validate and authorize",
      "Save and report result",
    ],
    "Is browser validation enough for an API?",
    "No. Anyone can call the API without using your form. The server must validate input and independently authorize the operation.",
    {
      question: "Where must authorization be enforced?",
      options: [
        "Only the button",
        "Only CSS",
        "On the server",
        "Only localStorage",
      ],
      correct: 2,
      explanation:
        "UI visibility cannot prevent someone from directly calling a protected endpoint.",
    },
  ),
  lesson(
    "react-performance",
    "React Performance & Memoization",
    "React",
    40,
    "Measure renders and apply memoization only where it reduces real work.",
    "Memoization is a small results shelf: reuse something you already computed if the inputs have not changed.",
    [
      {
        heading: "Measure first",
        body: "Use React Profiler and browser performance tools to find expensive commits or long tasks. A render is not automatically a DOM update. Keep state near the components that need it and virtualize genuinely large lists.",
      },
      {
        heading: "What each tool caches",
        body: "memo can skip a component render when props compare equal. useMemo caches a calculation result; useCallback caches a function identity. They are performance tools, not guarantees that code will run only once.",
      },
      {
        heading: "Reference stability",
        body: "A newly created object or callback fails a reference comparison even when its contents look the same. Stabilize a prop only when a measured memoized boundary benefits. Include all reactive dependencies to avoid stale closures.",
      },
    ],
    `const ResultList = memo(function ResultList({ items }) {
  return <ul>{items.map(item => <li key={item.id}>{item.name}</li>)}</ul>;
});
function SearchResults({ items, query }) {
  const visible = useMemo(() => items.filter(item =>
    item.name.toLowerCase().includes(query.toLowerCase())), [items, query]);
  return <ResultList items={visible} />;
}`,
    [
      "Initial render calculates visible and renders the list.",
      "If items and query stay equal, the calculation can be reused.",
      "The stable visible array can let memo skip rendering ResultList.",
      "If items changes identity every time, the calculation runs again.",
    ],
    [
      "Observe slow interaction",
      "Profile the work",
      "Find costly boundary",
      "Reduce or memoize work",
      "Measure again",
    ],
    "Should every function be wrapped in useCallback?",
    "No. It adds dependency bookkeeping and may not prevent any work. It helps when a stable function identity matters, such as a measured memoized child boundary or subscription dependency.",
    {
      question: "What does useCallback cache?",
      options: [
        "A network response",
        "A function identity",
        "The DOM tree",
        "Every state update",
      ],
      correct: 1,
      explanation:
        "It returns the previous function reference while its dependencies compare equal.",
    },
  ),
  lesson(
    "react-keys",
    "Reconciliation, Keys & State Identity",
    "React",
    30,
    "Understand why list keys determine which component state is preserved.",
    "A key is a stable name tag. If name tags move with people, React can keep each person’s belongings attached to them.",
    [
      {
        heading: "Identity across renders",
        body: "React associates state with component type and position in the rendered tree. Keys distinguish siblings at the same level. Changing a key intentionally creates a new identity and resets that subtree’s state.",
      },
      {
        heading: "Choose stable keys",
        body: "Use stable IDs from the data. An array index can be acceptable for a fixed list, but sorting, inserting, or deleting rows can attach local state to the wrong item. Random keys remount children on every render.",
      },
      {
        heading: "Rendering is not committing",
        body: "React calculates a next tree during rendering, then applies necessary changes during commit. Keep rendering pure because React can restart or discard render work.",
      },
    ],
    `// Each input belongs to its item even when the list is reordered.
items.map(item => <EditableRow key={item.id} item={item} />);

// Explicitly reset the editor when the selected account changes.
<ProfileEditor key={account.id} account={account} />;`,
    [
      "Rows A and B mount with keys A and B.",
      "User edits the local state inside A.",
      "Sort changes the visible order to B then A.",
      "React matches A by key and preserves A’s input state.",
    ],
    [
      "Produce next elements",
      "Match types and keys",
      "Preserve matching state",
      "Mount new identities",
      "Commit required changes",
    ],
    "Why can index keys cause bugs after inserting a row?",
    "The indices now describe different items. React can reuse a component’s state for the new item at that index, so text inputs or expanded state may appear on the wrong row.",
    {
      question: "What happens when a component’s key changes?",
      options: [
        "Its state is always copied",
        "It is treated as a new identity",
        "It becomes a Server Component",
        "Only its color changes",
      ],
      correct: 1,
      explanation:
        "A changed key causes the old subtree to unmount and a new one to mount.",
    },
  ),
  lesson(
    "nextjs-caching",
    "Next.js Caching & Revalidation",
    "Next.js",
    50,
    "Make caching decisions explicit and keep personalized data out of shared caches.",
    "Caching is a reusable prepared meal. You need to know who it is for and when it must be replaced.",
    [
      {
        heading: "Different caches answer different questions",
        body: "Request memoization can deduplicate work during a render. Data caching stores reusable results; route caching stores rendered output; the client router can reuse navigated segments. Exact defaults depend on the installed Next.js version and configuration.",
      },
      {
        heading: "Declare freshness requirements",
        body: "Use explicit cache or revalidation options instead of assuming all fetches are cached. Shared catalog data can often tolerate bounded staleness. Account-specific data requires authenticated reads and careful cache boundaries.",
      },
      {
        heading: "Invalidate after mutations",
        body: "After a successful change, invalidate the relevant path or tag using the API supported by your installed version. Cache keys and tags must match the data’s scope. Test actual behavior in a production build because development caching differs.",
      },
    ],
    `// A public data source with an explicit freshness policy.
async function getCatalog() {
  const response = await fetch('https://example.com/api/catalog', {
    next: { revalidate: 300, tags: ['catalog'] }
  });
  if (!response.ok) throw new Error('Catalog unavailable');
  return response.json();
}
// A personalized fetch must not enter a shared data cache.
fetch('https://example.com/api/me', {
  cache: 'no-store', headers: { Authorization: 'Bearer ' + token }
});`,
    [
      "The catalog read declares a five-minute revalidation policy.",
      "Subsequent eligible requests may reuse its cached data.",
      "A user profile uses no-store and is authorized for that user.",
      "A product update must invalidate the appropriate catalog cache.",
    ],
    [
      "Identify data owner",
      "Choose freshness policy",
      "Read or reuse data",
      "Mutate source",
      "Invalidate affected cache",
    ],
    "Why is a cache bug sometimes a security bug?",
    "If personalized output is stored under a shared key, another user may receive it. Authenticate reads and writes, define scope-aware keys, and avoid caching private data in a public cache.",
    {
      question: "What should decide whether data is cached?",
      options: [
        "A blanket rule for all pages",
        "Freshness and ownership requirements",
        "The variable name",
        "Whether the response is JSON",
      ],
      correct: 1,
      explanation:
        "Caching policy follows the data’s freshness tolerance and privacy scope.",
    },
  ),
  lesson(
    "nextjs-routing",
    "App Router, Layouts & Error Boundaries",
    "Next.js",
    40,
    "Design nested routes with useful loading, error, and missing-page states.",
    "A layout is a shared building frame. Each room is a route segment, with its own loading sign and error recovery.",
    [
      {
        heading: "Route structure",
        body: "A page file exposes a route. Layouts wrap descendants and can preserve shared navigation during client transitions. Route groups organize files without adding a URL segment. Dynamic segments represent values such as a lesson slug.",
      },
      {
        heading: "Loading and error states",
        body: "loading.tsx supplies a Suspense fallback for a route segment. error.tsx is a client error boundary for rendering failures in its scope and can offer recovery. not-found.tsx handles missing resources triggered with notFound().",
      },
      {
        heading: "Parallel and intercepted routes",
        body: "Parallel route slots support independently rendered regions. Intercepting routes can show a destination as a modal during client navigation while a direct visit renders its full page. Define default slots and test refresh and back behavior.",
      },
    ],
    `// app/lessons/[slug]/page.tsx
import { notFound } from 'next/navigation';
export default async function LessonPage({ params }) {
  const { slug } = await params;
  const lesson = await getLesson(slug);
  if (!lesson) notFound();
  return <article><h1>{lesson.title}</h1></article>;
}
// app/lessons/loading.tsx
export default function Loading() {
  return <p role="status">Loading lesson…</p>;
}`,
    [
      "The URL selects a dynamic slug.",
      "Await params and load the lesson on the server.",
      "A pending segment can show the nearest loading fallback.",
      "A missing lesson goes to the relevant not-found UI.",
    ],
    [
      "Navigate to URL",
      "Match route segments",
      "Resolve data",
      "Render page or boundary",
      "Commit navigation",
    ],
    "What must be tested for a modal built with intercepted routes?",
    "Test client navigation, direct URL entry, refresh, close, browser back and forward, and missing slot fallbacks. The same URL can have different presentation based on navigation context.",
    {
      question: "Do route groups add a URL segment?",
      options: ["Always", "No", "Only in production", "Only with a layout"],
      correct: 1,
      explanation:
        "Folders in parentheses organize routes without changing their URL path.",
    },
  ),
  lesson(
    "nextjs-server-actions",
    "Server Actions, Authorization & Mutations",
    "Next.js",
    45,
    "Treat every mutation as an externally reachable operation that needs validation and authorization.",
    "A server action is a service counter. Hiding its button does not establish who is allowed to use the service.",
    [
      {
        heading: "Server execution boundary",
        body: "A server action executes server-side and can be called from a form or client interaction. Its arguments remain untrusted. Never accept a user ID or role from the client as proof of authority.",
      },
      {
        heading: "Validate and authorize",
        body: "Read the authenticated session on the server, validate input, and check ownership close to the database query. Use parameterized SQL. Return expected validation errors without exposing internal stack traces or credentials.",
      },
      {
        heading: "Consistent mutations",
        body: "Use transactions for changes that must succeed together. Handle duplicate submissions with idempotency when appropriate. Revalidate affected UI after the database confirms success and preserve input on failure.",
      },
    ],
    `'use server';
import { z } from 'zod';
const schema = z.object({ title: z.string().trim().min(1).max(100) });
export async function renameNote(noteId, input) {
  const session = await requireSession();
  const data = schema.parse(input);
  // Both note identity and ownership constrain the update.
  const result = await db.query(
    'UPDATE notes SET title=$1 WHERE id=$2 AND user_id=$3 RETURNING id',
    [data.title, noteId, session.user.id]
  );
  if (!result.rowCount) return { error: 'Note unavailable' };
  return { success: true };
}`,
    [
      "The client sends an ID and new title.",
      "The server verifies a session independently.",
      "Schema validation bounds the title.",
      "SQL updates only a row owned by that session user.",
    ],
    [
      "Receive input",
      "Authenticate session",
      "Validate and authorize",
      "Commit mutation",
      "Refresh affected UI",
    ],
    "Why is checking the session only in the page insufficient?",
    "The mutation may be called without first rendering the page. The action or route must authenticate and authorize its own operation.",
    {
      question: "Which user ID should constrain a personal data update?",
      options: [
        "The ID sent by the form",
        "The ID from a verified session",
        "The first ID in the database",
        "A localStorage value",
      ],
      correct: 1,
      explanation:
        "Only the server-verified session establishes the caller’s identity.",
    },
  ),
  lesson(
    "nextjs-seo",
    "Metadata, SEO & Web Vitals",
    "Next.js",
    35,
    "Deliver discoverable content while measuring loading, responsiveness, and layout stability.",
    "SEO makes a page understandable to crawlers; performance makes the same page useful to people.",
    [
      {
        heading: "Metadata and content",
        body: "Use descriptive titles, canonical URLs, and accurate descriptions. Render important public content in HTML that can be discovered. Generate metadata from trusted page data and handle missing resources with the correct status.",
      },
      {
        heading: "Core Web Vitals",
        body: "LCP measures loading of the largest visible content element. INP reflects responsiveness across interactions. CLS measures unexpected layout shifts. Use real-user field data as well as reproducible lab tests.",
      },
      {
        heading: "Prioritize the critical path",
        body: "Give images explicit dimensions to reserve space, size them appropriately, and avoid lazy-loading the likely LCP image. Reduce main-thread JavaScript and third-party work. Stream lower-priority regions without hiding essential content.",
      },
    ],
    `// app/articles/[slug]/page.tsx
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  return {
    title: article.title,
    description: article.summary,
    alternates: { canonical: 'https://example.com/articles/' + slug }
  };
}
// Reserve space to prevent the image from moving later content.
<img src="/cover.webp" alt="System architecture" width="960" height="540" />`,
    [
      "Resolve the article by slug.",
      "Emit a specific title, description, and canonical URL.",
      "Reserve the cover image’s aspect ratio before it arrives.",
      "Compare field metrics before and after performance changes.",
    ],
    [
      "Request page",
      "Deliver useful HTML",
      "Load critical content",
      "Respond to input",
      "Measure field outcomes",
    ],
    "Can a page have a good Lighthouse score and still feel slow?",
    "Yes. A lab run covers a specific device and network at one moment. Real users may have slower devices, third-party delays, or expensive later interactions; inspect field metrics and interaction traces.",
    {
      question: "Which metric tracks unexpected layout movement?",
      options: ["LCP", "INP", "CLS", "TTFB only"],
      correct: 2,
      explanation:
        "CLS measures layout shifts that occur unexpectedly during the page experience.",
    },
  ),
  lesson(
    "dsa-hashing",
    "Hash Maps & Frequency Counting",
    "DSA",
    40,
    "Replace repeated searches with indexed lookups and explain the time-space trade-off.",
    "A hash map is a labeled set of drawers. Store where each value was seen so you can find it without checking every earlier item.",
    [
      {
        heading: "Recognize lookup patterns",
        body: "Use a map when a problem repeatedly asks whether a value exists, where it was seen, or how many times it occurs. Hashing often trades linear extra space for faster lookup.",
      },
      {
        heading: "Two Sum",
        body: "For each value x, check whether target minus x already exists. Look up before inserting the current value so the same element is never used twice. A duplicate value is valid if it appears at another index.",
      },
      {
        heading: "Complexity",
        body: "Typical hash maps give average constant-time operations, making this algorithm expected O(n) time and O(n) extra space. Implementation details and collisions can affect worst-case behavior.",
      },
    ],
    `function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (seen.has(complement)) return [seen.get(complement), i];
    seen.set(nums[i], i);
  }
  return null;
}
console.log(twoSum([2, 7, 11, 15], 9)); // [0, 1]`,
    [
      "i=0: value 2 needs 7; map is empty, so store 2 → 0.",
      "i=1: value 7 needs 2; map has 2 at index 0.",
      "Return [0,1].",
      "The same approach handles [3,3] with target 6.",
    ],
    [
      "Read current value",
      "Compute complement",
      "Look up earlier index",
      "Return pair if found",
      "Otherwise store current index",
    ],
    "Why must lookup happen before insertion?",
    "Inserting first could match the current element with itself when target is twice its value. Looking up only earlier elements guarantees two distinct indices.",
    {
      question: "What is the expected time complexity of map-based Two Sum?",
      options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
      correct: 2,
      explanation:
        "Each element is visited once with expected constant-time map operations.",
    },
  ),
  lesson(
    "dsa-binary-search",
    "Binary Search & Boundary Invariants",
    "DSA",
    45,
    "Find values and boundaries in sorted or monotonic search spaces.",
    "Binary search opens the middle drawer and eliminates half the remaining drawers based on what it finds.",
    [
      {
        heading: "The invariant",
        body: "For a standard exact search with inclusive endpoints, any possible answer remains within low through high. Compare the middle value and discard the half that cannot contain the answer. Terminate when low exceeds high.",
      },
      {
        heading: "Boundaries and monotonic predicates",
        body: "Binary search also finds the first true value in a false-then-true predicate. This is useful for lower bounds and minimum feasible capacity problems. State whether endpoints are inclusive or half-open before coding.",
      },
      {
        heading: "Complexity and edge cases",
        body: "Each iteration halves the search space, giving O(log n) comparisons and O(1) extra space for the iterative form. Test empty input, one item, duplicates, and values outside the range. JavaScript bitwise midpoint tricks can overflow 32-bit ranges.",
      },
    ],
    `function binarySearch(nums, target) {
  let low = 0, high = nums.length - 1;
  while (low <= high) {
    const mid = low + Math.floor((high - low) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) low = mid + 1;
    else high = mid - 1;
  }
  return -1;
}
binarySearch([1, 3, 5, 7, 9], 7); // 3`,
    [
      "low=0, high=4, mid=2; value 5 is below 7.",
      "Set low=3, retaining indices 3 through 4.",
      "mid=3 gives value 7. Return 3.",
      "Every update excludes mid after it has been ruled out.",
    ],
    [
      "Define candidate range",
      "Inspect midpoint",
      "Keep feasible half",
      "Shrink range",
      "Return match or missing",
    ],
    "When can binary search apply without a sorted array?",
    "When candidate answers have a monotonic feasibility predicate, such as capacities where all values below a threshold fail and all at or above it succeed.",
    {
      question: "Why must the bounds move past mid after ruling it out?",
      options: [
        "To preserve duplicates",
        "To guarantee progress",
        "To allocate a new array",
        "To sort the input",
      ],
      correct: 1,
      explanation:
        "Keeping the same midpoint in a one-element interval can cause an infinite loop.",
    },
  ),
  lesson(
    "dsa-sliding-window",
    "Two Pointers & Sliding Windows",
    "DSA",
    50,
    "Use a moving interval to avoid recomputing overlapping work.",
    "A sliding window is a frame over a row of cards. Move the edges and update only the cards that enter or leave.",
    [
      {
        heading: "Two pointers",
        body: "Use two positions when movement can discard impossible candidates, such as searching a sorted array from both ends. Explain why moving one pointer cannot skip a valid answer.",
      },
      {
        heading: "Variable windows",
        body: "For a longest substring without repeated characters, expand right while updating counts. While a repeated character remains, shrink left. Update the best length only after restoring the no-duplicates invariant.",
      },
      {
        heading: "Conditions matter",
        body: "Sliding windows work when the constraint can be updated as boundaries move. A sum-based window that assumes nonnegative values may fail when negatives are allowed. Avoid repeatedly slicing or rescanning the whole window.",
      },
    ],
    `function longestUnique(text) {
  const chars = [...text];
  const counts = new Map();
  let left = 0, best = 0;
  for (let right = 0; right < chars.length; right++) {
    const c = chars[right];
    counts.set(c, (counts.get(c) || 0) + 1);
    while (counts.get(c) > 1) {
      const removed = chars[left++];
      counts.set(removed, counts.get(removed) - 1);
    }
    best = Math.max(best, right - left + 1);
  }
  return best;
}
longestUnique('abba'); // 2`,
    [
      "Read a: window a, best 1.",
      "Read b: window ab, best 2.",
      "Read second b: shrink past a and first b until only b remains.",
      "Read a: window ba, best stays 2. Each pointer moves only forward.",
    ],
    [
      "Expand right edge",
      "Update counts",
      "Check invariant",
      "Shrink left until valid",
      "Record best length",
    ],
    "Why is the nested while loop still linear overall?",
    "Both boundaries only move forward. Each element enters once and leaves at most once, so total pointer movements are O(n), with expected constant-time map updates.",
    {
      question: "When should the best valid length be updated?",
      options: [
        "Before restoring validity",
        "After restoring validity",
        "Only at index zero",
        "Only after sorting",
      ],
      correct: 1,
      explanation:
        "An invalid window may have a larger length but cannot be accepted as an answer.",
    },
  ),
  lesson(
    "dsa-stacks",
    "Stacks, Queues & Balanced Brackets",
    "DSA",
    35,
    "Model last-in-first-out and first-in-first-out processing.",
    "A stack is a pile of plates; a queue is a line at a ticket counter.",
    [
      {
        heading: "Choose by processing order",
        body: "A stack processes the newest unresolved item first. A queue processes the oldest pending item first. Stacks suit nested expressions; queues suit breadth-first exploration and task scheduling.",
      },
      {
        heading: "Bracket matching",
        body: "Push the expected closer for each opening bracket. For a closing bracket, pop and compare. A mismatch or empty stack means invalid input; a nonempty stack at the end means unclosed brackets.",
      },
      {
        heading: "Efficient queues",
        body: "Repeated array.shift can move many elements. For algorithmic queues, keep a head index or use a deque. An array-based stack using push and pop is convenient.",
      },
    ],
    `function validBrackets(text) {
  const stack = [];
  const closer = { '(': ')', '[': ']', '{': '}' };
  for (const c of text) {
    if (closer[c]) stack.push(closer[c]);
    else if (c === ')' || c === ']' || c === '}') {
      if (stack.pop() !== c) return false;
    }
  }
  return stack.length === 0;
}
validBrackets('([])'); // true`,
    [
      "Read (: expect ), stack [)].",
      "Read [: expect ], stack [), ]].",
      "Read ]: pop ] and match.",
      "Read ): pop ) and match. Empty stack means valid.",
    ],
    [
      "Read character",
      "Push expected closer",
      "Pop for closing bracket",
      "Reject mismatch",
      "Require empty stack",
    ],
    "Why is a stack suitable for nested brackets?",
    "The most recently opened bracket must close first. That is exactly last-in-first-out ordering.",
    {
      question: "Which structure naturally processes the oldest item first?",
      options: ["Stack", "Queue", "Call stack", "Set iteration by value"],
      correct: 1,
      explanation: "A queue follows first-in-first-out order.",
    },
  ),
  lesson(
    "dsa-linked-list",
    "Linked Lists & Pointer Reversal",
    "DSA",
    40,
    "Change links safely and reason about pointer ownership.",
    "A linked list is a chain of people, each holding a card naming the next person. Reversal changes the cards, not the people.",
    [
      {
        heading: "Representation",
        body: "Each node contains a value and a link to its next node. Index access requires traversal, unlike array indexing. Insertion after a known node can update a constant number of links.",
      },
      {
        heading: "Reverse iteratively",
        body: "Track previous, current, and next. Save the original next link before overwriting current.next; otherwise the remaining list becomes unreachable. Move both pointers forward until current is null.",
      },
      {
        heading: "Patterns",
        body: "Fast and slow pointers can detect a cycle or find a midpoint. A dummy head simplifies boundary cases for insertion and deletion. Clarify whether mutation is allowed and whether a cycle can exist.",
      },
    ],
    `function reverseList(head) {
  let previous = null;
  let current = head;
  while (current !== null) {
    const next = current.next;
    current.next = previous;
    previous = current;
    current = next;
  }
  return previous;
}`,
    [
      "For 1 → 2 → 3, previous=null and current=1.",
      "Save 2, point 1 to null, then advance to 2.",
      "Save 3, point 2 to 1, then advance to 3.",
      "Point 3 to 2. Current becomes null; return 3 as the new head.",
    ],
    [
      "Save next node",
      "Reverse current link",
      "Advance previous",
      "Advance current",
      "Return new head",
    ],
    "What are the time and space costs of iterative reversal?",
    "O(n) time because every node is processed once, and O(1) additional space because only a fixed number of pointers is used.",
    {
      question: "Why save current.next before overwriting it?",
      options: [
        "To sort the nodes",
        "To retain access to the remaining list",
        "To allocate every node again",
        "To detect all cycles",
      ],
      correct: 1,
      explanation:
        "Overwriting the only next reference can disconnect the unprocessed suffix.",
    },
  ),
  lesson(
    "dsa-trees",
    "Binary Trees, DFS & BFS",
    "DSA",
    45,
    "Traverse hierarchical data and choose recursion or a queue deliberately.",
    "DFS follows one branch down before returning. BFS visits all rooms on one floor before moving to the next.",
    [
      {
        heading: "Depth-first orders",
        body: "Preorder visits node, left, right; inorder visits left, node, right; postorder visits left, right, node. Inorder produces sorted values for a valid binary search tree, but not for every binary tree.",
      },
      {
        heading: "Breadth-first traversal",
        body: "BFS uses a queue to visit nodes by distance from the root. Process the current queue length as one level when collecting level groups. Use a head index rather than repeated shifting.",
      },
      {
        heading: "Complexity",
        body: "Visiting all nodes takes O(n) time. Recursive DFS uses O(h) stack space, where h can be n for a skewed tree. BFS can use O(w) space for the maximum frontier width.",
      },
    ],
    `function levelOrder(root) {
  if (!root) return [];
  const queue = [root], levels = [];
  let head = 0;
  while (head < queue.length) {
    const end = queue.length, level = [];
    while (head < end) {
      const node = queue[head++];
      level.push(node.value);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    levels.push(level);
  }
  return levels;
}`,
    [
      "Start with root 1; queue [1].",
      "Process the first level and append children 2 and 3.",
      "The saved level boundary prevents processing those children too early.",
      "Process [2,3] as the next level. This implementation retains visited queue entries, using O(n) total array space.",
    ],
    [
      "Enqueue root",
      "Capture level boundary",
      "Process current level",
      "Enqueue children",
      "Repeat for next level",
    ],
    "Is the recursion depth always logarithmic in a binary tree?",
    "No. Only a balanced tree has logarithmic height. A skewed tree can have height n, making recursive traversal use O(n) call-stack space.",
    {
      question: "Which traversal visits nodes by level?",
      options: ["Preorder DFS", "Inorder DFS", "BFS", "Postorder DFS"],
      correct: 2,
      explanation: "BFS processes a queue in distance order from the root.",
    },
  ),
  lesson(
    "dsa-graphs",
    "Graphs, Visited Sets & Shortest Paths",
    "DSA",
    50,
    "Traverse networks safely and use BFS for shortest paths in unweighted graphs.",
    "A graph is a metro map. A visited set prevents riding around the same loop forever.",
    [
      {
        heading: "Represent the graph",
        body: "An adjacency list stores each vertex’s neighbors and is efficient for sparse graphs. Decide whether edges are directed or undirected, weighted or unweighted, and whether disconnected vertices exist.",
      },
      {
        heading: "BFS shortest paths",
        body: "In an unweighted graph, BFS discovers vertices in increasing edge distance. Mark vertices visited when enqueuing, not after dequeuing, to prevent duplicate pending entries.",
      },
      {
        heading: "Limits",
        body: "DFS and BFS take O(V+E) time with adjacency lists. BFS does not solve arbitrary weighted shortest paths; nonnegative weights usually call for Dijkstra, while negative weights require different reasoning.",
      },
    ],
    `function shortestDistance(graph, start, goal) {
  const queue = [[start, 0]], visited = new Set([start]);
  let head = 0;
  while (head < queue.length) {
    const [node, distance] = queue[head++];
    if (node === goal) return distance;
    for (const next of graph[node] || []) {
      if (!visited.has(next)) {
        visited.add(next);
        queue.push([next, distance + 1]);
      }
    }
  }
  return -1;
}`,
    [
      "For A connected to B and C, enqueue A at distance 0.",
      "Expand A; mark B and C visited and enqueue at distance 1.",
      "Expand their neighbors at distance 2.",
      "The first time goal is dequeued gives the minimum number of edges.",
    ],
    [
      "Enqueue start",
      "Visit nearest pending vertex",
      "Return if goal",
      "Enqueue unseen neighbors",
      "Stop if frontier empty",
    ],
    "Why mark a node visited before placing it in the queue?",
    "Several parents can discover it before it is dequeued. Marking on enqueue guarantees one pending entry per vertex and preserves the O(V+E) bound.",
    {
      question: "When does ordinary BFS guarantee a shortest path?",
      options: [
        "Any negative-weight graph",
        "An unweighted graph",
        "Only a complete graph",
        "Any weighted graph",
      ],
      correct: 1,
      explanation:
        "BFS minimizes the number of edges, which equals path cost when all edges have equal cost.",
    },
  ),
  lesson(
    "dsa-dp",
    "Dynamic Programming & State Transitions",
    "DSA",
    55,
    "Turn repeated subproblems into a reusable state table.",
    "Dynamic programming keeps a notebook of subproblem answers so you never solve the same homework page twice.",
    [
      {
        heading: "Define a state",
        body: "Write precisely what one stored value means. For climbing stairs with steps of size 1 or 2, ways[i] is the number of valid step sequences that reach stair i. The last move must come from i minus 1 or i minus 2.",
      },
      {
        heading: "Transition and base cases",
        body: "The recurrence is ways[i]=ways[i-1]+ways[i-2]. Define ways[0]=1 for the empty sequence and ways[1]=1. Base cases are part of the problem definition, not arbitrary initialization.",
      },
      {
        heading: "Memoization and tabulation",
        body: "Memoization caches a recursive solution; tabulation fills states in dependency order. If each state only depends on the previous two, retain two numbers rather than the full table. JavaScript Number loses exact integer precision for sufficiently large counts.",
      },
    ],
    `function climbStairs(n) {
  if (!Number.isInteger(n) || n < 0) throw new Error('Invalid n');
  if (n === 0) return 1;
  let previous = 1, current = 1;
  for (let i = 2; i <= n; i++) {
    [previous, current] = [current, previous + current];
  }
  return current;
}
climbStairs(4); // 5`,
    [
      "ways[0]=1 and ways[1]=1.",
      "i=2: 1+1=2 ways.",
      "i=3: 1+2=3 ways.",
      "i=4: 2+3=5 ways. Only the previous two results are retained.",
    ],
    [
      "Define state meaning",
      "Write transition",
      "Set base cases",
      "Choose dependency order",
      "Compute and optimize space",
    ],
    "What signals that dynamic programming may help?",
    "Overlapping subproblems and a solution that can be built from smaller states. First define the state and recurrence; caching an incorrect recurrence only makes a wrong solution faster.",
    {
      question: "What is the extra space of the two-number stairs solution?",
      options: ["O(n²)", "O(n)", "O(log n)", "O(1)"],
      correct: 3,
      explanation: "It stores a fixed number of counters regardless of n.",
    },
  ),
  lesson(
    "system-caching",
    "Caching, CDNs & Invalidation",
    "System Design",
    45,
    "Place caches intentionally and explain staleness, eviction, and failure behavior.",
    "A cache is a nearby copy of something expensive to fetch. Its usefulness depends on whether the copy is still acceptable.",
    [
      {
        heading: "Cache-aside",
        body: "The application checks the cache, loads from the database on a miss, and stores the result with an expiry. It reduces repeated reads but does not automatically keep copies consistent after writes.",
      },
      {
        heading: "Invalidation and stampedes",
        body: "Invalidate or update affected entries after writes, accepting the consistency trade-off explicitly. Expiring many popular entries together can overload the source. Jittered TTLs, request coalescing, and stale-while-revalidate can reduce stampedes.",
      },
      {
        heading: "Ownership and failures",
        body: "Partition keys by tenant or user when data is private. Decide whether a cache outage should fall through to the database or fail closed. A cache is usually an optimization, not the only durable copy.",
      },
    ],
    `async function getPublicProduct(id) {
  const key = 'product:v1:' + id;
  const cached = await cache.get(key);
  if (cached !== null) return cached;
  const product = await db.findProduct(id);
  if (!product) return null;
  await cache.set(key, product, { ttlSeconds: 60 });
  return product;
}
// After a successful product mutation:
await cache.delete('product:v1:' + productId);`,
    [
      "The first request misses the product key.",
      "Load from durable storage and cache for 60 seconds.",
      "The next request reuses the cached value.",
      "A write invalidates the key; discuss races between concurrent reads and writes.",
    ],
    [
      "Check cache",
      "Hit: return copy",
      "Miss: read source",
      "Store with expiry",
      "Invalidate after mutation",
    ],
    "Can delete-after-write alone guarantee strong consistency?",
    "No. A concurrent reader may read an old database value and refill the cache after deletion. Strict guarantees require stronger coordination or versioning; many systems explicitly accept bounded staleness.",
    {
      question: "What is a cache stampede?",
      options: [
        "Many misses concurrently overload the source",
        "A database index",
        "A TLS handshake",
        "A permanent backup",
      ],
      correct: 0,
      explanation:
        "Popular keys missing at once can cause many duplicate origin reads.",
    },
  ),
  lesson(
    "system-databases",
    "PostgreSQL, Indexes & Transactions",
    "System Design",
    50,
    "Choose relational constraints, design useful indexes, and protect concurrent writes.",
    "An index is a book’s lookup guide. A transaction groups changes into one promise: either all commit or none do.",
    [
      {
        heading: "Model relationships and constraints",
        body: "Use primary keys for identity, foreign keys for relationships, and unique constraints for invariants such as one account per normalized email. Enforce rules in the database when concurrent requests could otherwise race.",
      },
      {
        heading: "Index for actual queries",
        body: "A composite index can support equality on its leading columns and ordering or filtering that follows. Indexes consume storage and add write work. Use EXPLAIN ANALYZE carefully to inspect actual execution, recognizing that it executes the statement.",
      },
      {
        heading: "Concurrency and isolation",
        body: "Transactions provide atomicity, but the isolation level controls which concurrent effects are visible. Use row locks, conditional updates, or serializable transactions with retries when the invariant requires them. Optimistic version checks prevent stale overwrites.",
      },
    ],
    `CREATE TABLE lesson_progress (
  user_id TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  confidence TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  version INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (user_id, lesson_id)
);
CREATE INDEX progress_revision_idx
  ON lesson_progress (user_id, updated_at DESC);
-- Parameters are supplied separately by the database driver.
UPDATE lesson_progress
SET confidence=$1, version=version+1
WHERE user_id=$2 AND lesson_id=$3 AND version=$4;`,
    [
      "The primary key prevents duplicate per-user lesson records.",
      "The composite index supports one user’s recent-progress listing.",
      "A client submits the version it last read.",
      "Zero updated rows means the record changed; reload or resolve the conflict.",
    ],
    [
      "Define invariant",
      "Create constraints",
      "Inspect query pattern",
      "Add targeted index",
      "Handle concurrent updates",
    ],
    "Why does checking availability before inserting not guarantee uniqueness?",
    "Two requests can both observe that a value is free before either inserts it. A database unique constraint arbitrates the concurrent writes atomically.",
    {
      question: "What does an optimistic version check detect?",
      options: [
        "A stale concurrent write",
        "Every missing index",
        "All network failures",
        "Invalid CSS",
      ],
      correct: 0,
      explanation:
        "The update succeeds only if the stored version still matches what the client read.",
    },
  ),
  lesson(
    "system-scaling",
    "Load Balancing, Scaling & Stateless Services",
    "System Design",
    45,
    "Scale request handling while identifying the shared bottlenecks.",
    "A load balancer is a receptionist directing visitors to available counters. More counters help only if the back office can keep up.",
    [
      {
        heading: "Horizontal and vertical scaling",
        body: "Vertical scaling adds resources to one machine. Horizontal scaling adds instances and requires distributing traffic. Keep request handlers stateless or store shared session state in a suitable external store.",
      },
      {
        heading: "Routing and health",
        body: "A load balancer routes using strategies such as round-robin or least connections. Health checks and readiness checks should reflect whether an instance can serve requests. Graceful shutdown drains in-flight work before removing an instance.",
      },
      {
        heading: "Find the real limit",
        body: "Adding application instances can multiply database connections and overwhelm storage. Bound connection pools, use backpressure, monitor queue depth, and set timeouts. Capacity planning uses traffic, latency, throughput, and burst assumptions.",
      },
    ],
    `// Readiness differs from "the process is alive".
app.get('/ready', async (_request, response) => {
  try {
    await database.query('SELECT 1');
    response.status(200).json({ ready: true });
  } catch {
    response.status(503).json({ ready: false });
  }
});
// A user session is checked via a shared store or verified token,
// rather than relying on one instance's in-memory Map.`,
    [
      "The balancer distributes incoming requests to ready instances.",
      "An unhealthy instance stops receiving new work.",
      "A replacement instance accesses shared durable session or account data.",
      "Database capacity can become the next bottleneck as app instances increase.",
    ],
    [
      "Request reaches balancer",
      "Select ready instance",
      "Handle stateless request",
      "Read shared data",
      "Return and measure latency",
    ],
    "Why is sticky routing not a complete session-storage strategy?",
    "The selected instance can fail or be replaced. Sessions stored only in its memory disappear; durable shared state or a carefully designed token strategy is still needed.",
    {
      question: "What can happen when every new instance opens a large pool?",
      options: [
        "Database connections are exhausted",
        "Storage becomes infinite",
        "Requests need no auth",
        "All writes become atomic",
      ],
      correct: 0,
      explanation:
        "Pool limits apply per instance, so total connections can grow with the number of instances.",
    },
  ),
  lesson(
    "system-rate-limits",
    "Rate Limiting, Retries & Idempotency",
    "System Design",
    45,
    "Protect capacity and make retryable operations safe.",
    "A token bucket gives each caller a limited set of tickets that refill over time. An idempotency key labels one intended purchase, even if its receipt request is repeated.",
    [
      {
        heading: "Rate limiting algorithms",
        body: "Fixed windows are simple but allow bursts at window boundaries. Sliding windows smooth those boundaries. Token buckets allow a controlled burst while enforcing an average refill rate. Choose the scope: user, API key, IP, or a combination.",
      },
      {
        heading: "Shared atomic enforcement",
        body: "A limiter inside one server instance does not limit traffic across all instances. Use an atomic shared counter or datastore operation with expiry. Return a useful 429 response and Retry-After where appropriate.",
      },
      {
        heading: "Safe retries",
        body: "Use exponential backoff with jitter and a bounded retry budget for transient failures. Do not blindly retry non-idempotent writes. Bind idempotency keys to the authenticated caller and request fingerprint, and atomically store or coordinate the operation result.",
      },
    ],
    `async function requestWithRetry(url, attempts = 3) {
  for (let attempt = 0; attempt < attempts; attempt++) {
    const response = await fetch(url); // Example: a safe GET
    if (response.ok) return response;
    if (response.status < 500 && response.status !== 429) return response;
    if (attempt === attempts - 1) return response;
    const delay = 200 * 2 ** attempt + Math.random() * 200;
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}
// Production clients should honor Retry-After and cancellation too.`,
    [
      "The first GET returns a transient 503.",
      "Wait a bounded delay plus jitter.",
      "Retry; a 200 returns immediately.",
      "Permanent client errors do not consume the retry loop. Network exceptions need a separately defined retry policy.",
    ],
    [
      "Authenticate caller",
      "Check shared quota",
      "Accept or return 429",
      "Execute once per intent",
      "Retry transient failure carefully",
    ],
    "Why is a payment POST unsafe to retry without coordination?",
    "The server may have committed the charge even if its response was lost. An idempotency key lets the server recognize the same intent and return the original result instead of charging again.",
    {
      question: "What does jitter help prevent?",
      options: [
        "Synchronized retry bursts",
        "All authentication errors",
        "SQL injection",
        "Every stale cache",
      ],
      correct: 0,
      explanation:
        "Randomizing retry delays spreads callers out instead of making them retry at the same instant.",
    },
  ),
];
