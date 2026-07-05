import { Raycaster, Vector3, Object3D, Intersection, Sphere } from 'three';

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
 * Check if a web projectile has hit something using multiple detection methods
 */
export const checkWebCollision = (
  webPosition: Vector3,
  webVelocity: Vector3,
  objects: Object3D[],
  delta: number
): { hit: boolean; point?: Vector3; normal?: Vector3; distance?: number; object?: Object3D } => {
  if (objects.length === 0) {
    return { hit: false };
  }

  // Method 1: Sphere-based proximity detection (for close-range hits)
  const collisionRadius = 0.5; // Web collision radius
  const sphere = new Sphere(webPosition, collisionRadius);

  for (const obj of objects) {
    if (!obj.visible) continue;
    
    // Get object's world position
    obj.updateMatrixWorld(true);
    const objPosition = new Vector3();
    obj.getWorldPosition(objPosition);
    
    // Check distance to object
    const distance = webPosition.distanceTo(objPosition);
    
    // Rough size estimation - get bounding sphere radius if available
    let objectRadius = 1.5; // Default radius
    if (obj.type === 'Mesh') {
      const mesh = obj as any;
      if (mesh.geometry && mesh.geometry.boundingSphere) {
        mesh.geometry.computeBoundingSphere();
        objectRadius = mesh.geometry.boundingSphere.radius;
      }
    }
    
    // If web is close enough to object, consider it a hit
    if (distance < (objectRadius + collisionRadius)) {
      console.log(`🎯 Proximity hit detected! Distance: ${distance.toFixed(2)}, Object:`, obj.type);
      return {
        hit: true,
        point: objPosition.clone(),
        distance: distance,
        object: obj
      };
    }
  }

  // Method 2: Raycast in velocity direction (for moving hits)
  const direction = webVelocity.clone().normalize();
  const speed = webVelocity.length();
  
  // Check multiple frames ahead to avoid tunneling
  const lookAheadTime = 0.1; // Look 100ms ahead
  const maxRayDistance = speed * lookAheadTime + 5; // Add extra buffer
  
  const raycaster = new Raycaster(webPosition, direction, 0, maxRayDistance);
  const intersections = raycaster.intersectObjects(objects, true);

  if (intersections.length > 0) {
    const intersection = intersections[0];
    console.log(`🎯 Raycast hit detected! Distance: ${intersection.distance.toFixed(2)}`);
    return {
      hit: true,
      point: intersection.point,
      normal: intersection.face?.normal,
      distance: intersection.distance,
      object: intersection.object
    };
  }

  // Method 3: Check next position (predictive)
  const nextPosition = webPosition.clone().add(
    webVelocity.clone().multiplyScalar(delta)
  );
  
  for (const obj of objects) {
    if (!obj.visible) continue;
    
    obj.updateMatrixWorld(true);
    const objPosition = new Vector3();
    obj.getWorldPosition(objPosition);
    
    const distance = nextPosition.distanceTo(objPosition);
    
    let objectRadius = 1.5;
    if (obj.type === 'Mesh') {
      const mesh = obj as any;
      if (mesh.geometry && mesh.geometry.boundingSphere) {
        mesh.geometry.computeBoundingSphere();
        objectRadius = mesh.geometry.boundingSphere.radius;
      }
    }
    
    if (distance < (objectRadius + collisionRadius)) {
      console.log(`🎯 Predictive hit detected! Distance: ${distance.toFixed(2)}`);
      return {
        hit: true,
        point: objPosition.clone(),
        distance: distance,
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
