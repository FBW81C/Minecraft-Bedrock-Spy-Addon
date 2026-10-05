/**
 * @file Add-on entry point. Registers the item-use handler that opens
 *       the Spy Controller menu, and loads the camera service and the
 *       /scriptevent interface.
 * @author FBW81C
 */

import { world } from "@minecraft/server";
import "./worldLoad.js";
import "./cameraService.js";
import "./spyScriptEvent.js";

import { openSpyControllerMenu } from "./ui/spyController.js";

// Open the main menu when a player uses the Spy Controller item.
world.afterEvents.itemUse.subscribe(async (event) => {
    const { source: player, itemStack } = event;

    if (itemStack.typeId === "fbw81c_spyaddon:spy_controller") {
        await openSpyControllerMenu(player);
    }
});
