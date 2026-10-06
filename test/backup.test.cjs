const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),{randomBytes}=require('node:crypto');
const {PrismaClient}=require('@prisma/client');
const {backup,restore}=require('../scripts/encrypted-backup.cjs');
test('Operations: live SQLite backup encrypts, authenticates and restores without overwriting',async()=>{
  fs.mkdirSync('scratch',{recursive:true});const dir=fs.mkdtempSync(path.resolve('scratch/backup-test-'));
  const file=path.join(dir,'source.db');fs.writeFileSync(file,'');
  const url='file:'+file.replaceAll('\\','/'),client=new PrismaClient({datasources:{db:{url}}});
  const key=randomBytes(32).toString('hex'),encrypted=path.join(dir,'snapshot.milobak'),restored=path.join(dir,'restored.db');
  try{
    await client.$executeRawUnsafe('CREATE TABLE example (value TEXT)');await client.$executeRawUnsafe('INSERT INTO example VALUES (?)','synthetic private record');
    await backup(url,encrypted,key);assert.ok(!fs.readFileSync(encrypted).includes(Buffer.from('synthetic private record')));
    await client.$executeRawUnsafe('DELETE FROM example');
    await assert.rejects(restore(encrypted,path.join(dir,'wrong.db'),randomBytes(32).toString('hex')));assert.equal(fs.existsSync(path.join(dir,'wrong.db')),false);
    assert.equal((await restore(encrypted,restored,key)).integrity,'ok');
    await assert.rejects(restore(encrypted,restored,key),/NEW output/);
    const check=new PrismaClient({datasources:{db:{url:'file:'+restored.replaceAll('\\','/')}}});
    try{assert.equal((await check.$queryRawUnsafe('SELECT value FROM example'))[0].value,'synthetic private record');}finally{await check.$disconnect();}
  }finally{await client.$disconnect();}
});
