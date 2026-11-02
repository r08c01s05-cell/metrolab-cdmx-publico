import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';import {repairMarkup92}from'./verificar_repair87.mjs';
const voidTags=new Set(['input','meta','link','img','br','hr','source','path']);
class Element{
 constructor(tag,attrs={}){this.tagName=tag.toUpperCase();this.attrs=attrs;this.children=[];this.dataset={};this.style={};for(const[k,v]of Object.entries(attrs))if(k.startsWith('data-'))this.dataset[k.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=v;this.hidden='hidden'in attrs;this._text='';}
 get className(){return this.attrs.class||'';}set className(s){this.attrs.class=s;}
 get nextSibling(){return this.parentElement?.children[this.parentElement.children.indexOf(this)+1]||null;}
 remove(){if(this.parentElement)this.parentElement.children.splice(this.parentElement.children.indexOf(this),1);this.parentElement=null;}
 append(...nodes){for(const n of nodes){n.remove();this.children.push(n);n.parentElement=this;}}
 prepend(n){this.insertBefore(n,this.children[0]||null);}
 insertBefore(n,ref){if(ref&&ref.parentElement!==this)throw Error('Invalid reference in '+this.tagName);n.remove();const index=ref?this.children.indexOf(ref):this.children.length;this.children.splice(index,0,n);n.parentElement=this;}
 set textContent(v){this._text=String(v);this.children=[];}get textContent(){return this._text+this.children.map(c=>c.textContent).join('');}
 set innerHTML(s){this.children=[];for(const n of parse(s).children.slice())this.append(n);}
 matches(selector){const tag=selector.match(/^[a-z]+/i)?.[0];if(tag&&tag.toUpperCase()!==this.tagName)return false;const id=selector.match(/#([\w-]+)/)?.[1];if(id&&this.attrs.id!==id)return false;const cl=selector.match(/\.([\w-]+)/)?.[1];if(cl&&!this.className.split(/\s+/).includes(cl))return false;for(const m of selector.matchAll(/\[([\w-]+)(?:="([^"]*)")?\]/g)){const k=m[1],value=k.startsWith('data-')?this.dataset[k.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]:this.attrs[k];if(value===undefined||m[2]!==undefined&&value!==m[2])return false;}return true;}
 querySelectorAll(s){return this.children.flatMap(c=>[...(c.matches(s)?[c]:[]),...c.querySelectorAll(s)]);}querySelector(s){return this.querySelectorAll(s)[0]||null;}
 click(){this.onclick?.();}
}
function parse(html){const root=new Element('root'),stack=[root];for(const match of html.matchAll(/<!--[\s\S]*?-->|<[^>]+>|[^<]+/g)){const t=match[0];if(t.startsWith('<!'))continue;if(t.startsWith('</')){const tag=t.slice(2,-1).trim().toUpperCase();while(stack.length>1){const last=stack.pop();if(last.tagName===tag)break;}continue;}if(t.startsWith('<')){const tag=t.match(/^<([\w-]+)/)?.[1];if(!tag)continue;const attrs=Object.fromEntries([...t.matchAll(/([\w-]+)=(?:"([^"]*)"|'([^']*)')/g)].map(m=>[m[1],m[2]??m[3]]));if(/\shidden(?:\s|>)/.test(t))attrs.hidden='';const n=new Element(tag,attrs);stack.at(-1).append(n);if(!voidTags.has(tag)&&!t.endsWith('/>'))stack.push(n);}else stack.at(-1)._text+=t;}return root;}
const doc=parse(fs.readFileSync('dist/index.html','utf8'));doc.body=doc.querySelector('body');doc.getElementById=id=>doc.querySelector('#'+id);doc.createElement=tag=>new Element(tag);doc.getElementById('maintenance-hands-panel').innerHTML=repairMarkup92;
for(const mode of ['explore','maintenance','operator','automatic'])doc.getElementById('game-home-menu').append(new Element('button',{'data-game-mode':mode}));
let toolClicks=0,focus=0,cancel=0;for(const b of doc.querySelectorAll('[data-tool]'))b.onclick=()=>toolClicks++;
const observers=[],listeners=[];class Observer{constructor(cb){this.cb=cb;observers.push(this);}observe(){}}
const win={metroRepair:{state:{selectedItem:'obstacle'},focus(){focus++;},cancel(){cancel++;this.state.selectedItem=null;}},addEventListener(type,fn,capture){listeners.push({type,fn,capture});}};
vm.runInNewContext(fs.readFileSync('dist/game92.js','utf8').replace(/^import .*;$/gm,''),{window:win,document:doc,MutationObserver:Observer,localStorage:{getItem:()=>'{"doors":{},"running":{}}'}});
assert.equal(doc.querySelectorAll('.game92-mode-icon').length,4);assert.equal(doc.getElementById('game92-progress').textContent,'2 / 4 misiones');assert.equal(doc.getElementById('game92-refocus').parentElement.className,'game92-repair-actions');assert(doc.getElementById('hands-prepare').parentElement.parentElement.className==='hands-manual-card');
doc.body.dataset.gameScreen='maintenance';observers[0].cb();assert(!doc.getElementById('maintenance-hands-panel').hidden);assert.equal(doc.getElementById('game92-location').textContent,'MISIÓN DE MANTENIMIENTO');doc.getElementById('game92-refocus').click();assert.equal(focus,1);const key=listeners.find(l=>l.type==='keydown').fn;const e={key:'2',target:{tagName:'BODY'},preventDefault(){},stopImmediatePropagation(){this.stopped=true;}};key(e);assert.equal(toolClicks,1);e.key='Escape';key(e);assert.equal(cancel,1);assert(e.stopped);
console.log('v92: redesigned DOM initializes with actual maintenance markup; all four mode icons, mission HUD, reachable preparation, refocus, tool shortcut and Escape cancellation verified. This is a DOM harness, not browser or CSS rendering.');

assert.equal(doc.querySelector('.repair93-actions').parentElement,doc.getElementById('hands-live-message').parentElement,'Named actions stay adjacent to the working canvas');
