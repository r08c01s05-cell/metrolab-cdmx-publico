import * as THREE from 'three';
// Independent drops avoid the old whole-curtain reset. Covered station volumes stay dry.
export function updateWeather103(view){const state=view.getState?.(),engine=state?.engine;if(!engine)return;const selected=engine.trains.find(t=>t.id===state.selectedTrain),wet=engine.weather==='rain';if(!view.rain103){const count=240,g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(count*6),3).setUsage(THREE.DynamicDrawUsage));view.rain103=new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:0xb5c5cd,transparent:true,opacity:.32,depthWrite:false}));view.rain103.frustumCulled=false;view.rain103.name='Lluvia_exterior122';view.scene.add(view.rain103);}
 const exterior=selected&&engine.weatherExposure({...selected,position:view.camera.position.x}),inside=['car','driver','cab-platform'].includes(view.cameraMode);view.rain103.visible=wet&&exterior&&!inside;
 if(!view.rain103.visible)return;const geometry=view.rain103.geometry,p=geometry.attributes.position,time=(view.elapsed??performance.now())/1000,line=engine.lines[state.currentLine],anchor=view.camera.position;
 for(let i=0;i<240;i++){const x=anchor.x+((i*7.31)%46)-23,z=anchor.z+((i*3.17)%34)-17,covered=line.distances.some((center,j)=>line.stations[j].entorno_visual?.tipo==='superficial'&&Math.abs(x-center)<79&&Math.abs(z)<9.6),y=covered?-20:14-((time*(7+(i%7)*.22)+i*1.73)%14),world=view.alignment97?.pose(x,z)||{x,z},j=i*2;
 p.setXYZ(j,world.x,y,world.z);p.setXYZ(j+1,world.x-.055,y-.32-(i%4)*.045,world.z+.018);}
 p.needsUpdate=true;
}
