/**
 * @file Camera data storage. Keeps the list of cameras in memory and
 *       persists it as a dynamic property on the world.
 * @author FBW81C
 */

import { world } from "@minecraft/server";

/** Dynamic property key under which the cameras are stored (as JSON). */
export const CAMERA_DATA_KEY = "fbw81c_spyaddon:cameras";

/**
 * @typedef {Object} Camera
 * @property {number} id Unique camera id.
 * @property {string} name Display name.
 * @property {{x: number, y: number, z: number}} position Camera location.
 * @property {{x: number, y: number}} rotation Pitch (x) and yaw (y) in degrees.
 * @property {string} dimension Dimension id, e.g. "minecraft:overworld".
 * @property {boolean} canRotate Whether the viewer may rotate the camera.
 */

/**
 * All saved cameras.
 * Exported as a live binding: never reassign it from other modules,
 * mutate the array instead (push, splice, ...).
 * @type {Camera[]}
 */
export let cameras = [];

/** The id that will be assigned to the next created camera. */
export let nextCameraId = 1;

/** True once the cameras have been loaded from the world. */
export let camerasLoaded = false;

/**
 * Loads the cameras from the world's dynamic properties.
 * Falls back to an empty list if nothing is stored or the data is corrupt.
 */
export function loadCameras() {
    const data = world.getDynamicProperty(CAMERA_DATA_KEY);

    if (typeof data !== "string") {
        cameras = [];
        nextCameraId = 1;
        camerasLoaded = true;
        return;
    }

    try {
        const parsed = JSON.parse(data);

        if (!Array.isArray(parsed)) {
            throw new Error("Camera data is not an array.");
        }

        cameras = parsed;

        // Continue counting after the highest existing id.
        nextCameraId =
            cameras.reduce(
                (max, camera) =>
                    Math.max(max, Number(camera.id) || 0),
                0
            ) + 1;

        camerasLoaded = true;
    } catch (error) {
        console.warn(`Could not load cameras: ${error}`);
        cameras = [];
        nextCameraId = 1;
        camerasLoaded = true;
    }
}

/**
 * Saves the current camera list to the world's dynamic properties.
 */
export function saveCameras() {
    world.setDynamicProperty(
        CAMERA_DATA_KEY,
        JSON.stringify(cameras)
    );
}

/**
 * Returns a new unique camera id and increments the counter.
 * @returns {number}
 */
export function getNextCameraId() {
    return nextCameraId++;
}
