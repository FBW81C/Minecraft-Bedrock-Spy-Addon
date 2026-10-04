/**
 * @file "Spy on a player" feature. Lets a player pick another player and
 *       follow their view through a free camera.
 * @author FBW81C
 */

import { world, system } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { Translations } from "../translations/playerSpyControllerTranslations.js";
import { getLang, format } from "../helpers.js";

/** Eye height of a standing player, used to place the camera at head level. */
const EYE_HEIGHT = 1.62;

/**
 * Active spy sessions.
 * Maps the id of the spying player to the id of the observed player.
 * @type {Map<string, string>}
 */
const activeSpies = new Map();

/**
 * Opens the player selection menu.
 * If a spy session is already running, an extra "end spying" button is shown.
 *
 * @param {import("@minecraft/server").Player} player The player who wants to spy.
 */
export async function openSpyOnPlayerMenu(player) {
    const t = Translations[getLang(player)];

    // A player cannot spy on themselves.
    const allPlayers = world.getAllPlayers();
    const targets = allPlayers.filter(p => p.id !== player.id);

    if (targets.length === 0) {
        const form = new ActionFormData()
            .title(t.title)
            .body(t.noOtherPlayersBody)
            .button(t.ok);

        await form.show(player);
        return;
    }

    const form = new ActionFormData()
        .title(t.title)
        .body(t.body);

    targets.forEach(target => {
        form.button(target.name);
    });

    // The "end spying" button is always the last one.
    if (activeSpies.has(player.id)) {
        form.button(t.endSpying);
    }

    const result = await form.show(player);

    if (result.canceled) return;

    if (activeSpies.has(player.id) && result.selection === targets.length) {
        stopSpying(player);
        return;
    }

    const selectedTarget = targets[result.selection];
    startSpying(player, selectedTarget);
}

/**
 * Starts a spy session.
 *
 * @param {import("@minecraft/server").Player} spy The spying player.
 * @param {import("@minecraft/server").Player} target The observed player.
 */
function startSpying(spy, target) {
    const t = Translations[getLang(spy)];

    activeSpies.set(spy.id, target.id);
    spy.onScreenDisplay.setActionBar(
        format(t.spyingStarted, { NAME: target.name })
    );
}

/**
 * Ends a spy session and resets the spy's camera.
 *
 * @param {import("@minecraft/server").Player} spy The spying player.
 */
function stopSpying(spy) {
    const t = Translations[getLang(spy)];

    activeSpies.delete(spy.id);
    spy.runCommandAsync("camera @s clear");
    spy.onScreenDisplay.setActionBar(t.spyingEnded);
}

// Every tick: move each spy's camera to the head of the observed player.
system.runInterval(() => {
    for (const [spyId, targetId] of activeSpies.entries()) {
        const spy = world.getAllPlayers().find(p => p.id === spyId);
        const target = world.getAllPlayers().find(p => p.id === targetId);

        // End the session if the spy or the target left the world.
        if (!spy || !target) {
            if (spy) stopSpying(spy);
            else activeSpies.delete(spyId);
            continue;
        }

        const t = Translations[getLang(spy)];

        spy.onScreenDisplay.setActionBar(
            format(t.spyingStarted, { NAME: target.name })
        );

        const pos = target.location;
        const rot = target.getRotation();

        spy.runCommandAsync(
            `camera @s set minecraft:free pos ${pos.x} ${pos.y + EYE_HEIGHT} ${pos.z} rot ${rot.x} ${rot.y}`
        );
    }
}, 1);
