// Isolated audit reproductions: no live API requests, database writes or messages.
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
require('../../node_modules/ts-node/register/transpile-only');
const originalLoad = Module._load;
Module._load = function(name, ...rest) {
  if (name === 'react-native') return {Platform:{OS:'web'}};
  return originalLoad.call(this,name,...rest);
};
const storage = new Map();
global.window = {localStorage:{setItem:(k,v)=>storage.set(k,v),getItem:k=>storage.get(k)||null}};
process.env.GEMINI_API_KEY = '';
const api = require('../../mobile/src/services/api');
api.apiClient.defaults.adapter = async () => { throw Error('AUDIT_SIMULATED_OFFLINE'); };
const results = [];
const record = (name, observed) => results.push({name,observed});
(async () => {
  const r = await api.submitTestAnswers('synthetic-checkpoint','synthetic-user',[{questionId:'q1',selectedOptionId:'wrong_b'},{questionId:'q2',selectedOptionId:'wrong_c'}],12);
  record('All wrong offline submission',{score:r.score,isPassed:r.isPassed,correctCount:r.correctCount});
  record('Offline PIN 0000 accepted',await api.verifyParentPin('0000','synthetic-user'));
  record('Offline PIN change reports success',await api.updateParentPin('0000','9876','synthetic-user'));
  record('New offline PIN accepted',await api.verifyParentPin('9876','synthetic-user'));
  const storageModule = require.resolve('../../mobile/src/services/offlineStorage');
  let inventory = require(storageModule).offlineStorage;
  await inventory.addShardToBadge(8,1);
  record('Badge zone 8 before reload',(await inventory.getBadgeInventory()).find(b=>b.zoneNumber===8).shardsCollected);
  delete require.cache[storageModule]; inventory = require(storageModule).offlineStorage;
  record('Badge zone 8 after reload',(await inventory.getBadgeInventory()).find(b=>b.zoneNumber===8).shardsCollected);
  record('Offline handbook zones',(await inventory.getSurvivalHandbook()).length);
  const {streakService} = require('../../mobile/src/services/streakService');
  const before = streakService.getStreakData().currentStreak;
  streakService.completeDailyDrill();streakService.completeDailyDrill();
  record('Two completions same day',{before,after:streakService.getStreakData().currentStreak});
  const {AiService} = require('../../src/modules/ai/ai.service');
  const ai = new AiService();
  record('Offline AI scan',(await ai.scanEnvironment(Buffer.from('synthetic'),'image/jpeg')).hazardLevel);
  const {ParentService} = require('../../src/modules/parent/parent.service');
  const bcrypt = require('../../node_modules/bcrypt');
  const hash = await bcrypt.hash('9876',4);
  record('Server master PIN accepted',await new ParentService({parentGate:{findUnique:async()=>({pinHash:hash})}}).verifyPin('synthetic-user','1234'));
  for (const name of ['icon.png','splash.png','adaptive-icon.png','favicon.png','milo_rescue_pup.png']) {
    const bytes = fs.readFileSync(path.join(__dirname,'../../mobile/assets',name));
    record(`PNG ${name}`,{width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20),bytes:bytes.length});
  }
  fs.writeFileSync(path.join(__dirname,'core-results.json'),JSON.stringify(results,null,2));
  console.log(JSON.stringify(results,null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
