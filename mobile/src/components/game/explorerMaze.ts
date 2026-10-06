export type MazePoint = {x: number; y: number};
export const EXPLORER_TRAILS = [
  {name: 'Lối qua vườn cây', rows: ['S...#', '###.#', '#...#', '#.###', '#...C']},
  {name: 'Ngã rẽ nhỏ', rows: ['S#...', '.#.#.', '...#.', '##.#.', 'C....']},
  {name: 'Vòng quanh khu rừng', rows: ['..#C.', '.#.#.', '...#.', '.###.', 'S....']},
] as const;

export type ArcadeFeedback = 'move' | 'blocked' | 'complete' | 'restart';
export type ExplorerState = {
  level: number;
  position: MazePoint;
  visited: string[];
  moves: number;
  won: boolean;
  message: string;
  event: number;
  feedback: ArcadeFeedback;
};
export const pointKey = ({x, y}: MazePoint) => `${x},${y}`;
export function startExplorer(level = 0, event = 0): ExplorerState {
  const index = Math.max(0, Math.min(EXPLORER_TRAILS.length - 1, level));
  const rows = EXPLORER_TRAILS[index].rows;
  const y = rows.findIndex(row => row.includes('S'));
  const position = {x: rows[y].indexOf('S'), y};
  return {level: index, position, visited: [pointKey(position)], moves: 0, won: false, message: 'Tìm đường tới chiếc lều. Mỗi lần đi một ô cạnh nhau.', event, feedback: 'restart'};
}
export function moveExplorer(state: ExplorerState, dx: number, dy: number): ExplorerState {
  if (state.won) return state;
  const rows = EXPLORER_TRAILS[state.level].rows;
  const position = {x: state.position.x + dx, y: state.position.y + dy};
  const cell = rows[position.y]?.[position.x];
  if (Math.abs(dx) + Math.abs(dy) !== 1 || !cell || cell === '#') {
    return {...state, message: 'Chỗ này không có lối đi. Thử một ô đường bên cạnh nhé.', event: state.event + 1, feedback: 'blocked'};
  }
  const won = cell === 'C', key = pointKey(position);
  return {...state, position, visited: state.visited.includes(key) ? state.visited : [...state.visited, key], moves: state.moves + 1, won,
    message: won ? 'Con đã tìm được đường tới trại!' : `Đã tới hàng ${position.y + 1}, cột ${position.x + 1}.`,
    event: state.event + 1, feedback: won ? 'complete' : 'move'};
}
