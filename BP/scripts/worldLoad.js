/**
 * @file World initialization. Loads persisted data when the script starts.
 * @author FBW81C
 */

import { system } from "@minecraft/server";
import { loadCameras } from "./constants.js";

/**
 * Called once when the world is ready. Loads all persisted add-on data.
 */
export function onLoadWorld() {
    loadCameras();
}

// Run on the next tick, because world access is not allowed
// in early execution mode while the script is being loaded.
system.run(() => {
    onLoadWorld();
});
