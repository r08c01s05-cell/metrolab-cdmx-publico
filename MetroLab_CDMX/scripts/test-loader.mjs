import {pathToFileURL} from 'node:url';
export async function resolve(specifier,context,next){if(specifier==='three')return{url:pathToFileURL(process.cwd()+'/dist/vendor/three.module.js').href,shortCircuit:true};return next(specifier,context);}
