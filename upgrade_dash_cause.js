import fs from 'fs';
let code = fs.readFileSync('api/dashboard.js', 'utf8');

// Clean line endings
code = code.replace(/\r\n/g, '\n');

// Replace Quality Card with Root Cause Card
const oldQual = "document.getElementById('qual-val').innerText = (latest.qualityScore || 100) + \"%\";";
const newQual = "document.getElementById('qual-val').innerText = latest.confidence || 'NONE'; " +
                "document.getElementById('qual-val').className = 'text-xl font-black ' + (latest.confidence === 'HIGH' ? 'text-rose-500' : 'text-cyan-400');";

if (code.includes(oldQual)) {
  code = code.replace(oldQual, newQual);
}

code = code.replace(">Quality</div>", ">Cause Confidence</div>");

// Update Feed to show Root Cause and Fix cleanly
const oldFeedMap = `          feed.innerHTML = records.slice(0, 5).map(pr => {
            const sys = pr.impactedSystems && pr.impactedSystems.length > 0 ? pr.impactedSystems.join(', ') : 'General';
            const files = pr.impactedFiles || [];
            const deps = pr.dependentFiles && pr.dependentFiles.length > 0 ? '<div class="text-[8px] text-indigo-300 mt-1 uppercase tracking-tighter font-bold">Downstream: ' + pr.dependentFiles.join(', ') + '</div>' : '';
            return '<div class="p-4 bg-white/5 rounded-xl border border-white/5 mb-2">' +
                   '<div class="flex justify-between"><span class="text-xs font-bold">PR #' + pr.prNumber + '</span>' +
                   '<span class="text-[10px] font-black text-rose-500">' + (pr.dependencyCount || 0) + ' DEPS</span></div>' + deps +
                   '<div class="text-[10px] text-gray-500 mt-1">Systems: ' + sys + '</div>' +
                   '<div class="text-[9px] text-gray-600 truncate mt-1 italic">' + files.join(', ') + '</div></div>';
          }).join('');`;

const newFeedMap = `          feed.innerHTML = records.slice(0, 5).map(pr => {
            const sys = pr.impactedSystems && pr.impactedSystems.length > 0 ? pr.impactedSystems.join(', ') : 'General';
            const files = pr.impactedFiles || [];
            const deps = pr.dependentFiles && pr.dependentFiles.length > 0 ? '<div class="text-[8px] text-indigo-300 mt-1 uppercase tracking-tighter font-bold">Downstream: ' + pr.dependentFiles.join(', ') + '</div>' : '';
            const cause = pr.rootCause && pr.rootCause !== 'None Detected' ? 
              '<div class="mt-3 p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg">' +
              '<div class="text-[10px] text-rose-400 font-bold uppercase">Root Cause: ' + pr.rootCause + '</div>' +
              '<div class="text-[9px] text-gray-400 italic">Fix: ' + pr.suggestedFix + '</div></div>' : '';
            return '<div class="p-4 bg-white/5 rounded-xl border border-white/5 mb-2">' +
                   '<div class="flex justify-between"><span class="text-xs font-bold">PR #' + pr.prNumber + '</span>' +
                   '<span class="text-[10px] font-black text-cyan-400">AUDIT COMPLETE</span></div>' +
                   cause + deps +
                   '<div class="text-[10px] text-gray-500 mt-1">Systems: ' + sys + '</div>' +
                   '<div class="text-[9px] text-gray-600 truncate mt-1 italic">' + files.join(', ') + '</div></div>';
          }).join('');`;

if (code.includes(oldFeedMap)) {
  code = code.replace(oldFeedMap, newFeedMap);
}

fs.writeFileSync('api/dashboard.js', code);
console.log('✅ DASHBOARD_CAUSE_UPGRADED');
