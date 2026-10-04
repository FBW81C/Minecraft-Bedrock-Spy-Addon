/**
 * @file Add-on entry point. Registers the item-use handler that opens
 *       the Spy Controller menu.
 * @author FBW81C
 */

import { world } from "@minecraft/server";
import "./worldLoad.js";

import { openSpyControllerMenu } from "./ui/spyController.js";

// Open the main menu when a player uses the Spy Controller item.
world.afterEvents.itemUse.subscribe(async (event) => {
    const { source: player, itemStack } = event;

    if (itemStack.typeId === "fbw81c:spy_controller") {
        await openSpyControllerMenu(player);
    }
});
