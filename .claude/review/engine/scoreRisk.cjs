'use strict';
const { minimatch } = require('minimatch');

const OPTS = { dot: true };

function isExcluded(file, config) {
  return (config.excluded_paths || []).some((g) => minimatch(file, g, OPTS));
}

function patternPoints(file, config) {
  let max = 0;
  for (const p of config.risk.patterns) {
    if (minimatch(file, p.glob, OPTS)) max = Math.max(max, p.points);
  }
  return max;
}

function volumePoints(linesChanged, config) {
  for (const v of config.risk.volume_multiplier) {
    if (v.upTo === null || linesChanged <= v.upTo) return v.points;
  }
  return 0;
}

function levelFor(score, config) {
  for (const l of config.risk.levels) {
    const [min, max] = l.range;
    if (score >= min && (max === null || score <= max)) return l;
  }
  return config.risk.levels[config.risk.levels.length - 1];
}

function scoreRisk({ files, linesChanged, scope = 'single_feature', special = [] }, config) {
  const reviewed = files.filter((f) => !isExcluded(f, config));
  const patternScore = reviewed.reduce((s, f) => s + patternPoints(f, config), 0);
  const volumeScore = volumePoints(linesChanged, config);
  const specialMap = new Map(config.risk.special.map((s) => [s.when, s.points]));
  const specialScore = special.reduce((s, k) => s + (specialMap.get(k) || 0), 0);
  const subtotal = patternScore + volumeScore + specialScore;
  const scopeMultiplier = config.risk.scope_multiplier[scope] ?? 1.0;
  const score = Math.round(subtotal * scopeMultiplier);
  const lvl = levelFor(score, config);
  return {
    score,
    level: lvl.level,
    reviewer: lvl.reviewer,
    factors: { patternScore, volumeScore, specialScore, scopeMultiplier, subtotal },
  };
}

module.exports = { scoreRisk, isExcluded, patternPoints, volumePoints, levelFor };
