import { Platform } from 'react-native';
export function downloadJson(name:string,data:unknown):boolean {
  if(Platform.OS!=='web'||typeof document==='undefined')return false;
  const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download=name;a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);return true;
}
