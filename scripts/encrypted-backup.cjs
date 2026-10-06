const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {PrismaClient}=require('@prisma/client');
const MAGIC=Buffer.from('MILOBK01');
function keyFrom(value){if(!/^[a-fA-F0-9]{64}$/.test(value||''))throw Error('BACKUP_KEY must be 32 random bytes encoded as 64 hex characters.');return Buffer.from(value,'hex');}
async function backup(databaseUrl,output,keyValue){
  if(!databaseUrl?.startsWith('file:'))throw Error('An explicit SQLite DATABASE_URL is required.');
  const key=keyFrom(keyValue),target=path.resolve(output);
  if(fs.existsSync(target))throw Error('Output already exists; will not overwrite.');
  const dir=fs.mkdtempSync(path.join(path.dirname(target),'.milo-backup-'));
  const snapshot=path.join(dir,'snapshot.db');
  const client=new PrismaClient({datasources:{db:{url:databaseUrl}}});
  try{
    // SQLite produces a consistent snapshot even when the source has active readers/writers.
    await client.$executeRawUnsafe('VACUUM INTO ?',snapshot.replaceAll('\\','/'));
    const iv=crypto.randomBytes(12),cipher=crypto.createCipheriv('aes-256-gcm',key,iv);
    cipher.setAAD(MAGIC);
    const encrypted=Buffer.concat([cipher.update(fs.readFileSync(snapshot)),cipher.final()]);
    fs.writeFileSync(target,Buffer.concat([MAGIC,iv,cipher.getAuthTag(),encrypted]),{flag:'wx',mode:0o600});
    return {bytes:fs.statSync(target).size};
  }finally{
    await client.$disconnect();
    if(fs.existsSync(snapshot))fs.unlinkSync(snapshot);
    fs.rmdirSync(dir);
  }
}
async function restore(input,output,keyValue){
  const key=keyFrom(keyValue),raw=fs.readFileSync(input),target=path.resolve(output);
  if(raw.length<36||!raw.subarray(0,8).equals(MAGIC))throw Error('Unsupported backup file.');
  if(fs.existsSync(target))throw Error('Restore needs a NEW output path.');
  const decipher=crypto.createDecipheriv('aes-256-gcm',key,raw.subarray(8,20));
  decipher.setAAD(MAGIC);decipher.setAuthTag(raw.subarray(20,36));
  const clear=Buffer.concat([decipher.update(raw.subarray(36)),decipher.final()]);
  if(clear.subarray(0,16).toString()!=='SQLite format 3\0')throw Error('Not a SQLite snapshot.');
  fs.writeFileSync(target,clear,{flag:'wx',mode:0o600});
  const client=new PrismaClient({datasources:{db:{url:'file:'+target.replaceAll('\\','/')}}});
  try{
    const check=await client.$queryRawUnsafe('PRAGMA integrity_check');
    if(check.length!==1||Object.values(check[0])[0]!=='ok')throw Error('Restored database failed integrity check.');
    return {integrity:'ok'};
  }finally{await client.$disconnect();}
}
module.exports={backup,restore};
if(require.main===module){
  const [command,first,second]=process.argv.slice(2);
  const task=command==='backup'?backup(process.env.DATABASE_URL,first,process.env.BACKUP_KEY):command==='restore'?restore(first,second,process.env.BACKUP_KEY):Promise.reject(Error('Usage: encrypted-backup.cjs backup NEW_FILE | restore BACKUP NEW_DB'));
  task.then(result=>console.log(JSON.stringify(result))).catch(e=>{console.error(e.message);process.exitCode=1;});
}
