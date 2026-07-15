// Each builder takes resolved params + color info and returns a "recipe":
// { label, params, parts[] } where parts are primitive shapes with local
// (object-space) transforms. The planner then places the whole object at a
// world position/rotation/scale. This is the "assemble primitive 3D geometry"
// step of the agent pipeline.

const { TYPE_DEFAULTS } = require("../colorResolver");

function part(shape, dims, position, color, opts = {}) {
  return {
    shape,
    dims,
    position,
    rotation: opts.rotation || [0, 0, 0],
    scale: opts.scale || [1, 1, 1],
    color,
    opacity: opts.opacity ?? 1,
  };
}

// ---------- ROOM ----------
function buildRoom({ intent, color }) {
  const wallColor = color || TYPE_DEFAULTS.room.wall;
  const floorColor = TYPE_DEFAULTS.room.floor;
  const roofColor = TYPE_DEFAULTS.room.roof;
  const width = 6;
  const depth = 6;
  const height = 3;
  const wallThickness = 0.12;
  const windowCount = intent.windows || 2;

  const parts = [];

  // floor
  parts.push(part("box", { width, height: 0.1, depth }, [0, 0, 0], floorColor));

  // back wall (with windows cut in visually by placing window panes on top)
  parts.push(part("box", { width, height, depth: wallThickness }, [0, height / 2, -depth / 2], wallColor));
  // front wall split into two segments to leave a doorway gap
  const doorWidth = 1.1;
  const sideSegW = (width - doorWidth) / 2;
  parts.push(part("box", { width: sideSegW, height, depth: wallThickness }, [-(doorWidth / 2 + sideSegW / 2), height / 2, depth / 2], wallColor));
  parts.push(part("box", { width: sideSegW, height, depth: wallThickness }, [doorWidth / 2 + sideSegW / 2, height / 2, depth / 2], wallColor));
  // left / right walls
  parts.push(part("box", { width: wallThickness, height, depth }, [-width / 2, height / 2, 0], wallColor));
  parts.push(part("box", { width: wallThickness, height, depth }, [width / 2, height / 2, 0], wallColor));

  // flat roof
  parts.push(part("box", { width: width + 0.3, height: 0.15, depth: depth + 0.3 }, [0, height + 0.08, 0], roofColor));

  // windows: light blue glass panes spaced along the back wall
  const winW = 0.9, winH = 0.9;
  for (let i = 0; i < windowCount; i++) {
    const t = windowCount === 1 ? 0.5 : i / (windowCount - 1);
    const x = -width / 2 + 1 + t * (width - 2);
    parts.push(
      part("box", { width: winW, height: winH, depth: 0.06 }, [x, height / 2 + 0.2, -depth / 2], "#bfe3ee", { opacity: 0.7 })
    );
    // window frame
    parts.push(
      part("box", { width: winW + 0.1, height: winH + 0.1, depth: 0.04 }, [x, height / 2 + 0.2, -depth / 2 - 0.02], "#5c4a36")
    );
  }

  // door
  parts.push(part("box", { width: doorWidth - 0.1, height: 1.9, depth: 0.06 }, [0, 0.95, depth / 2], "#5c4a36"));

  return { label: "Room", params: { width, depth, height, windows: windowCount }, parts };
}

// ---------- MAN ----------
function buildMan({ color }) {
  const skin = TYPE_DEFAULTS.man.skin;
  const shirt = color || TYPE_DEFAULTS.man.shirt;
  const pants = TYPE_DEFAULTS.man.pants;

  const parts = [
    part("sphere", { radius: 0.22 }, [0, 1.62, 0], skin),
    part("box", { width: 0.5, height: 0.65, depth: 0.28 }, [0, 1.18, 0], shirt),
    part("cylinder", { radiusTop: 0.08, radiusBottom: 0.08, height: 0.55 }, [-0.32, 1.18, 0], shirt, { rotation: [0, 0, 0.35] }),
    part("cylinder", { radiusTop: 0.08, radiusBottom: 0.08, height: 0.55 }, [0.32, 1.18, 0], shirt, { rotation: [0, 0, -0.35] }),
    part("cylinder", { radiusTop: 0.11, radiusBottom: 0.11, height: 0.9 }, [-0.14, 0.45, 0], pants),
    part("cylinder", { radiusTop: 0.11, radiusBottom: 0.11, height: 0.9 }, [0.14, 0.45, 0], pants),
  ];

  return { label: "Man", params: {}, parts };
}

// ---------- TREE ----------
function buildTree({ color }) {
  const trunk = TYPE_DEFAULTS.tree.trunk;
  const foliage = color || TYPE_DEFAULTS.tree.foliage;

  const parts = [
    part("cylinder", { radiusTop: 0.14, radiusBottom: 0.2, height: 1.2 }, [0, 0.6, 0], trunk),
    part("sphere", { radius: 0.65 }, [0, 1.55, 0], foliage),
    part("sphere", { radius: 0.5 }, [0.35, 1.9, 0.2], foliage),
    part("sphere", { radius: 0.45 }, [-0.35, 1.85, -0.15], foliage),
  ];

  return { label: "Tree", params: {}, parts };
}

// ---------- CAR ----------
function buildCar({ color }) {
  const body = color || "#a33b3b";
  const parts = [
    part("box", { width: 1.9, height: 0.4, depth: 0.9 }, [0, 0.35, 0], body),
    part("box", { width: 1.1, height: 0.35, depth: 0.85 }, [-0.1, 0.68, 0], body),
    part("cylinder", { radiusTop: 0.2, radiusBottom: 0.2, height: 0.18 }, [-0.65, 0.18, 0.42], "#222222", { rotation: [Math.PI / 2, 0, 0] }),
    part("cylinder", { radiusTop: 0.2, radiusBottom: 0.2, height: 0.18 }, [0.65, 0.18, 0.42], "#222222", { rotation: [Math.PI / 2, 0, 0] }),
    part("cylinder", { radiusTop: 0.2, radiusBottom: 0.2, height: 0.18 }, [-0.65, 0.18, -0.42], "#222222", { rotation: [Math.PI / 2, 0, 0] }),
    part("cylinder", { radiusTop: 0.2, radiusBottom: 0.2, height: 0.18 }, [0.65, 0.18, -0.42], "#222222", { rotation: [Math.PI / 2, 0, 0] }),
  ];
  return { label: "Car", params: {}, parts };
}

// ---------- TABLE ----------
function buildTable({ color }) {
  const wood = color || "#8a5a34";
  const parts = [
    part("box", { width: 1.4, height: 0.08, depth: 0.8 }, [0, 0.75, 0], wood),
    part("cylinder", { radiusTop: 0.05, radiusBottom: 0.05, height: 0.75 }, [-0.6, 0.375, -0.32], wood),
    part("cylinder", { radiusTop: 0.05, radiusBottom: 0.05, height: 0.75 }, [0.6, 0.375, -0.32], wood),
    part("cylinder", { radiusTop: 0.05, radiusBottom: 0.05, height: 0.75 }, [-0.6, 0.375, 0.32], wood),
    part("cylinder", { radiusTop: 0.05, radiusBottom: 0.05, height: 0.75 }, [0.6, 0.375, 0.32], wood),
  ];
  return { label: "Table", params: {}, parts };
}

// ---------- CHAIR ----------
function buildChair({ color }) {
  const c = color || "#4a4a4a";
  const parts = [
    part("box", { width: 0.5, height: 0.06, depth: 0.5 }, [0, 0.5, 0], c),
    part("box", { width: 0.5, height: 0.6, depth: 0.06 }, [0, 0.8, -0.22], c),
    part("cylinder", { radiusTop: 0.03, radiusBottom: 0.03, height: 0.5 }, [-0.2, 0.25, -0.2], c),
    part("cylinder", { radiusTop: 0.03, radiusBottom: 0.03, height: 0.5 }, [0.2, 0.25, -0.2], c),
    part("cylinder", { radiusTop: 0.03, radiusBottom: 0.03, height: 0.5 }, [-0.2, 0.25, 0.2], c),
    part("cylinder", { radiusTop: 0.03, radiusBottom: 0.03, height: 0.5 }, [0.2, 0.25, 0.2], c),
  ];
  return { label: "Chair", params: {}, parts };
}

// ---------- LAMP ----------
function buildLamp({ color }) {
  const shade = color || "#e0c168";
  const parts = [
    part("cylinder", { radiusTop: 0.06, radiusBottom: 0.09, height: 0.05 }, [0, 0.03, 0], "#2b2b2b"),
    part("cylinder", { radiusTop: 0.02, radiusBottom: 0.02, height: 1.1 }, [0, 0.6, 0], "#2b2b2b"),
    part("cone", { radiusTop: 0, radiusBottom: 0.22, height: 0.3 }, [0, 1.28, 0], shade),
  ];
  return { label: "Lamp", params: {}, parts };
}

// ---------- SIMPLE PRIMITIVES ----------
function buildSimple(shape, color) {
  const dimsMap = {
    sphere: { radius: 0.5 },
    box: { width: 1, height: 1, depth: 1 },
    cylinder: { radiusTop: 0.5, radiusBottom: 0.5, height: 1 },
    cone: { radiusTop: 0, radiusBottom: 0.5, height: 1 },
    door: { width: 0.9, height: 1.9, depth: 0.06 },
    window: { width: 0.9, height: 0.9, depth: 0.06 },
  };
  const dims = dimsMap[shape] || dimsMap.box;
  const y = shape === "door" ? dims.height / 2 : dims.height ? dims.height / 2 : dims.radius || 0.5;
  return { label: shape[0].toUpperCase() + shape.slice(1), params: {}, parts: [part(shape === "door" || shape === "window" ? "box" : shape, dims, [0, y, 0], color)] };
}

// generic fallback for anything unrecognised - a labeled block, still colored
// sensibly, so the scene never silently ignores a prompt.
function buildGeneric({ color, intent }) {
  return {
    label: intent.rawPrompt.length > 24 ? intent.rawPrompt.slice(0, 24) + "…" : intent.rawPrompt || "Object",
    params: {},
    parts: [part("box", { width: 0.8, height: 0.8, depth: 0.8 }, [0, 0.4, 0], color)],
  };
}

const BUILDERS = {
  room: (ctx) => buildRoom(ctx),
  man: (ctx) => buildMan(ctx),
  tree: (ctx) => buildTree(ctx),
  car: (ctx) => buildCar(ctx),
  table: (ctx) => buildTable(ctx),
  chair: (ctx) => buildChair(ctx),
  lamp: (ctx) => buildLamp(ctx),
  sphere: (ctx) => buildSimple("sphere", ctx.color),
  box: (ctx) => buildSimple("box", ctx.color),
  cylinder: (ctx) => buildSimple("cylinder", ctx.color),
  cone: (ctx) => buildSimple("cone", ctx.color),
  door: (ctx) => buildSimple("door", ctx.color),
  window: (ctx) => buildSimple("window", ctx.color),
  generic: (ctx) => buildGeneric(ctx),
};

function resolveBuilder(type) {
  return BUILDERS[type] || BUILDERS.generic;
}

module.exports = { resolveBuilder, BUILDERS };
