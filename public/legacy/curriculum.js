// InterviewOS curriculum. Each topic can be expanded without touching UI code.
window.INTERVIEWOS_CURRICULUM = [
  {
    id:'execution-context', title:'Execution Context & Call Stack', category:'JavaScript', level:'Fundamentals', minutes:35,
    summary:'Understand what JavaScript prepares before running your code, and how nested function calls are managed.',
    analogy:'Think of an execution context as a desk prepared for one job. The call stack is a stack of trays: the newest job goes on top and must finish before the one below continues.',
    takeaways:['Global code gets its own execution context.','Each function invocation creates a new function execution context.','The call stack follows last-in, first-out order.','The creation phase prepares bindings; the execution phase runs statements.'],
    flow:['Start script','Create global context','Run global statements','Call a function → push its context','Return → pop function context','Finish script'],
    sections:[
      {heading:'1. What is an execution context?',body:'An execution context is the environment JavaScript uses to run a piece of code. It contains the available variable bindings, scope information, and the value of this. Global code runs in a global execution context, and every ordinary function call creates a new function execution context.'},
      {heading:'2. Creation phase vs execution phase',body:'Before executing a context, JavaScript sets up its environment and declarations. Function declarations become callable; var bindings start as undefined; let and const bindings exist but cannot be accessed before initialization (the temporal dead zone). Then statements run from top to bottom.'},
      {heading:'3. How the call stack works',body:'The stack remembers which function is currently running and where execution should return. A function call pushes a context. A return (or thrown error unwinding the stack) removes it. Too many nested calls can cause a stack overflow.'}
    ],
    code:`function first() {\n  console.log('A');\n  second();\n  console.log('C');\n}\nfunction second() {\n  console.log('B');\n}\nfirst();\n// A, B, C`,
    walkthrough:['Global context calls first().','first is pushed; A is logged.','first calls second(); second is pushed.','second logs B and returns; its context is popped.','first logs C and returns.'],
    interview:{question:'Why does JavaScript print A, B, C rather than A, C, B?',answer:'Because synchronous function calls are executed immediately. first() pauses when second() is called, and only resumes after second() returns.'},
    quiz:{question:'Which context is on top of the stack while second() runs?',options:['Global context','first() context','second() context','No context'],correct:2,explanation:'The most recently called function is at the top of the call stack.'}
  },
  {
    id:'scope',title:'Scope, Lexical Scope & Shadowing',category:'JavaScript',level:'Fundamentals',minutes:30,
    summary:'Know where a variable is accessible and why nested functions can see variables from their defining scope.',
    analogy:'Imagine nested rooms. A person in an inner room can look outward through unlocked doors; someone outside cannot directly see private items inside the inner room.',
    takeaways:['var is function-scoped, while let and const are block-scoped.','Lexical scope is decided by where code is written, not by who calls it.','Inner scopes can read outer scope bindings.','Shadowing occurs when an inner scope declares a binding with the same name.'],
    flow:['Resolve variable name','Check current lexical environment','Found? → use current binding','Otherwise check outer environment','Continue until global','Not found → ReferenceError'],
    sections:[{heading:'Global, function, and block scope',body:'Global declarations are available in the global environment. Function parameters and local variables belong to the function. A block such as an if or for creates a lexical scope for let and const, but var is not block-scoped.'},{heading:'Lexical scope',body:'A function retains a reference to the scope where it was created. Passing the function elsewhere does not change which outer variables it can see.'},{heading:'Variable shadowing',body:'When an inner scope declares the same variable name as an outer scope, the inner declaration is used inside that inner scope. It does not overwrite the outer variable by itself.'}],
    code:`const name = 'Global';\nfunction outer() {\n  const name = 'Outer';\n  function inner() {\n    console.log(name);\n  }\n  return inner;\n}\nconst fn = outer();\nfn(); // 'Outer'`,
    walkthrough:['inner() was defined inside outer().','Its lexical environment points to outer().','Calling fn() later still resolves name from outer().','The global name is shadowed.'],
    interview:{question:'Does JavaScript resolve lexical scope based on where a function is called?',answer:'No. Lexical scope follows where the function is defined. The call site can affect this for regular functions, but not the function’s lexical environment.'},
    quiz:{question:'What does let use for scoping?',options:['Only global scope','Only function scope','Block scope','Dynamic scope'],correct:2,explanation:'let and const create block-scoped bindings.'}
  },
  {
    id:'closures',title:'Closures & Practical Uses',category:'JavaScript',level:'Core',minutes:40,
    summary:'Learn how functions remember outer bindings, even after the outer function returns.',
    analogy:'A closure is like a backpack a function carries. The backpack gives it continued access to the variables from the place where it was created.',
    takeaways:['A closure is a function together with access to its lexical environment.','Closures make private state, factories, and callbacks possible.','Each invocation can create a separate captured environment.','Captured references can keep objects reachable in memory.'],
    flow:['Call createCounter()','Create private count binding','Return inner function','Outer call finishes','Inner function still accesses count','Update state on each click'],
    sections:[{heading:'Why closures exist',body:'Functions are values: you can return them, store them, and pass them to event handlers. A returned function still needs the variables it was defined around. JavaScript preserves the needed lexical environment.'},{heading:'Real-world example',body:'You can use closures to implement counters, memoization, one-time functions, debounced callbacks, and encapsulated modules. In React, event handlers close over the values from the render that created them.'},{heading:'Memory implications',body:'As long as a closure is reachable, its captured references may keep some values alive. Be careful with listeners, timers, and closures holding large objects; remove unused listeners and references when no longer needed.'}],
    code:`function createCounter() {\n  let count = 0;\n  return {\n    increment() { return ++count; },\n    get() { return count; }\n  };\n}\nconst a = createCounter();\nconsole.log(a.increment()); // 1\nconsole.log(a.increment()); // 2`,
    walkthrough:['createCounter() creates a private count binding.','It returns methods that close over that binding.','The local variable is not directly reachable from outside.','Calling increment() updates the same captured binding.'],
    interview:{question:'Can a closure create a memory leak?',answer:'A closure itself is normal and useful. A leak can happen when an unnecessarily retained callback keeps large objects or detached DOM nodes reachable longer than intended.'},
    quiz:{question:'What makes a closure useful?',options:['It deletes outer variables','It retains access to its defining lexical environment','It always runs asynchronously','It converts let into var'],correct:1,explanation:'A function can keep accessing variables from the scope in which it was created.'}
  },
  {
    id:'hoisting',title:'Hoisting & Temporal Dead Zone',category:'JavaScript',level:'Fundamentals',minutes:30,
    summary:'Predict how var, let, const, and function declarations behave before their declaration line.',
    analogy:'Before opening a shop, workers put labels on shelves. var has an empty box labeled undefined. let and const have a reserved shelf that cannot be touched until stocked.',
    takeaways:['Hoisting describes binding setup before code execution.','var reads as undefined before assignment.','let and const are inaccessible before initialization.','Function declarations can generally be called before their definition appears.'],
    flow:['Enter scope','Create declaration bindings','var → initialize undefined','let/const → uninitialized','Execute statements','Initialize let/const at declaration'],
    sections:[{heading:'What actually gets hoisted?',body:'Declarations are registered as part of creating an execution context. The difference is their initialization: var is initialized to undefined, whereas lexical declarations cannot be accessed until execution reaches the declaration.'},{heading:'Temporal Dead Zone (TDZ)',body:'The TDZ is the period from entering the scope until the binding is initialized. Accessing a let or const variable during this period throws ReferenceError.'},{heading:'Function declarations vs expressions',body:'A function declaration is usually initialized during context setup. A function expression follows the rules of the variable binding that holds it.'}],
    code:`console.log(a); // undefined\nvar a = 10;\n\n// console.log(b); // ReferenceError\nlet b = 20;\n\nsayHi(); // works\nfunction sayHi() { console.log('Hi'); }`,
    walkthrough:['The var binding exists with value undefined.','The let binding exists but is uninitialized.','Access before the let declaration throws.','The function declaration is callable during execution.'],
    interview:{question:'Are let and const hoisted?',answer:'Their declarations are processed when the lexical environment is created, but the bindings remain uninitialized until execution reaches the declaration. That is why accessing them early throws.'},
    quiz:{question:'What happens when you read const before its declaration?',options:['undefined','null','ReferenceError','0'],correct:2,explanation:'The binding is in its temporal dead zone.'}
  },
  {
    id:'this',title:'this, Arrow Functions & Binding',category:'JavaScript',level:'Core',minutes:40,
    summary:'Master dynamic this binding, arrow functions, and call, apply, and bind.',
    analogy:'A regular function checks who is calling it. An arrow function uses the this value already available where it was created.',
    takeaways:['For ordinary functions, this is determined by how the function is called.','Arrow functions capture this lexically.','call and apply invoke immediately with a chosen this.','bind returns a new function with a bound this.'],
    flow:['Function invoked','Arrow? → use lexical this','Called with new? → new object','call/apply/bind? → explicit binding','Called as obj.method()? → obj','Otherwise default binding'],
    sections:[{heading:'Call-site rules',body:'For normal functions, a method call such as obj.run() uses obj as this. Detached calls lose that method receiver. In strict mode, a standalone function call commonly gets undefined as this.'},{heading:'Arrow functions',body:'An arrow function does not define its own this; it uses the surrounding lexical this. That is helpful inside callbacks, but means arrow functions are generally not suitable as methods that need a dynamic receiver.'},{heading:'call, apply, bind',body:'call(thisArg, ...args) and apply(thisArg, argsArray) execute a function immediately. bind(thisArg, ...presetArgs) creates a bound function you can invoke later.'}],
    code:`const user = {\n  name: 'Asha',\n  say() { return this.name; }\n};\nconsole.log(user.say()); // Asha\nconst detached = user.say;\nconsole.log(detached.call(user)); // Asha\nconst fixed = detached.bind(user);\nconsole.log(fixed()); // Asha`,
    walkthrough:['user.say() has user as its call-site receiver.','detached has no implicit receiver.','call(user) explicitly supplies the receiver.','bind(user) creates a callable function with that binding.'],
    interview:{question:'Why does an arrow method often fail to access the object through this?',answer:'Because arrow functions capture this from their surrounding lexical scope. Merely putting an arrow in an object literal does not bind this to that object.'},
    quiz:{question:'Which method returns a new function instead of invoking immediately?',options:['call','apply','bind','Reflect.apply'],correct:2,explanation:'bind creates a function with a fixed this and optional preset arguments.'}
  },
  {
    id:'call-apply-bind',title:'call(), apply(), bind() & Polyfills',category:'JavaScript',level:'Advanced',minutes:65,
    summary:'Understand explicit this binding, partial application and realistic interview polyfill limitations.',
    analogy:'call and apply are like making a phone call now with a chosen identity; bind prepares a pre-addressed call you can make later.',
    takeaways:['call runs now with individual arguments.','apply runs now with array-like arguments.','bind returns a new function with preset this / arguments.','Interview polyfills are approximations unless they reproduce strict-mode and constructor semantics.'],
    flow:['Choose a function','call → invoke immediately','apply → invoke with argument list','bind → create new function','Call bound function later','Return result'],
    sections:[{heading:'Immediate invocation',body:'call(context, ...args) and apply(context, argsArray) both invoke immediately. The key difference is their argument format.'},{heading:'Bind and partial application',body:'bind creates a new callable function with an ordinary-call receiver and optionally some arguments fixed. It does not execute the function immediately.'},{heading:'Polyfill discussion',body:'A Symbol-property trick is useful for educational call/apply exercises but is not a complete substitute for the native implementation. Native bind handles construction and other special behavior.'}],
    code:`function fullName(city) { return this.name + ' from ' + city; }
const user = {name:'Asha'};
console.log(fullName.call(user, 'Mumbai'));
console.log(fullName.apply(user, ['Mumbai']));
const bound = fullName.bind(user);
console.log(bound('Mumbai'));`,
    walkthrough:['call executes now with Mumbai as positional argument.','apply executes now with the argument array.','bind returns a new function.','Calling bound later uses user as this.'],
    interview:{question:'How would you write your own bind polyfill?',answer:'Return a closure that combines preset and later arguments and applies the requested receiver. Explain that a full polyfill must also account for new and bound-function semantics.'},
    quiz:{question:'Which method does NOT invoke the target immediately?',options:['call','apply','bind','All three invoke immediately'],correct:2,explanation:'bind creates a callable bound function for later execution.'}
  },
  {
    id:'prototypes',title:'Prototype Chain & Object.create',category:'JavaScript',level:'Advanced',minutes:45,
    summary:'Discover how property lookup and inheritance work under the hood.',
    analogy:'If you cannot find a tool in your drawer, you look in the shared toolbox above it. Prototype lookup follows a similar chain of linked objects.',
    takeaways:['Objects have an internal [[Prototype]] link.','Property reads search the object, then its prototype chain.','Object.create(proto) creates an object linked to proto.','JavaScript class syntax builds on prototype-based behavior.'],
    flow:['Read obj.key','Check own property','Missing? inspect prototype','Continue prototype chain','Reach null','Return undefined'],
    sections:[{heading:'Prototype lookup',body:'JavaScript checks an object for an own property first. If absent, it follows the internal prototype link and repeats. A null prototype ends the chain.'},{heading:'Object.create',body:'Object.create(proto) creates a new object whose prototype is proto. Sharing methods through a prototype means instances can use the same method function.'},{heading:'What class syntax means',body:'The class keyword provides a clearer syntax for constructors, prototype methods, inheritance, and static members. JavaScript remains prototype-based.'}],
    code:`const animal = { speak() { return 'sound'; } };\nconst dog = Object.create(animal);\ndog.name = 'Milo';\nconsole.log(dog.speak()); // sound\nconsole.log(Object.hasOwn(dog, 'speak')); // false`,
    walkthrough:['dog has its own name property.','dog has no own speak property.','Lookup follows the prototype to animal.','The inherited speak() method is used.'],
    interview:{question:'Do classes replace JavaScript prototypes?',answer:'No. Class syntax is built on top of JavaScript’s prototype-based inheritance model. Methods are typically placed on the class prototype.'},
    quiz:{question:'Where does JS look after a missing own property?',options:['window only','The object’s prototype','The global function','Nowhere'],correct:1,explanation:'Normal property access follows the prototype chain.'}
  },
  {
    id:'classes-prototypes',title:'Classes vs Prototypes',category:'JavaScript',level:'Advanced',minutes:55,
    summary:'Learn how classes map to prototype inheritance and what class syntax changes.',
    analogy:'A class is the modern blueprint interface; underneath, each instance still follows JavaScript’s prototype chain for shared methods.',
    takeaways:['Class methods are typically stored on Class.prototype.','Classes still use prototypes for inheritance.','Class constructors require new and class declarations have a TDZ.','Private #fields are language-enforced private instance state.'],
    flow:['Define class','Constructor + prototype methods','new creates an object','Link instance to Class.prototype','Initialize instance fields','Resolve shared methods through prototype'],
    sections:[{heading:'What a class really is',body:'Class syntax defines constructors and methods using the existing prototype mechanism. Prototype methods are shared rather than duplicated on each instance.'},{heading:'extends and super',body:'Inheritance links the child and parent prototypes. super can call the base constructor or methods. A derived constructor must call super before using this.'},{heading:'Classes vs constructor functions',body:'Classes enforce new, provide convenient private fields and strict class-body execution, and behave differently around hoisting; the simplified old-style constructor comparison is not exactly identical.'}],
    code:`class Person {
  constructor(name) { this.name = name; }
  greet() { return 'Hi ' + this.name; }
}
const a = new Person('Asha');
const b = new Person('Sam');
console.log(a.greet === b.greet); // true`,
    walkthrough:['Define Person and its shared greet method.','Each new instance receives a name.','Both instances delegate greet lookup to Person.prototype.','The method reference is shared.'],
    interview:{question:'Does JavaScript use class-based inheritance internally?',answer:'Classes build on JavaScript’s prototype system. Instances still delegate through [[Prototype]] links. Class syntax adds strict behavior, inheritance syntax, private fields and other guarantees.'},
    quiz:{question:'Where is an ordinary class method greet() stored?',options:['Only in the global scope','On each instance','On Class.prototype','On window'],correct:2,explanation:'Ordinary class methods live on the shared prototype.'}
  },
  {
    id:'event-loop',title:'Event Loop, Tasks & Microtasks',category:'JavaScript',level:'Advanced',minutes:50,
    summary:'Predict the output of synchronous code, promises, timers, and browser updates.',
    analogy:'A chef finishes the current dish (stack), handles urgent short requests (microtasks), and then picks the next regular ticket (task). The dining room can be updated between turns.',
    takeaways:['Synchronous code runs on the call stack.','Promise reactions are queued as microtasks.','setTimeout callbacks run as tasks after eligible delays.','The event loop can render between tasks after microtasks have drained.'],
    flow:['Execute synchronous script','Call stack becomes empty','Drain microtask queue','Browser may render','Run next task','Repeat'],
    sections:[{heading:'Call stack and queues',body:'JavaScript runs one callback at a time on its main thread. When asynchronous operations complete, their callbacks are scheduled rather than interrupting currently running JavaScript.'},{heading:'Microtasks vs tasks',body:'Promise .then handlers and queueMicrotask add microtasks. Timers schedule tasks. After a task finishes, the runtime processes pending microtasks before moving to another task; creating endless microtasks can delay other work.'},{heading:'Rendering',body:'Browsers usually consider rendering between tasks, not in the middle of a long-running JavaScript task. Heavy synchronous work can therefore delay user interaction and visual updates.'}],
    code:`console.log('1');\nsetTimeout(() => console.log('4'), 0);\nPromise.resolve().then(() => console.log('3'));\nconsole.log('2');\n// Output: 1, 2, 3, 4`,
    walkthrough:['1 logs synchronously.','The timer callback is scheduled as a task.','The Promise reaction is scheduled as a microtask.','2 logs synchronously.','The microtask prints 3, then the timer task prints 4.'],
    interview:{question:'Why does Promise.then usually run before setTimeout(fn, 0)?',answer:'After the current synchronous task completes, the runtime drains queued microtasks before starting the next task. The timer cannot execute synchronously.'},
    quiz:{question:'Which runs first after synchronous code finishes?',options:['Any timer task','Queued Promise reactions','A new network request','The oldest animation'],correct:1,explanation:'Microtasks are processed at the microtask checkpoint before the next task.'}
  },
  {
    id:'async-await',title:'Promises, Async/Await & Error Handling',category:'JavaScript',level:'Core',minutes:40,
    summary:'Learn asynchronous composition, failure handling, and concurrency.',
    analogy:'A promise is a receipt for a result that will arrive later. await lets you write the next step as if you were reading a regular sequence, without blocking the whole JavaScript thread.',
    takeaways:['An async function always returns a Promise.','await pauses the async function, not the entire JS thread.','Promise.all fails fast when one input rejects.','Catch errors and consider cancellation for obsolete requests.'],
    flow:['Call async function','Start asynchronous operation','await suspends function','Promise settles','Resume in microtask','Return value or throw'],
    sections:[{heading:'Promise states',body:'A promise starts pending and then settles as fulfilled or rejected. Once settled it cannot settle again.'},{heading:'Sequential vs concurrent requests',body:'When independent requests can run together, start both before awaiting. Promise.all allows you to collect successful results; Promise.allSettled collects individual outcomes.'},{heading:'Handling errors',body:'Use try/catch around await or .catch on promise chains. In UI code, manage loading, error, and stale-response states. AbortController can help cancel unneeded fetch requests.'}],
    code:`async function loadPage() {\n  try {\n    const [user, products] = await Promise.all([\n      fetch('/api/user').then(r => r.json()),\n      fetch('/api/products').then(r => r.json())\n    ]);\n    return { user, products };\n  } catch (error) {\n    console.error('Load failed', error);\n    throw error;\n  }\n}`,
    walkthrough:['Both fetch requests start before awaiting the combined promise.','Promise.all waits until both fulfill or one rejects.','The async function resumes with results or enters catch.'],
    interview:{question:'Does await block the browser main thread?',answer:'No. await suspends the async function until the promise settles. Other tasks can run while it is suspended; CPU-heavy synchronous work still blocks.'},
    quiz:{question:'What does an async function return?',options:['Always a Promise','A callback','Always undefined','Only a string'],correct:0,explanation:'Its return value is wrapped in a Promise.'}
  },
  {
    id:'react-rendering',title:'React Rendering, Reconciliation & Keys',category:'React',level:'Core',minutes:45,
    summary:'Understand what triggers renders, how React compares trees, and why keys matter.',
    analogy:'React is like an editor comparing two versions of a document. It figures out which parts should change instead of rewriting everything.',
    takeaways:['State or props changes can trigger a render.','A render computes a description of UI; commit applies updates.','Stable keys identify siblings across renders.','Memoization is an optimization, not a correctness strategy.'],
    flow:['State update','Schedule render','Compute new element tree','Reconcile with previous tree','Commit DOM changes','Browser paints'],
    sections:[{heading:'Render vs commit',body:'During render, React calls components to compute the next UI. During commit, it applies necessary updates to the host environment. Rendering a component does not automatically mean its DOM changes.'},{heading:'Reconciliation',body:'React uses element type and keys to decide which parts of the tree can preserve their identity. A changed type can cause an old subtree to be replaced.'},{heading:'Why keys matter',body:'Stable keys help React match items in changing lists. Array indices can be problematic for reordered or removed items because the wrong local state may be preserved.'}],
    code:`function Tasks({ tasks }) {\n  return (\n    <ul>\n      {tasks.map(task => (\n        <li key={task.id}>{task.title}</li>\n      ))}\n    </ul>\n  );\n}`,
    walkthrough:['A state update requests a new render.','React computes the next list of elements.','Each stable id identifies the same logical item.','React commits only necessary changes.'],
    interview:{question:'Does every React re-render update the DOM?',answer:'No. Render computes the desired UI; reconciliation and commit determine which host updates are needed. If the output is equivalent, there may be no DOM mutation.'},
    quiz:{question:'What makes a good key for a dynamic list?',options:['Math.random()','Index during reordering','Stable unique item id','A shared key'],correct:2,explanation:'Stable unique keys preserve item identity across updates.'}
  },
  {
    id:'react-hooks',title:'Hooks, Effects & Stale Closures',category:'React',level:'Advanced',minutes:50,
    summary:'Use state and effects correctly while avoiding stale data and unnecessary effects.',
    analogy:'Each render is a snapshot. A callback made during that render carries values from that snapshot until a new callback is created.',
    takeaways:['Hooks must run in consistent order.','Effects synchronize with external systems.','Dependencies reflect reactive values used by the effect.','Functional state updates avoid some stale-closure problems.'],
    flow:['Component renders','Read state snapshot','Commit UI','Run eligible effect','Cleanup before rerun/unmount','Run updated effect'],
    sections:[{heading:'State snapshots',body:'Calling a state setter schedules an update; the value inside the current render does not change. Use functional updates when the new state depends on the previous state.'},{heading:'What useEffect is for',body:'Effects synchronize React with systems outside React, such as event subscriptions, browser APIs, or network operations. Values that can be calculated during render generally do not need a separate effect.'},{heading:'Cleanup and dependencies',body:'Return cleanup functions for subscriptions and timers. Include reactive dependencies used inside an effect so it can update when those values change.'}],
    code:`function Counter() {\n  const [count, setCount] = React.useState(0);\n  return (\n    <button onClick={() => {\n      setCount(c => c + 1);\n      setCount(c => c + 1);\n    }}>Count: {count}</button>\n  );\n}\n// Each click increments by 2`,
    walkthrough:['Both updates are queued during the event.','Each updater receives the latest pending state.','React computes the final state and renders.'],
    interview:{question:'What is a stale closure in React?',answer:'A callback or effect retains values from the render in which it was created, even after new renders occur. Correct dependency management and functional updates help when appropriate.'},
    quiz:{question:'When should you clean up an interval created by an effect?',options:['Never','On effect cleanup','Only on page refresh','During render'],correct:1,explanation:'Return a cleanup callback from the effect.'}
  },
  {
    id:'state-management',title:'State Management & Data Flow',category:'React',level:'Core',minutes:35,
    summary:'Decide when to use local state, context, a store, or a server-state cache.',
    analogy:'Keep a personal notebook for local decisions, a team noticeboard for shared client state, and a live database view for information owned by the server.',
    takeaways:['Keep state closest to where it is used.','Lift state only when multiple components need coordination.','Client state and server state have different needs.','Avoid duplicating derivable data.'],
    flow:['Identify data owner','Local component only? → useState','Shared client interaction? → context/store','Remote authoritative data? → server cache','Derive calculated state'],
    sections:[{heading:'Local and shared state',body:'Use component state for UI choices like whether a modal is open. Move state up or use a store if many distant components need to coordinate.'},{heading:'Server state',body:'Remote data can become stale and needs loading, errors, caching, retries, and invalidation. A query library or framework data layer can manage those concerns.'},{heading:'Avoid overengineering',body:'Do not add global state for a value used by only one component. Prefer derived values over multiple synchronized copies.'}],
    code:`const [query, setQuery] = useState('');\nconst filtered = products.filter(p =>\n  p.title.toLowerCase().includes(query.toLowerCase())\n);\n// filtered is derived, not duplicated state`,
    walkthrough:['The source list and query are sufficient.','filtered is recomputed from current inputs.','No effect is needed to synchronize a second state variable.'],
    interview:{question:'When would you use a server-state library?',answer:'When fetching, caching, stale data, background refetching, invalidation, and request lifecycle management add complexity beyond a simple fetch.'},
    quiz:{question:'What should you usually do with easily computed values?',options:['Duplicate in global state','Derive from inputs','Save in localStorage every render','Fetch again'],correct:1,explanation:'Derived values reduce synchronization bugs.'}
  },
  {
    id:'nextjs-rendering',title:'Next.js Rendering & App Router',category:'Next.js',level:'Advanced',minutes:50,
    summary:'Understand Server Components, Client Components, SSR, caching, and hydration boundaries.',
    analogy:'The server prepares the base meal, and the browser adds interactive controls at the table. Not every part of the page needs client-side JavaScript.',
    takeaways:['Server Components can access server resources without sending their component code to the browser.','Client Components handle interactive state and browser APIs.','Streaming can send UI progressively with Suspense boundaries.','Caching and request-time behavior depend on route and fetch configuration.'],
    flow:['Browser requests route','Server renders component tree','Stream HTML/RSC payload','Browser displays initial UI','Load client JS','Hydrate interactive boundaries'],
    sections:[{heading:'Server and Client Components',body:'In the App Router, components are Server Components by default. Add use client where browser-side state, effects, or event handlers are needed. A client boundary also affects its imports.'},{heading:'SSR and hydration',body:'The server can send useful HTML before JavaScript loads. Hydration attaches client interaction to matching server-rendered markup. Incorrect assumptions about browser-only state can cause mismatches.'},{heading:'Caching strategy',body:'Different versions and route settings of Next.js affect data caching and rendering. Make caching decisions explicit and verify behavior for your installed Next.js version.'}],
    code:`// app/products/page.tsx — Server Component\nexport default async function ProductsPage() {\n  const products = await getProducts();\n  return <ProductList products={products} />;\n}\n\n// components/Search.tsx — Client Component\n'use client';\nexport function Search() {\n  const [q, setQ] = useState('');\n  return <input value={q} onChange={e => setQ(e.target.value)} />;\n}`,
    walkthrough:['A request reaches the Next.js server.','Server Components can fetch data directly.','UI response can be streamed to the browser.','Only client boundaries require hydration and interactive JS.'],
    interview:{question:'Should every Next.js component use "use client"?',answer:'No. Keep components on the server by default when they do not need browser interactivity, and define client boundaries around interactive features.'},
    quiz:{question:'Which component needs use client?',options:['Static heading','Component using onClick and useState','Server-only database loader','Pure layout'],correct:1,explanation:'Interactive hooks and event handlers require a Client Component.'}
  },
  {
    id:'web-performance',title:'Web Performance & Core Web Vitals',category:'Web Platform',level:'Advanced',minutes:45,
    summary:'Improve page loading, responsiveness, and layout stability using real measurements.',
    analogy:'A shop needs to open quickly, respond fast when customers ask for something, and keep shelves from moving while people browse.',
    takeaways:['LCP concerns the largest visible content loading.','INP measures responsiveness across interactions.','CLS tracks unexpected layout movement.','Measure with field data and use lab tools for diagnosis.'],
    flow:['Collect real-user metrics','Identify worst pages','Find resource / JS / layout bottleneck','Apply focused optimization','Remeasure real users'],
    sections:[{heading:'Three user-facing signals',body:'Largest Contentful Paint (LCP) focuses on visual loading. Interaction to Next Paint (INP) describes interaction responsiveness. Cumulative Layout Shift (CLS) captures unexpected movement.'},{heading:'Common fixes',body:'Prioritize the hero image, avoid render-blocking work, reduce unnecessary JavaScript, split expensive tasks, reserve image dimensions, and avoid late layout shifts.'},{heading:'Measure carefully',body:'Use real-user performance observations to confirm impact. Lighthouse and browser DevTools are diagnostic tools, while field data captures real devices and networks.'}],
    code:`// Reserve dimensions to avoid layout shifts\n<img\n  src="/hero.webp"\n  width="1200"\n  height="650"\n  alt="Collection"\n/>`,
    walkthrough:['Reserve space before the image downloads.','Keep the primary image discoverable early.','Reduce heavy main-thread tasks.','Compare field performance after deployment.'],
    interview:{question:'Can improving Lighthouse scores guarantee good Core Web Vitals in production?',answer:'No. Lighthouse is a lab measurement. Real-user field data varies by device, network, page usage, and interaction patterns.'},
    quiz:{question:'Which metric focuses on unexpected layout shifts?',options:['LCP','INP','CLS','TTFB'],correct:2,explanation:'CLS stands for Cumulative Layout Shift.'}
  },
  {
    id:'api-design',title:'API Design, Auth & Security Basics',category:'System Design',level:'Advanced',minutes:50,
    summary:'Design reliable frontend-to-backend communication and explain critical security boundaries.',
    analogy:'An API is the reception desk for a service. Authentication checks identity; authorization checks which rooms a person can enter.',
    takeaways:['Separate authentication from authorization.','Validate on the server even when the client validates.','Prefer least privilege and secure session handling.','Handle errors, idempotency, and observability deliberately.'],
    flow:['Client requests resource','Authenticate identity','Authorize resource/action','Validate input','Run business logic','Return consistent response'],
    sections:[{heading:'AuthN vs AuthZ',body:'Authentication establishes who is making the request. Authorization verifies whether that identity can take a specific action on a specific resource.'},{heading:'API contract design',body:'Choose stable resource shapes, response codes, pagination, validation messages, and clear error handling. Do not reveal secrets or sensitive internal details to clients.'},{heading:'Browser security',body:'Use HTTPS, consider CSRF defenses for cookie-based mutation endpoints, constrain CORS, and defend against injection and XSS through proper escaping and validation.'}],
    code:`// Example response shape\n{\n  "error": {\n    "code": "FORBIDDEN",\n    "message": "You cannot access this resource"\n  }\n}`, 
    walkthrough:['Client sends authenticated request.','Server resolves the identity.','Authorization verifies requested resource permission.','Input validation runs before executing the operation.','Client receives a documented response.'],
    interview:{question:'Can the frontend hide a button instead of checking permissions on the backend?',answer:'No. Hiding a button is UX, not security. The backend must enforce authorization for every protected operation.'},
    quiz:{question:'Where must permission checks be enforced?',options:['Only CSS','Only frontend','Backend on protected operations','Browser console'],correct:2,explanation:'Client checks can be bypassed; backend authorization protects resources.'}
  },
  {
    id:'frontend-system-design',title:'Frontend System Design: Commerce PLP',category:'System Design',level:'Advanced',minutes:55,
    summary:'Practice designing a production product listing page with routing, caching, filters, and analytics.',
    analogy:'A product listing page is a coordinated team: the URL holds the current choices, APIs supply inventory, cache keeps repeated requests fast, and analytics records customer behavior.',
    takeaways:['Clarify requirements, scale, and constraints before choosing tools.','Keep shareable filter/sort state in the URL.','Think through SSR/SEO, responsive rendering, and caching.','Plan failure states, instrumentation, and accessibility.'],
    flow:['Open category URL','Parse filters and sort','Fetch product list','Render SEO-friendly initial UI','Hydrate controls','Update URL + refetch on interaction'],
    sections:[{heading:'Start with functional requirements',body:'The page needs products, filters, sorting, pagination, clear loading/empty/error states, and navigation to product details. Ask about geography, inventory freshness, SEO, and traffic volume.'},{heading:'Define state ownership',body:'The URL is a good source for shareable filter and sort selections. Backend services own product and availability data. Client UI owns ephemeral states such as an open filter drawer.'},{heading:'Performance and resilience',body:'Use suitable initial rendering, image optimization, cache keys that include filters, request cancellation or stale-response handling, and instrumentation. Avoid silently displaying stale inventory as guaranteed availability.'}],
    code:`// URL-driven filter example\nconst url = new URL(location.href);\nurl.searchParams.set('sort', 'price_asc');\nurl.searchParams.set('page', '1');\nhistory.pushState({}, '', url);\n// Fetch product data keyed by the new URL state`,
    walkthrough:['Customer opens a crawlable category route.','Server or data layer parses query parameters.','Product results are fetched and rendered.','A filter changes URL parameters.','UI and data synchronize with the updated URL.'],
    interview:{question:'Why would you store PLP filters in the URL?',answer:'It makes filtered views shareable, bookmarkable, browser-history-aware, and easier to reason about for routing and data-fetching cache keys.'},
    quiz:{question:'Which state is most naturally URL-owned?',options:['Open tooltip','Selected sort order','Focus ring','Temporary toast'],correct:1,explanation:'Sorting and filters often represent navigable, shareable state.'}
  },
  {
    id:'dsa-arrays',title:'Arrays, Hash Maps & Two Pointers',category:'DSA',level:'Fundamentals',minutes:45,
    summary:'Build interview intuition for linear scans, maps, sets, and pointer-based array solutions.',
    analogy:'A hash map is a labeled storage cabinet for quick lookup. Two pointers are two bookmarks that move through a sorted book from opposite ends.',
    takeaways:['Know the time cost of array operations and common traversals.','Use maps or sets for average constant-time membership tests.','Two pointers can solve many sorted-array problems in linear time.','Always explain trade-offs and input assumptions.'],
    flow:['Read input constraints','Brute force baseline','Look for repeated lookups','Hash map or sorted two pointers?','Implement','Test edge cases'],
    sections:[{heading:'Hash map pattern',body:'If you repeatedly ask whether a complementary value exists, a hash map can avoid scanning the entire array every time. State that average lookup is usually O(1), not an absolute guarantee.'},{heading:'Two pointers',body:'For sorted input, maintain left and right indices and use the sum or comparison to decide which side to move. This often gives O(n) time with O(1) extra space.'},{heading:'Interview process',body:'State assumptions, show brute force, improve complexity, dry run a small example, and discuss empty inputs, duplicates, and invalid cases.'}],
    code:`function twoSumSorted(nums, target) {\n  let left = 0, right = nums.length - 1;\n  while (left < right) {\n    const sum = nums[left] + nums[right];\n    if (sum === target) return [left, right];\n    if (sum < target) left++;\n    else right--;\n  }\n  return [-1, -1];\n}`, 
    walkthrough:['Start at both ends of the sorted array.','If the sum is too small, move left forward.','If the sum is too large, move right backward.','Stop on a match or when pointers cross.'],
    interview:{question:'When would two pointers beat a hash map for two-sum?',answer:'When input is already sorted (or sorting is acceptable), two pointers can solve it in O(n) time and O(1) extra space; sorting first adds time and may change index requirements.'},
    quiz:{question:'For sorted two-sum, what do you do if the sum is too small?',options:['Move right left','Move left right','Restart','Return immediately'],correct:1,explanation:'Increasing the smaller-side value can increase the sum.'}
  },
  {
    id:'dsa-recursion',title:'Recursion, Trees & Complexity',category:'DSA',level:'Core',minutes:50,
    summary:'Trace recursion using the call stack and reason about tree traversals.',
    analogy:'Solving a recursion problem is like opening smaller nested boxes until you reach a box simple enough to solve directly.',
    takeaways:['A recursive function needs a base case and progress toward it.','Each recursive call uses stack space.','Tree traversal order depends on when you visit each node.','Analyze time and memory including recursive call depth.'],
    flow:['Receive current node','Base case? → return','Process node / recurse left','Recurse right','Combine / return','Unwind call stack'],
    sections:[{heading:'Base case',body:'The base case stops recursion. Without progress toward it, recursive calls can continue until the stack overflows.'},{heading:'Tree traversal',body:'Preorder processes node-left-right, inorder left-node-right, and postorder left-right-node. Breadth-first traversal uses a queue and visits level by level.'},{heading:'Complexity',body:'A traversal visiting each node once is O(n) time. Recursive depth-first traversal often uses O(h) auxiliary stack space where h is the tree height.'}],
    code:`function maxDepth(node) {\n  if (node == null) return 0;\n  const left = maxDepth(node.left);\n  const right = maxDepth(node.right);\n  return 1 + Math.max(left, right);\n}`, 
    walkthrough:['Null nodes return depth zero.','Recursively compute left subtree depth.','Compute right subtree depth.','Return one plus the larger depth.'],
    interview:{question:'What is the auxiliary space complexity of recursive DFS on a balanced binary tree?',answer:'O(h) call stack space; on a balanced tree, height h is O(log n). On a skewed tree it can grow to O(n).'},
    quiz:{question:'What prevents infinite recursion?',options:['A base case reached through progress','A for loop','A global var','Only try/catch'],correct:0,explanation:'The recursive problem must become smaller until the stopping condition is met.'}
  }
];


