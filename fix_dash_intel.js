import fs from 'fs';

let code = fs.readFileSync('api/dashboard.js', 'utf8');

const targetStr = `          feed.innerHTML = records.slice(0, 3).map(pr => 
            '<div class="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5"><div><div class="text-sm font-bold">PR #' + pr.prNumber + '</div><div class="text-[10px] text-gray-500">' + pr.repo + '</div></div><div class="text-xs font-black text-emerald-400">' + (pr.healthScore || 100) + '%</div></div>'
          ).join('');`;

const replacementStr = `          feed.innerHTML = records.slice(0, 3).map(pr => {
            const impact = pr.blastRadius && pr.blastRadius.length > 0 ? '<div class="text-[9px] text-rose-400 mt-1 italic">Impact: ' + pr.blastRadius.join(', ') + '</div>' : '';
            return '<div class="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5"><div><div class="text-sm font-bold">PR #' + pr.prNumber + '</div><div class="text-[10px] text-gray-500">' + pr.repo + '</div>' + impact + '</div><div class="text-xs font-black text-emerald-400">' + (pr.healthScore || 100) + '%</div></div>';
          }).join('');`;

// Clean line endings for matching
const cleanTarget = targetStr.replace(/\r\n/g, '\n');
const cleanReplacement = replacementStr.replace(/\r\n/g, '\n');
const cleanCode = code.replace(/\r\n/g, '\n');

if (cleanCode.includes(cleanTarget)) {
  const newCode = cleanCode.replace(cleanTarget, cleanReplacement);
  fs.writeFileSync('api/dashboard.js', newCode);
  console.log('Dashboard Intel Updated');
} else {
  console.error('Error: Could not find target string in api/dashboard.js');
  process.exit(1);
}
