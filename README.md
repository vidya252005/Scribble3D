# Scribble3D — MERN Edition

Turn a sketch and/or a text prompt into a 3D object that gets added to one persistent scene called **"Late Night Lab."** Every object you generate stays in that scene — say "draw a room with windows," then "generate a man," then "add a tree," and all three show up together in the same react-three-fiber viewer. Click any object to select it, then generate again to edit it in place (recolor / resize / move / rebuild) instead of creating a duplicate. Export the whole scene as GLTF/GLB or a PNG snapshot.

## How the backend is structured

This is multi-step planning with tool dispatch over persistent, growing state, so I built the backend as an actual agent rather than a single request/response transformation:

```
prompt text  ──▶  planner.runAgent()
                      │
                      ├─ 1. intentClassifier.classify()  (or llmClient if LLM_API_KEY is set)
                      ├─ 2. colorResolver.resolveColor()
                      ├─ 3. tools/builders.resolveBuilder(type)  →  parts[]
                      └─ 4. place (grid layout) or patch (edit) + persist to MongoDB
                      │
                      ▼
              { object, trace[] }  ──▶  returned to the UI, trace shown in the Agent Trace panel
```

Every step appends a human-readable line to a `trace[]` array that gets returned to the frontend and rendered in the **Agent Trace** panel, so the reasoning is inspectable instead of a black box.

By default, `LLM_API_KEY` is left empty in `.env.example`. `agent/llmClient.js` checks for it — if it's absent, every request falls back transparently to the rule-based classifier, so the whole pipeline works out of the box with zero external cost. Drop in a key later and the same planner routes classification through the LLM instead, with no other code changes needed.

## Use case

**Product:** a browser-based tool for people with zero 3D modeling skill — students, PMs mocking up a room layout, hobbyists, educators — to build simple 3D scenes by typing (and optionally sketching) what they want, one object at a time, in natural language.

**Flow:**

1. The app loads (or lazily creates) the one persistent scene, "Late Night Lab," and any objects already in it.
2. Optionally, the user doodles a rough reference on the sketch canvas — a visual aid kept alongside the prompt.
3. The user types a prompt, e.g. `"draw a room with windows"`, and hits Generate.
4. The agent classifies this as `create`, type `room`, `windows: 2` (default when a count isn't given), picks a warm off-white wall color (none was specified), assembles floor + 4 walls + roof + windows + door as primitives, and places it at the next open grid slot. The object appears immediately; the trace panel shows every step.
5. Typing `"generate a man"` adds a new object next to the room rather than replacing it.
6. Clicking the man (outlined in yellow) and typing `"make it blue and bigger"` patches that object's color and scale in place, since something is selected and the prompt reads as an edit.
7. The scene exports as `.glb` for Blender/Unity/Unreal, `.gltf` for web pipelines, or a `.png` snapshot — all generated client-side from the live three.js scene graph.

## Tech stack

- **Frontend:** React 18 + Vite, `@react-three/fiber` + `@react-three/drei` (Three.js), Zustand for state, plain CSS.
- **Backend:** Node.js + Express, MongoDB via Mongoose.
- **Agent:** rule-based NLP classifier by default, with optional LLM routing via `LLM_API_KEY` (Anthropic-compatible by default, generic OpenAI-compatible path included).
- **Export:** `GLTFExporter` (three.js) for `.glb`/`.gltf`, canvas `toBlob` for `.png` — both run entirely client-side.

## Project structure

```
scribble3d-mern/
├── .gitignore
├── README.md
├── server/                    Express + MongoDB API
│   ├── .env.example           LLM_API_KEY left empty by default
│   ├── package.json
│   └── src/
│       ├── index.js
│       ├── config/db.js
│       ├── models/{Scene,SceneObject}.js
│       ├── agent/
│       │   ├── planner.js         orchestrator (the "agent")
│       │   ├── intentClassifier.js
│       │   ├── colorResolver.js
│       │   ├── llmClient.js       optional LLM path, empty key = fallback
│       │   └── tools/builders.js  room / man / tree / car / table / ...
│       ├── controllers/{agentController,sceneController}.js
│       └── routes/{agent,scenes}.js
└── client/                    React + Vite frontend
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx / App.css  left = inputs, right = outputs
        ├── api.js
        ├── store/useSceneStore.js
        ├── components/
        │   ├── Sketchpad.jsx      2D sketch input
        │   ├── PromptPanel.jsx    text prompt + generate/edit
        │   ├── ObjectList.jsx     objects in the scene
        │   ├── TracePanel.jsx     agent step trace
        │   ├── SceneViewer.jsx    persistent 3D output (r3f)
        │   └── ExportPanel.jsx    GLTF/GLB/PNG export
        └── three/
            ├── PrimitiveMesh.jsx
            ├── SceneObjectGroup.jsx
            └── threeRefs.js
```

## Setup

### 1. MongoDB

Have a local MongoDB running (`mongodb://127.0.0.1:27017`), or point `MONGO_URI` at Atlas or any hosted instance.

### 2. Backend

```
cd server
cp .env.example .env      # LLM_API_KEY stays empty for now
npm install
npm run dev                # http://localhost:5000
```

### 3. Frontend

```
cd client
npm install
npm run dev                 # http://localhost:5173 (proxies /api to :5000)
```

Open `http://localhost:5173`. Try: `"draw a room with windows"`, then `"generate a man"`, then `"add a tree"`, then click any object and type `"make it red"` or `"bigger"`.

## Adding an LLM key later

Fill in `server/.env`:

```
LLM_API_KEY=sk-...
LLM_PROVIDER=anthropic   # or "openai"
LLM_MODEL=claude-sonnet-4-6
```

No other code changes needed — `agent/llmClient.js` is picked up automatically by the planner as soon as a key is present.
