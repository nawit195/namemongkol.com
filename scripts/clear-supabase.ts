#!/usr/bin/env node

console.error(
  [
    "scripts/clear-supabase.ts is deprecated because it was too broad and could drop app data without inventory or storage safeguards.",
    'Use "node scripts/reset-supabase.mjs" instead.',
  ].join(" "),
);
process.exit(1);
