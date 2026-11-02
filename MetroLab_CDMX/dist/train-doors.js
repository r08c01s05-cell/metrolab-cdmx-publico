// Explicit visibility policy: hide the complete leaf throughout opening/open/
// closing states. Restore it at its closed position only when fully closed.
export function preparePocketDoors(doors){
 for(const door of doors){door.mesh.position.x=door.x;door.mesh.visible=true;}
 return doors;
}
export function updatePocketDoor(door,opening){
 const amount=Math.max(0,Math.min(1,opening));
 door.mesh.position.x=door.x;
 door.mesh.visible=amount===0;
}
