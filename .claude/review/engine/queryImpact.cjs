'use strict';

function queryImpact(changedFiles, graph, opts = {}) {
  const maxDepth = opts.maxDepth ?? 3;
  const maxNodes = opts.maxNodes ?? 200;
  const importedBy = graph.importedBy || {};
  const changedSet = new Set(changedFiles);

  const directDependents = {};
  for (const f of changedFiles) {
    directDependents[f] = (importedBy[f] || []).filter((d) => !changedSet.has(d));
  }

  const visited = new Set();
  let truncated = false;
  let frontier = [...changedFiles];
  for (let depth = 0; depth < maxDepth && frontier.length; depth++) {
    const next = [];
    for (const f of frontier) {
      for (const dep of importedBy[f] || []) {
        if (changedSet.has(dep) || visited.has(dep)) continue;
        if (visited.size >= maxNodes) {
          truncated = true;
          break;
        }
        visited.add(dep);
        next.push(dep);
      }
      if (truncated) break;
    }
    if (truncated) break;
    frontier = next;
  }

  const transitiveDependents = [...visited];
  const topImpacted = changedFiles
    .map((f) => ({ file: f, dependentCount: directDependents[f].length }))
    .sort((a, b) => b.dependentCount - a.dependentCount);

  return { directDependents, transitiveDependents, blastRadius: transitiveDependents.length, topImpacted, truncated };
}

module.exports = { queryImpact };
