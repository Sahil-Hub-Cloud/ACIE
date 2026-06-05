import fs from 'fs';
let code = fs.readFileSync('api/dashboard.js', 'utf8');

// Clean line endings for matching
code = code.replace(/\r\n/g, '\n');

// Replace Issues Card with Dependency Risk Card
const oldIssues = "document.getElementById('issue-val').innerText = latest.issues || 0;";
const newIssues = "document.getElementById('issue-val').innerText = latest.dependencyRisk || 'LOW'; " +
                  "document.getElementById('issue-val').className = 'text-2xl font-black ' + (latest.dependencyRisk === 'CRITICAL' ? 'text-rose-500' : 'text-orange-500');";

if (code.includes(oldIssues)) {
  code = code.replace(oldIssues, newIssues);
}

code = code.replace(">Issues</div>", ">Dep. Risk</div>");

// Update Feed to show Top Dependencies cleanly
const oldFeedMap = `          feed.innerHTML = records.slice(0, 5).map(pr => {
            const sys = pr.impactedSystems && pr.impactedSystems.length > 0 ? pr.impactedSystems.join(', ') : 'General';
            const sevColor = pr.severity === 'CRITICAL' ? 'text-rose-500' : pr.severity === 'HIGH' ? 'text-orange-500' : 'text-emerald-400';
            const files = pr.impactedFiles || [];
            return '<div class="p-4 bg-white/5 rounded-xl border border-white/5 mb-2">' +
                   '<div class="flex justify-between"><span class="text-xs font-bold">PR #' + pr.prNumber + '</span>' +
                   '<span class="text-[10px] font-black ' + sevColor + '">' + pr.severity + '</span></div>' +
                   '<div class="text-[10px] text-gray-500 mt-1">Systems: ' + sys + '</div>' +
                   '<div class="text-[9px] text-gray-600 truncate mt-1 italic">' + files.join(', ') + '</div></div>';
          }).join('');`;

const newFeedMap = `          feed.innerHTML = records.slice(0, 5).map(pr => {
            const sys = pr.impactedSystems && pr.impactedSystems.length > 0 ? pr.impactedSystems.join(', ') : 'General';
            const files = pr.impactedFiles || [];
            const deps = pr.dependentFiles && pr.dependentFiles.length > 0 ? '<div class="text-[8px] text-indigo-300 mt-1 uppercase tracking-tighter font-bold">Downstream: ' + pr.dependentFiles.join(', ') + '</div>' : '';
            return '<div class="p-4 bg-white/5 rounded-xl border border-white/5 mb-2">' +
                   '<div class="flex justify-between"><span class="text-xs font-bold">PR #' + pr.prNumber + '</span>' +
                   '<span class="text-[10px] font-black text-rose-500">' + (pr.dependencyCount || 0) + ' DEPS</span></div>' + deps +
                   '<div class="text-[10px] text-gray-500 mt-1">Systems: ' + sys + '</div>' +
                   '<div class="text-[9px] text-gray-600 truncate mt-1 italic">' + files.join(', ') + '</div></div>';
          }).join('');`;

if (code.includes(oldFeedMap)) {
  code = code.replace(oldFeedMap, newFeedMap);
}

fs.writeFileSync('api/dashboard.js', code);
console.log('✅ DASHBOARD_PROPAGATION_UPGRADED');
