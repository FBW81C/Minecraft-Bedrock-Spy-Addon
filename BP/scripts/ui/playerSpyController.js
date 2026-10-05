/**
 * @file "Spy on a player" menu. Lets a player pick another player and
 *       starts a view through the central camera service.
 * @author FBW81C
 */

import { world } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { Translations } from "../translations/playerSpyControllerTranslations.js";
import { getLang } from "../helpers.js";
import { startView, stopView, getView } from "../cameraService.js";

/**
 * Opens the player selection menu.
 * If the player currently has an active view, an extra "end spying" button is shown.
 *
 * @param {import("@minecraft/server").Player} player The player who wants to spy.
 */
export async function openSpyOnPlayerMenu(player) {
    const t = Translations[getLang(player)];

    // A player cannot spy on themselves.
    const allPlayers = world.getAllPlayers();
    const targets = allPlayers.filter(p => p.id !== player.id);

    const isViewing = getView(player.id) !== undefined;

    if (targets.length === 0 && !isViewing) {
        const form = new ActionFormData()
            .title(t.title)
            .body(t.noOtherPlayersBody)
            .button(t.ok);

        await form.show(player);
        return;
    }

    const form = new ActionFormData()
        .title(t.title)
        .body(targets.length > 0 ? t.body : t.noOtherPlayersBody);

    targets.forEach(target => {
        form.button(target.name);
    });

    // The "end spying" button is always the last one.
    if (isViewing) {
        form.button(t.endSpying);
    }

    const result = await form.show(player);

    if (result.canceled) return;

    if (isViewing && result.selection === targets.length) {
        stopView(player.id);
        return;
    }

    const selectedTarget = targets[result.selection];

    if (selectedTarget) {
        startView(player.id, { type: "player", id: selectedTarget.name });
    }
}
