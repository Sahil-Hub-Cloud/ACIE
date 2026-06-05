import fs from 'fs';
const BIN = '6a212bb4da38895dfe8514a5';
const KEY = '$2a$10$OLH.A4d17J6/.mDf9XtqwuT0jtdNQpLP74RT1aDXXnEUFB6ry0Q/u';

let code = fs.readFileSync('api/dashboard.js', 'utf8');

// Update Row UI
const oldRow = `          feed.innerHTML = records.slice(0, 3).map(pr => {
            const impact = pr.blastRadius && pr.blastRadius.length > 0 ? '<div class="text-[9px] text-rose-400 mt-1 italic">Impact: ' + pr.blastRadius.join(', ') + '</div>' : '';
            return '<div class="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5"><div><div class="text-sm font-bold">PR #' + pr.prNumber + '</div><div class="text-[10px] text-gray-500">' + pr.repo + '</div>' + impact + '</div><div class="text-xs font-black text-emerald-400">' + (pr.healthScore || 100) + '%</div></div>';
          }).join('');`;

const newRow = `          feed.innerHTML = records.slice(0, 5).map(pr => {
            const sys = pr.impactedSystems && pr.impactedSystems.length > 0 ? pr.impactedSystems.join(', ') : 'General';
            const sevColor = pr.severity === 'CRITICAL' ? 'text-rose-500' : pr.severity === 'HIGH' ? 'text-orange-500' : 'text-emerald-400';
            const files = pr.impactedFiles || [];
            return '<div class="p-4 bg-white/5 rounded-xl border border-white/5 mb-2">' +
                   '<div class="flex justify-between"><span class="text-xs font-bold">PR #' + pr.prNumber + '</span>' +
                   '<span class="text-[10px] font-black ' + sevColor + '">' + pr.severity + '</span></div>' +
                   '<div class="text-[10px] text-gray-500 mt-1">Systems: ' + sys + '</div>' +
                   '<div class="text-[9px] text-gray-600 truncate mt-1 italic">' + files.join(', ') + '</div></div>';
          }).join('');`;

// Clean line endings for matching
const cleanOldRow = oldRow.replace(/\r\n/g, '\n');
const cleanNewRow = newRow.replace(/\r\n/g, '\n');
const cleanCode = code.replace(/\r\n/g, '\n');

if (cleanCode.includes(cleanOldRow)) {
  code = cleanCode.replace(cleanOldRow, cleanNewRow);
} else {
  console.error('Error: Could not find oldRow in api/dashboard.js');
  process.exit(1);
}

// Update Severity Card
const oldSev = "document.getElementById('health-val').innerText = (latest.healthScore || 100) + \"%\";";
const newSev = oldSev + " document.getElementById('health-val').innerText = latest.severity || 'LOW'; document.getElementById('health-val').className = 'text-4xl font-black ' + (latest.severity === 'CRITICAL' ? 'text-rose-500' : 'text-cyan-400');";

if (code.includes(oldSev)) {
  code = code.replace(oldSev, newSev);
} else {
  console.error('Error: Could not find oldSev in api/dashboard.js');
  process.exit(1);
}

fs.writeFileSync('api/dashboard.js', code);
console.log('✅ DASHBOARD_INTELLIGENCE_UPGRADED');
