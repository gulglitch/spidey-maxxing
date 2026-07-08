import { Raycaster, Vector3, Object3D, Intersection, Box3 } from 'three';

/**
 * Perform raycasting to detect collisions
 */
export const raycastWeb = (
  origin: Vector3,
  direction: Vector3,
  objects: Object3D[],
  maxDistance: number = 100
): Intersection | null => {
  const raycaster = new Raycaster(origin, direction.normalize(), 0, maxDistance);
  const intersections = raycaster.intersectObjects(objects, true);

  if (intersections.length > 0) {
    return intersections[0]; // Return closest intersection
  }

  return null;
};

/**
 * Enhanced collision detection specifically for buildings
 */
export const checkBuildingCollision = (
  webPosition: Vector3,
  webVelocity: Vector3,
  scene: any,
  delta: number
): { hit: boolean; point?: Vector3; normal?: Vector3; distance?: number; object?: any } => {
  
  // Filter for building meshes only
  const buildingObjects: any[] = [];
  scene.traverse((obj: any) => {
    if (obj.isMesh && obj.userData?.type === 'building') {
      buildingObjects.push(obj);
    }
  });

  if (buildingObjects.length === 0) {
    return { hit: false };
  }

  // Method 1: Raycast in velocity direction
  const direction = webVelocity.clone().normalize();
  const speed = webVelocity.length();
  const lookAheadTime = 0.15;
  const maxRayDistance = speed * lookAheadTime + 8;
  
  const raycaster = new Raycaster(webPosition, direction, 0, maxRayDistance);
  const intersections = raycaster.intersectObjects(buildingObjects, true);

  if (intersections.length > 0) {
    const intersection = intersections[0];
    console.log('🎯 Building hit! Distance:', intersection.distance.toFixed(2));
    return {
      hit: true,
      point: intersection.point,
      normal: intersection.face?.normal,
      distance: intersection.distance,
      object: intersection.object
    };
  }

  // Method 2: Expanded bounding box check
  const nextPosition = webPosition.clone().add(
    webVelocity.clone().multiplyScalar(delta)
  );
  
  for (const obj of buildingObjects) {
    if (!obj.visible) continue;

    obj.updateMatrixWorld(true);
    const bounds = new Box3().setFromObject(obj).expandByScalar(1.0);

    if (bounds.containsPoint(nextPosition)) {
      console.log('🏢 Building bounds hit!');
      // Snap to nearest building surface
      const center = new Vector3();
      bounds.getCenter(center);
      const size = new Vector3();
      bounds.getSize(size);
      
      // Find closest surface point
      const hitPoint = nextPosition.clone();
      hitPoint.x = Math.max(bounds.min.x, Math.min(bounds.max.x, hitPoint.x));
      hitPoint.y = Math.max(bounds.min.y, Math.min(bounds.max.y, hitPoint.y));
      hitPoint.z = Math.max(bounds.min.z, Math.min(bounds.max.z, hitPoint.z));
      
      return {
        hit: true,
        point: hitPoint,
        distance: webPosition.distanceTo(hitPoint),
        object: obj
      };
    }
  }

  return { hit: false };
};

/**
 * Calculate bounce direction after collision
 */
export const calculateBounce = (
  velocity: Vector3,
  normal: Vector3,
  restitution: number = 0.5
): Vector3 => {
  // Reflect velocity around normal
  const reflected = velocity.clone().reflect(normal);
  return reflected.multiplyScalar(restitution);
};
