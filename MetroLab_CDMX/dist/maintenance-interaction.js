// A tool action needs deliberate movement; releasing pauses it without changing the part.
export class ToolInteraction{
 constructor(state){this.state=state;this.task=null;}
 begin(target){const s=this.state;try{s.safe();if(target.startsWith('screw')){s.require(s.tool==='screwdriver','Elige el destornillador para girar este tornillo.');s.require(!s.coverOpen,'Coloca la tapa antes de fijar sus tornillos.');}else if(target.startsWith('bolt')){s.require(s.tool==='wrench','Elige la llave para esta fijación.');s.require(s.wheelReplaced,'Coloca la rueda nueva antes de fijarla.');}else throw Error('Esta pieza no admite giro.');if(this.task?.target===target&&s.toolMotion===this.task)return true;this.task={target,progress:0};s.toolMotion=this.task;return true;}catch(e){s.message=e.message;return false;}}
 advance(amount){if(!this.task)return false;try{this.state.safe();}catch(e){this.state.message=e.message;this.cancel();return false;}this.task.progress=Math.max(0,Math.min(1,this.task.progress+amount));if(this.task.progress>=1-1e-6)this.task.progress=1;if(this.task.progress<1)return false;const target=this.task.target;this.cancel();this.state.act(target);return true;}
 cancel(){this.task=null;this.state.toolMotion=null;}
}
