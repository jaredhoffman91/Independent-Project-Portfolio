// ODI_DATA is loaded from odi-data.js

// ---------- Draft board (top 10) ----------
function renderBoard() {
  const board = document.getElementById('draft-board');
  const top10 = [...ODI_DATA].sort((a, b) => b.efficiency8 - a.efficiency8).slice(0, 10);
  const maxEff = top10[0].efficiency8;

  board.innerHTML = top10.map(row => `
    <div class="board-row">
      <div class="pick"><span class="num">${String(row.rank).padStart(2, '0')}</span>pick</div>
      <div class="team-bar-wrap">
        <div class="team-name">${row.team}</div>
        <div class="bar-track"><div class="bar-fill" style="width:${(row.efficiency8 / maxEff * 100).toFixed(0)}%"></div></div>
      </div>
      <div class="eff">${row.efficiency8.toFixed(1)}</div>
    </div>
  `).join('');
}

// ---------- Development Credit vs In-Org Credit toggle ----------
const TOGGLE_TEAMS = ['Nashville Predators', 'Washington Capitals', 'Anaheim Ducks', 'Dallas Stars'];

function renderToggle(mode) {
  const container = document.getElementById('toggle-example');
  const note = document.getElementById('toggle-note');
  const rows = TOGGLE_TEAMS.map(name => ODI_DATA.find(d => d.team === name)).filter(Boolean);

  container.innerHTML = rows.map(r => {
    const val = mode === 'dev' ? r.efficiency8 : r.inorg8;
    return `
      <div class="toggle-team-row">
        <span class="name">${r.team}</span>
        <span class="val mono">${val.toFixed(1)}</span>
      </div>
    `;
  }).join('');

  note.textContent = mode === 'dev'
    ? 'Full credit to the drafting team, regardless of trades.'
    : 'Credit only for value produced while the player was actually on the roster. Nashville and Washington both drop sharply; Dallas actually rises, meaning more of its value happened in-house.';
}

document.querySelectorAll('.toggle-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderToggle(btn.dataset.mode);
  });
});

// ---------- Full sortable / searchable table ----------
let currentSort = { key: 'efficiency8', dir: 'desc' };
let searchTerm = '';

function fmtCell(val) {
  if (val === null || val === undefined) return '<td class="na">—</td>';
  if (typeof val === 'number') return `<td class="num">${val.toFixed(2)}</td>`;
  return `<td class="team-cell">${val}</td>`;
}

function renderTable() {
  const tbody = document.getElementById('table-body');
  let rows = [...ODI_DATA];

  if (searchTerm) {
    rows = rows.filter(r => r.team.toLowerCase().includes(searchTerm.toLowerCase()));
  }

  rows.sort((a, b) => {
    let av = a[currentSort.key], bv = b[currentSort.key];
    if (av === null) av = -Infinity;
    if (bv === null) bv = -Infinity;
    if (typeof av === 'string') return currentSort.dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    return currentSort.dir === 'asc' ? av - bv : bv - av;
  });

  tbody.innerHTML = rows.map(r => `
    <tr>
      <td class="num">${r.rank}</td>
      ${fmtCell(r.team)}
      ${fmtCell(r.efficiency8)}
      ${fmtCell(r.inorg8)}
      ${fmtCell(r.defense)}
      ${fmtCell(r.forward)}
      ${fmtCell(r.goalie)}
      ${fmtCell(r.lateRound)}
    </tr>
  `).join('');
}

document.querySelectorAll('#odi-table th').forEach(th => {
  th.addEventListener('click', () => {
    const key = th.dataset.key;
    if (currentSort.key === key) {
      currentSort.dir = currentSort.dir === 'asc' ? 'desc' : 'asc';
    } else {
      currentSort.key = key;
      currentSort.dir = 'desc';
    }
    document.querySelectorAll('#odi-table th').forEach(h => h.classList.remove('sorted', 'asc'));
    th.classList.add('sorted');
    if (currentSort.dir === 'asc') th.classList.add('asc');
    renderTable();
  });
});

document.getElementById('team-search').addEventListener('input', (e) => {
  searchTerm = e.target.value;
  renderTable();
});

// ---------- Init ----------
renderBoard();
renderToggle('dev');
renderTable();
