// Choose the facing wall in the local frame of a curved route.
export function cutawaySide108(camera,alignment,anchor){if(!alignment)return camera.z>=0?1:-1;const pose=alignment.pose(anchor);const z=(camera.x-pose.x)*Math.sin(pose.yaw)+(camera.z-pose.z)*Math.cos(pose.yaw);return z>=0?1:-1;}
