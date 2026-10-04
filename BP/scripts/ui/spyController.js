/**
 * @file Main menu of the Spy Controller item.
 * @author FBW81C
 */

import { ActionFormData } from "@minecraft/server-ui";
import { Translations } from "../translations/spyControllerTranslations.js";
import { getLang } from "../helpers.js";
import { openSpyOnPlayerMenu } from "./playerSpyController.js";
import { openManageCamerasMenu } from "./manageCameras.js";

/**
 * Opens the main menu with the options "Spy on Player" and "Manage Cameras".
 *
 * @param {import("@minecraft/server").Player} player The player using the controller.
 */
export async function openSpyControllerMenu(player) {
    const t = Translations[getLang(player)];

    const form = new ActionFormData()
        .title(t.title)
        .body(t.body)
        .button(t.optionSpyOnPlayer)
        .button(t.optionManageCams);

    const result = await form.show(player);

    if (result.canceled) return;

    switch (result.selection) {
        case 0: await openSpyOnPlayerMenu(player); break;
        case 1: await openManageCamerasMenu(player); break;
    }
}
