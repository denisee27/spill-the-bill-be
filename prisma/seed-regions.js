import { PrismaClient } from '@prisma/client';
import https from 'https';

const prisma = new PrismaClient();

const BASE = 'https://raw.githubusercontent.com/guzfirdaus/Wilayah-Administrasi-Indonesia/master/csv';

function fetchCSV(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function parseCSV(text) {
  const lines = text.trim().split('\n').slice(1); // skip header
  return lines.map((line) => {
    // handle quoted fields
    const cols = [];
    let cur = '';
    let inQ = false;
    for (const ch of line) {
      if (ch === '"') { inQ = !inQ; continue; }
      if (ch === ';' && !inQ) { cols.push(cur.trim()); cur = ''; continue; }
      cur += ch;
    }
    cols.push(cur.trim());
    return cols;
  });
}

async function batchInsert(table, data, batchSize = 500) {
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    if (table === 'reg_provinces') {
      await prisma.$executeRawUnsafe(
        `INSERT INTO reg_provinces (id, name) VALUES ${batch.map(() => '(?,?)').join(',')} ON CONFLICT DO NOTHING`,
        ...batch.flat()
      );
    } else if (table === 'reg_regencies') {
      await prisma.$executeRawUnsafe(
        `INSERT INTO reg_regencies (id, province_id, name) VALUES ${batch.map(() => '(?,?,?)').join(',')} ON CONFLICT DO NOTHING`,
        ...batch.flat()
      );
    } else if (table === 'reg_districts') {
      await prisma.$executeRawUnsafe(
        `INSERT INTO reg_districts (id, regency_id, name) VALUES ${batch.map(() => '(?,?,?)').join(',')} ON CONFLICT DO NOTHING`,
        ...batch.flat()
      );
    } else if (table === 'reg_villages') {
      await prisma.$executeRawUnsafe(
        `INSERT INTO reg_villages (id, district_id, name) VALUES ${batch.map(() => '(?,?,?)').join(',')} ON CONFLICT DO NOTHING`,
        ...batch.flat()
      );
    }
    process.stdout.write(`\r${table}: ${Math.min(i + batchSize, data.length)}/${data.length}`);
  }
  console.log();
}

async function main() {
  console.log('Seeding Indonesian region data...\n');

  // Check if already fully seeded
  const [provCount, regCount] = await Promise.all([
    prisma.regProvince.count(),
    prisma.regRegency.count(),
  ]);
  if (provCount > 0 && regCount > 0) {
    console.log(`Already seeded (${provCount} provinces, ${regCount} regencies). Skipping.`);
    return;
  }

  console.log('Fetching provinces...');
  const provCsv = await fetchCSV(`${BASE}/provinces.csv`);
  const provinces = parseCSV(provCsv).map(([id, name]) => [id, name]);

  console.log('Fetching regencies...');
  const regCsv = await fetchCSV(`${BASE}/regencies.csv`);
  const regencies = parseCSV(regCsv).map(([id, pid, name]) => [id, pid, name]);

  console.log('Fetching districts...');
  const distCsv = await fetchCSV(`${BASE}/districts.csv`);
  const districts = parseCSV(distCsv).map(([id, rid, name]) => [id, rid, name]);

  console.log('Fetching villages...');
  const vilCsv = await fetchCSV(`${BASE}/villages.csv`);
  const villages = parseCSV(vilCsv).map(([id, did, name]) => [id, did, name]);

  console.log(`\nInserting: ${provinces.length} provinces, ${regencies.length} regencies, ${districts.length} districts, ${villages.length} villages`);

  // PostgreSQL uses $1 $2 placeholders, not ?
  // Use createMany instead for simpler API
  console.log('Inserting provinces...');
  await prisma.regProvince.createMany({
    data: provinces.map(([id, name]) => ({ id, name })),
    skipDuplicates: true,
  });

  console.log('Inserting regencies...');
  for (let i = 0; i < regencies.length; i += 500) {
    const batch = regencies.slice(i, i + 500);
    await prisma.regRegency.createMany({
      data: batch.map(([id, provinceId, name]) => ({ id, provinceId, name })),
      skipDuplicates: true,
    });
    process.stdout.write(`\rregencies: ${Math.min(i + 500, regencies.length)}/${regencies.length}`);
  }
  console.log();

  console.log('Inserting districts...');
  for (let i = 0; i < districts.length; i += 500) {
    const batch = districts.slice(i, i + 500);
    await prisma.regDistrict.createMany({
      data: batch.map(([id, regencyId, name]) => ({ id, regencyId, name })),
      skipDuplicates: true,
    });
    process.stdout.write(`\rdistricts: ${Math.min(i + 500, districts.length)}/${districts.length}`);
  }
  console.log();

  console.log('Inserting villages...');
  for (let i = 0; i < villages.length; i += 1000) {
    const batch = villages.slice(i, i + 1000);
    await prisma.regVillage.createMany({
      data: batch.map(([id, districtId, name]) => ({ id, districtId, name })),
      skipDuplicates: true,
    });
    process.stdout.write(`\rvillages: ${Math.min(i + 1000, villages.length)}/${villages.length}`);
  }
  console.log();

  console.log('\nDone!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
