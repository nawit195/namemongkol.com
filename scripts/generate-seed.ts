import fs from 'fs';
import path from 'path';

const inputPath = path.join(process.cwd(), 'src/data/premiumNamesRaw.ts');
const outputPath = path.join(process.cwd(), 'scripts/seed-premium-names.sql');

const content = fs.readFileSync(inputPath, 'utf8');
const match = content.match(/export\s+const\s+premiumNamesRaw\s*=\s*`([\s\S]*?)`;/);

if (match) {
    const lines = match[1]
        .split('\n')
        .map(l => l.trim().replace(/'/g, "''")) // Escape SQL single quotes
        .filter(l => l.length > 0 && !l.startsWith('//'));

    // Chunking to avoid massive single insert size if needed, but 3000 is fine
    const values = lines.map(name => `('${name}')`).join(',\n');
    const sql = `INSERT INTO premium_names (name) VALUES \n${values}\nON CONFLICT (name) DO NOTHING;`;

    fs.writeFileSync(outputPath, sql);
    console.log(`Generated ${outputPath} with ${lines.length} names.`);
} else {
    console.log('Failed to parse premiumNamesRaw');
}
