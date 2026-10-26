import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { canOccupy, moveWithCollisions } from "../src/lib/collisions";
import { DOORS, INITIAL_SPAWN, SPAWNS, WALK, floorHeight, isNearDoor, locationName, type SceneId } from "../src/lib/world";
import { clearInput, createInput } from "../src/lib/input";
import { FOLLOW_CAMERA, cameraPointIsClear, clipCameraBoom, followCameraPose } from "../src/lib/follow-camera";
import { CAMEO, cameoRoute, createCameo, interactionTarget, resetCameo } from "../src/lib/cameo";
import { turnTowards } from "../src/lib/characters";

describe("safe spawns and door interaction", () => {
  it("starts in the square, with a clear view and no collision", () => {
    assert.ok(canOccupy("exterior", INITIAL_SPAWN.position[0], INITIAL_SPAWN.position[2]));
    assert.equal(isNearDoor("exterior", INITIAL_SPAWN.position[0], INITIAL_SPAWN.position[2]), false);
  });
  it("places both transition destinations outside walls and at eye height", () => {
    for (const scene of ["exterior", "interior"] as const) {
      const [x, y, z] = SPAWNS[scene].position;
      assert.ok(canOccupy(scene, x, z));
      assert.ok(Math.abs(y - floorHeight(scene, x, z) - WALK.eyeHeight) < 0.001);
    }
  });
  it("permits interaction only within the designated door radius", () => {
    assert.ok(isNearDoor("exterior", 44.5, 0));
    assert.ok(isNearDoor("interior", 0, 8.5));
    assert.equal(isNearDoor("exterior", 60, 0), false);
    assert.equal(isNearDoor("exterior", 44, 8), false);
    assert.equal(isNearDoor("interior", 0, -40), false);
    assert.equal(isNearDoor("interior", SPAWNS.interior.position[0], SPAWNS.interior.position[2]), false);
    assert.ok(Math.hypot(44.5 - DOORS.exterior.x, 0) < WALK.interactionDistance);
  });
});

describe("lightweight collisions", () => {
  it("blocks the Parliament, projecting portico, and river-facing central bay", () => {
    assert.equal(canOccupy("exterior", 0, 0), false);
    assert.equal(canOccupy("exterior", 39, 0), false);
    assert.equal(canOccupy("exterior", -32, 0), false);
    assert.equal(canOccupy("exterior", 31, 78), false);
  });
  it("blocks city porticoes, monument plinths, and the entrance lion pedestals", () => {
    assert.equal(canOccupy("exterior", 168, -72), false);
    assert.equal(canOccupy("exterior", 97, -97), false);
    assert.equal(canOccupy("exterior", 52, 10.6), false);
  });
  it("cannot tunnel through a building, even with a very large movement delta", () => {
    const result = moveWithCollisions("exterior", 60, 0, -150, 0);
    assert.ok(result.x >= 41.8 + WALK.radius - 0.001);
    assert.ok(canOccupy("exterior", result.x, result.z));
  });
  it("keeps the river completely inaccessible", () => {
    for (const z of [-140, 0, 140]) {
      const result = moveWithCollisions("exterior", -55, z, -100, 0);
      assert.ok(result.x >= -62 + WALK.radius - 0.001);
      assert.equal(canOccupy("exterior", -65, z), false);
    }
  });
  it("allows a continuous route around the north and south ends to the embankment", () => {
    for (const z of [-117, 117]) {
      for (let x = -54; x <= 55; x += 0.5) assert.ok(canOccupy("exterior", x, z), `blocked at ${x},${z}`);
    }
  });
  it("slides along walls rather than stopping all diagonal movement", () => {
    const result = moveWithCollisions("exterior", 29.5, 30, -3, 4);
    assert.ok(result.x >= 29 + WALK.radius);
    assert.ok(result.z > 33.5);
  });
  it("connects the entrance, corridor, and chamber without gaps at thresholds", () => {
    for (let z = 8; z >= -66; z -= 0.1) assert.ok(canOccupy("interior", 0, z), `blocked at ${z}`);
    assert.equal(canOccupy("interior", 7, -24), false);
    assert.equal(canOccupy("interior", 20, -50), false);
    assert.equal(canOccupy("interior", 0, 12), false);
  });
  it("blocks seating, columns, and the speaker's dais", () => {
    assert.equal(canOccupy("interior", 10.5, -1), false);
    assert.equal(canOccupy("interior", 4.2, -23), false);
    assert.equal(canOccupy("interior", 0, -70), false);
    assert.ok(canOccupy("interior", 0, -54));
  });
});

describe("increased walking speed", () => {
  it("uses the requested shared maximum speed for desktop and mobile", () => {
    assert.equal(WALK.speed, 9.2);
  });
  it("keeps full-speed and analog movement consistent across frame rates", () => {
    for (const fps of [10, 30, 60, 120]) {
      for (const analog of [0.5, 1]) {
        let position = { x: 145, z: 20 };
        for (let frame = 0; frame < fps; frame++) {
          position = moveWithCollisions("exterior", position.x, position.z, -WALK.speed * analog / fps, 0);
        }
        assert.ok(Math.abs(position.x - (145 - 9.2 * analog)) < 1e-8, `${fps} fps, analog ${analog}`);
        assert.equal(position.z, 20);
      }
    }
  });
  it("cannot cross walls, the river, columns, or the dais at the increased speed", () => {
    const routes: { scene: SceneId; x: number; z: number; dx: number; dz: number }[] = [
      { scene: "exterior", x: 44.5, z: 0, dx: -1, dz: 0 },
      { scene: "exterior", x: -60, z: 25, dx: -1, dz: 0 },
      { scene: "interior", x: 0, z: 9, dx: 0, dz: 1 },
      { scene: "interior", x: 0, z: -66, dx: 0, dz: -1 },
      { scene: "interior", x: 4.2, z: -21, dx: 0, dz: -1 },
    ];
    for (const fps of [10, 30, 60, 120]) {
      for (const route of routes) {
        let position = { x: route.x, z: route.z };
        for (let frame = 0; frame < fps * 2; frame++) {
          position = moveWithCollisions(route.scene, position.x, position.z, route.dx * WALK.speed / fps, route.dz * WALK.speed / fps);
          assert.ok(canOccupy(route.scene, position.x, position.z), `${route.scene} collision at ${fps} fps`);
        }
        assert.ok(Math.hypot(position.x - route.x, position.z - route.z) < 3, `tunneled past obstacle at ${fps} fps`);
      }
    }
  });
});

describe("floor alignment and input lifecycle", () => {
  it("follows the entrance steps with a continuous floor ramp", () => {
    assert.equal(floorHeight("exterior", 55, 0), 0);
    assert.equal(floorHeight("exterior", 51, 0), 0.72);
    assert.equal(floorHeight("exterior", 44.5, 0), 1.44);
    assert.equal(floorHeight("exterior", 51, 20), 0);
  });
  it("connects the ceremonial stairs to the raised interior corridor", () => {
    assert.equal(floorHeight("interior", 0, -5), 0);
    assert.equal(floorHeight("interior", 0, -9), 1.2);
    assert.equal(floorHeight("interior", 0, -13), 2.4);
    assert.equal(floorHeight("interior", 0, -50), 2.4);
  });
  it("clears held keys, analog movement, and pending look on cancellation", () => {
    const input = createInput();
    input.keys.add("KeyW");
    input.moveX = 0.5;
    input.moveY = 1;
    input.lookX = input.lookY = 0.3;
    clearInput(input);
    assert.equal(input.keys.size, 0);
    assert.equal(input.moveX + input.moveY + input.lookX + input.lookY, 0);
  });
  it("uses Hungarian location names for each connected area", () => {
    assert.equal(locationName("exterior", 145, 39), "Kossuth Lajos tér");
    assert.equal(locationName("exterior", -54, 20), "Duna-part");
    assert.equal(locationName("interior", 0, -24), "Aranyfolyosó");
    assert.equal(locationName("interior", 0, -50), "Díszterem");
  });
});

describe("third-person follow camera", () => {
  it("follows behind and above the character on an open path", () => {
    const pose = followCameraPose("exterior", 80, 0, 0, Math.PI / 2, FOLLOW_CAMERA.defaultPitch);
    assert.ok(pose.position[0] > 84);
    assert.ok(pose.position[1] > 1.9);
    assert.ok(cameraPointIsClear("exterior", ...pose.position));
  });
  it("retracts at the outside door without crossing the Parliament wall", () => {
    const pose = followCameraPose("exterior", 44.5, 1.44, 0, -Math.PI / 2, FOLLOW_CAMERA.defaultPitch);
    assert.ok(pose.position[0] >= 42);
    assert.ok(cameraPointIsClear("exterior", ...pose.position));
  });
  it("keeps a visible elevated view when the character backs against an interior wall", () => {
    const pose = followCameraPose("interior", 13, 0, 0, Math.PI / 2, FOLLOW_CAMERA.defaultPitch);
    assert.ok(pose.position[0] < 13.32);
    assert.ok(pose.position[1] > 3.5);
    assert.ok(cameraPointIsClear("interior", ...pose.position));
  });
  it("keeps orbit positions out of walls, floors, ceilings, and the river", () => {
    const poses: { scene: SceneId; x: number; z: number }[] = [
      { scene: "exterior", x: 80, z: 0 }, { scene: "exterior", x: -61.5, z: 25 },
      { scene: "interior", x: 0, z: 0 }, { scene: "interior", x: 0, z: -24 },
      { scene: "interior", x: 0, z: -40 }, { scene: "interior", x: 13, z: 0 },
    ];
    for (const p of poses) for (let angle = 0; angle < Math.PI * 2; angle += 0.2) {
      for (const pitch of [FOLLOW_CAMERA.minPitch, 0, FOLLOW_CAMERA.defaultPitch, FOLLOW_CAMERA.maxPitch]) {
        const pose = followCameraPose(p.scene, p.x, floorHeight(p.scene, p.x, p.z), p.z, angle, pitch);
        assert.ok(cameraPointIsClear(p.scene, ...pose.position), `${p.scene} camera at ${angle}, ${pitch}`);
      }
    }
  });
  it("clips an orbit segment before cutting through a corridor corner", () => {
    const safe = clipCameraBoom("interior", [0, 3.6, -12], [7, 4.8, -18]);
    assert.ok(safe[0] < 5);
    assert.ok(cameraPointIsClear("interior", ...safe));
  });
  it("turns the avatar the short way across the angle wrap", () => {
    assert.ok(Math.abs(turnTowards(Math.PI - 0.02, -Math.PI + 0.02, 0.5) - Math.PI) < 1e-8);
  });
});

describe("harmless Parliament cameo", () => {
  it("keeps the complete slow walking loop clear of chamber furniture", () => {
    for (let time = 0; time <= 46; time += 0.1) {
      const pose = cameoRoute(time);
      assert.ok(canOccupy("interior", pose.x, pose.z, CAMEO.radius));
      assert.equal(floorHeight("interior", pose.x, pose.z), 2.4);
    }
    assert.ok(Math.hypot(cameoRoute(0).x - cameoRoute(5).x, cameoRoute(0).z - cameoRoute(5).z) > 1);
  });
  it("uses proximity-guarded, mutually exclusive door and speech interactions", () => {
    const cameo = createCameo();
    assert.equal(interactionTarget("exterior", 44.5, 0, cameo), "door");
    assert.equal(interactionTarget("interior", 0, 8.5, cameo), "door");
    assert.equal(interactionTarget("interior", cameo.x, cameo.z + 2.1, cameo), "cameo");
    assert.equal(interactionTarget("interior", 0, 6.5, cameo), null);
    assert.equal(interactionTarget("exterior", cameo.x, cameo.z, cameo), null);
    cameo.greetingRemaining = CAMEO.greetingDuration;
    assert.equal(interactionTarget("interior", cameo.x, cameo.z + 2.1, cameo), null);
  });
  it("prevents the player passing through the NPC at the current walking speed", () => {
    const cameo = createCameo();
    const next = moveWithCollisions("interior", cameo.x, cameo.z + 3, 0, -WALK.speed, [{ kind: "circle", x: cameo.x, z: cameo.z, radius: CAMEO.radius }]);
    assert.ok(next.z >= cameo.z + WALK.radius + CAMEO.radius - 0.001);
  });
  it("resets dialogue and walking state cleanly on scene changes", () => {
    const cameo = createCameo();
    cameo.greetingRemaining = 3;
    cameo.pathTime = 5;
    cameo.wave = 1;
    resetCameo(cameo);
    assert.deepEqual(cameo, createCameo());
  });
});
