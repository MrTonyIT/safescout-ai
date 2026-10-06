const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('../mobile/node_modules/typescript');
const source = fs.readFileSync(path.join(__dirname, '../mobile/src/components/game/explorerMaze.ts'), 'utf8');
const exported = {};
vm.runInNewContext(ts.transpileModule(source, {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020}}).outputText, {exports: exported});
const {EXPLORER_TRAILS, startExplorer, moveExplorer, pointKey} = exported;
const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];

test('Every arcade trail has one start, one camp, and a legal path which wins only at the camp', () => {
  for (let level = 0; level < EXPLORER_TRAILS.length; level++) {
    const rows = EXPLORER_TRAILS[level].rows;
    assert.equal(rows.length, 5);
    assert.ok(rows.every(row => row.length === 5));
    assert.equal(rows.join('').split('S').length - 1, 1);
    assert.equal(rows.join('').split('C').length - 1, 1);
    const initial = startExplorer(level);
    const queue = [{position: initial.position, path: []}];
    const seen = new Set([pointKey(initial.position)]);
    let route;
    while (queue.length && !route) {
      const current = queue.shift();
      if (rows[current.position.y][current.position.x] === 'C') { route = current.path; break; }
      for (const [dx, dy] of directions) {
        const next = {x: current.position.x + dx, y: current.position.y + dy};
        const value = rows[next.y]?.[next.x], key = pointKey(next);
        if (!value || value === '#' || seen.has(key)) continue;
        seen.add(key);
        queue.push({position: next, path: [...current.path, [dx, dy]]});
      }
    }
    assert.ok(route?.length, `Trail ${level} must be reachable`);
    let state = initial;
    route.forEach(([dx, dy], index) => {
      state = moveExplorer(state, dx, dy);
      assert.equal(state.moves, index + 1);
      assert.equal(state.won, index === route.length - 1);
    });
    assert.equal(rows[state.position.y][state.position.x], 'C');
    assert.equal(state.feedback, 'complete');
    assert.equal(moveExplorer(state, 1, 0), state, 'Completion must not emit additional events');
    assert.equal(new Set(state.visited).size, state.visited.length);
  }
});

test('Walls, bounds, diagonal movement and teleporting never move the explorer or award a win', () => {
  const initial = startExplorer(0);
  for (const [dx, dy] of [[-1, 0], [0, -1], [0, 1], [1, 1], [4, 4], [0, 0]]) {
    const state = moveExplorer(initial, dx, dy);
    assert.equal(pointKey(state.position), pointKey(initial.position));
    assert.equal(state.moves, 0);
    assert.equal(state.won, false);
    assert.equal(state.feedback, 'blocked');
  }
});

test('Backtracking counts moves without duplicating visited cells; a new trail resets game state', () => {
  let state = moveExplorer(startExplorer(0), 1, 0);
  state = moveExplorer(state, -1, 0);
  assert.equal(state.moves, 2);
  assert.equal(state.visited.length, 2);
  const restarted = startExplorer(0, state.event + 1);
  assert.equal(restarted.moves, 0);
  assert.equal(restarted.visited.length, 1);
  assert.equal(restarted.won, false);
  assert.equal(restarted.feedback, 'restart');
});
