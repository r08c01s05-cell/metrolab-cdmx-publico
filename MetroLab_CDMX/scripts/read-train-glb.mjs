import fs from 'node:fs';
import zlib from 'node:zlib';
export function readTrainGLB(path){
 return fs.existsSync(path)?fs.readFileSync(path):zlib.gunzipSync(fs.readFileSync(path+'.gz'));
}
