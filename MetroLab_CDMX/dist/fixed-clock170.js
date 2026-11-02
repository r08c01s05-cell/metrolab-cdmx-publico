(function(root){
 'use strict';
 class FixedClock170{
  constructor({step=.02,maxSteps=25,maxDebt=5}={}){if(!(step>0&&maxSteps>=1&&maxDebt>=step))throw new RangeError('Invalid fixed clock');this.step=step;this.maxSteps=Math.floor(maxSteps);this.maxDebt=maxDebt;this.accumulator=0;this.ticks=0;}
  reset(){this.accumulator=0;}
  advance(seconds,update){if(!Number.isFinite(seconds)||seconds<0)throw new RangeError('Invalid elapsed seconds');this.accumulator+=seconds;
   // Never silently discard logical time. The caller must pause/reconcile if
   // sustained overload exceeds the explicitly chosen recovery window.
   if(this.accumulator>this.maxDebt)return{overloaded:true,steps:0,pending:this.accumulator,alpha:1};
   let steps=0;while(this.accumulator+1e-10>=this.step&&steps<this.maxSteps){update(this.step);this.accumulator=Math.max(0,this.accumulator-this.step);this.ticks++;steps++;}
   return{overloaded:false,steps,pending:this.accumulator,alpha:Math.min(1,this.accumulator/this.step)};
  }
 }
 root.MetroFixedClock170=FixedClock170;
})(globalThis);
