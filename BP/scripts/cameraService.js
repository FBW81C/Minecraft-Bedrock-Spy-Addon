/**
 * @file Central camera service. This is the ONLY place that controls the
 *       camera of a spying player. Every feature (camera items, "spy on
 *       player" menu, script events, ...) just adds or removes an entry in
 *       the activeViews map via startView() / stopView(). The loop in this
 *       file takes care of everything else (applying, updating and
 *       resetting the camera, validation, messages).
 * @author FBW81C
 */

import { world, system } from "@minecraft/server";
import { cameras } from "./constants.js";
import { Translations } from "./translations/cameraServiceTranslations.js";
import { getLang, format } from "./helpers.js";

/**
 * What a player is looking at.
 * - type "player": id is the exact name of the observed player.
 * - type "camera": id is the id of a saved camera.
 * @typedef {{ type: "player", id: string } | { type: "camera", id: number }} ViewTarget
 */

/**
 * Active sessions (the single source of truth).
 * Maps the id of the spying player to the observed entity.
 * A player can only have one view at a time, setting a new one replaces the old one.
 * @type {Map<string, ViewTarget>}
 */
const activeViews = new Map();

/**
 * What the loop has actually applied to each spying player's client.
 * Used to detect new / removed views, and to skip identical commands.
 * @type {Map<string, { key: string, command: string, refreshedAt: number }>}
 */
const appliedViews = new Map();

/**
 * Even if nothing changed, the camera command and the action bar text are
 * re-sent after this many ticks (action bar text fades out, and the camera
 * can get reset by respawning).
 */
const REFRESH_INTERVAL_TICKS = 20;

// PUBLIC API

/**
 * Starts a view, or switches to another target if the player is already
 * viewing something. The camera is updated by the loop on the next tick.
 *
 * @param {string} spyId Id of the spying player.
 * @param {ViewTarget} target What to look at.
 */
export function startView(spyId, target) {
    if (target.type !== "player" && target.type !== "camera") {
        throw new Error(`Unknown view type: ${target.type}`);
    }

    activeViews.set(spyId, { type: target.type, id: target.id });
}

/**
 * Stops the view of a player. The camera is reset by the loop on the next tick.
 *
 * @param {string} spyId Id of the spying player.
 * @returns {boolean} True if the player had an active view.
 */
export function stopView(spyId) {
    return activeViews.delete(spyId);
}

/**
 * Returns the current view of a player.
 *
 * @param {string} spyId Id of the spying player.
 * @returns {Readonly<ViewTarget> | undefined} The view, or undefined if the player has none.
 */
export function getView(spyId) {
    return activeViews.get(spyId);
}

// INTERNAL HELPERS

/**
 * Works out where the camera has to be for a view.
 *
 * @param {import("@minecraft/server").Player} spy The spying player.
 * @param {ViewTarget} target The view to resolve.
 * @param {Map<string, import("@minecraft/server").Player>} playersByName All online players, keyed by name.
 * @returns {{ error: string, name: string }
 *         | { labelKey: string, name: string, position: {x: number, y: number, z: number}, rotation: {x: number, y: number} }}
 *          Either an error (the key is a translation key) or the camera pose.
 */
function resolveTarget(spy, target, playersByName) {
    if (target.type === "camera") {
        const camera = cameras.find(c => c.id === target.id);

        if (!camera) {
            return { error: "cameraNotFound", name: String(target.id) };
        }

        if (spy.dimension.id !== camera.dimension) {
            return { error: "cameraOtherDimension", name: camera.name };
        }

        return {
            labelKey: "viewingCamera",
            name: camera.name,
            position: camera.position,
            // Rotatable cameras follow the viewer's own mouse movement.
            rotation: camera.canRotate ? spy.getRotation() : camera.rotation
        };
    }

    const observed = playersByName.get(target.id);

    if (!observed) {
        return { error: "playerOffline", name: target.id };
    }

    if (observed.dimension.id !== spy.dimension.id) {
        return { error: "playerOtherDimension", name: observed.name };
    }

    return {
        labelKey: "viewingPlayer",
        name: observed.name,
        position: observed.getHeadLocation(),
        rotation: observed.getRotation()
    };
}

/**
 * Runs a command on a player and logs a warning instead of throwing,
 * so one failing command can never break the loop for everyone else.
 *
 * @param {import("@minecraft/server").Player} player
 * @param {string} command
 */
function safeRunCommand(player, command) {
    try {
        player.runCommand(command);
    } catch (error) {
        console.warn(`Camera command failed for ${player.name}: ${error}`);
    }
}

// LOOP

// Every tick: bring the real cameras in line with the activeViews map.
system.runInterval(() => {
    const players = world.getAllPlayers();
    const playersById = new Map(players.map(p => [p.id, p]));
    const playersByName = new Map(players.map(p => [p.name, p]));
    const now = system.currentTick;

    // 1. Views that were removed from the map since the last tick:
    //    reset the camera of the player.
    for (const spyId of [...appliedViews.keys()]) {
        if (activeViews.has(spyId)) continue;

        appliedViews.delete(spyId);

        const spy = playersById.get(spyId);

        if (!spy) continue;

        safeRunCommand(spy, "camera @s clear");
        spy.onScreenDisplay.setActionBar(Translations[getLang(spy)].viewEnded);
    }

    // 2. Apply every view that is in the map.
    for (const [spyId, target] of activeViews) {
        const spy = playersById.get(spyId);

        // The spying player left the world.
        if (!spy) {
            activeViews.delete(spyId);
            appliedViews.delete(spyId);
            continue;
        }

        const t = Translations[getLang(spy)];
        const resolved = resolveTarget(spy, target, playersByName);

        // The target is gone or unreachable: end the session and tell the spy why.
        // The camera itself is reset in step 1 of the next tick.
        if ("error" in resolved) {
            spy.sendMessage(format(t[resolved.error], { NAME: resolved.name }));
            activeViews.delete(spyId);
            continue;
        }

        const { position: p, rotation: r } = resolved;
        const command =
            `camera @s set minecraft:free pos ${p.x.toFixed(3)} ${p.y.toFixed(3)} ${p.z.toFixed(3)} ` +
            `rot ${r.x.toFixed(1)} ${r.y.toFixed(1)}`;

        const key = `${target.type}:${target.id}`;
        const applied = appliedViews.get(spyId);

        const needsRefresh =
            !applied ||
            applied.key !== key ||
            now - applied.refreshedAt >= REFRESH_INTERVAL_TICKS;

        // Static cameras produce the same command every tick, so they are only sent once.
        if (needsRefresh || applied.command !== command) {
            safeRunCommand(spy, command);
        }

        if (needsRefresh) {
            spy.onScreenDisplay.setActionBar(format(t[resolved.labelKey], { NAME: resolved.name }));
        }

        appliedViews.set(spyId, {
            key,
            command,
            refreshedAt: needsRefresh ? now : applied.refreshedAt
        });
    }
}, 1);

// Clean up when a player leaves.
world.afterEvents.playerLeave.subscribe(({ playerId }) => {
    activeViews.delete(playerId);
    appliedViews.delete(playerId);
});
