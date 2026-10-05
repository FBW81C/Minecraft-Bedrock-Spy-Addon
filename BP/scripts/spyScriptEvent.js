/**
 * @file Console / command block interface for starting and stopping views
 *       with /scriptevent. It only translates the command into
 *       startView() / stopView() calls of the camera service.
 *
 * Usage:
 *   /scriptevent fbw81c:spy start <spy> player <playerName>
 *   /scriptevent fbw81c:spy start <spy> camera <cameraId | cameraName>
 *   /scriptevent fbw81c:spy stop [spy]
 *
 * <spy> is a player name or "@s" (the entity that runs the command).
 * Names with spaces must be put in quotes: "Mr Steve".
 * Selectors are not resolved by /scriptevent itself. Use /execute instead:
 *   /execute as @a[tag=myTag] run scriptevent fbw81c:spy start @s camera 3
 *
 * @author FBW81C
 */

import { world, system, Player } from "@minecraft/server";
import { cameras } from "./constants.js";
import { startView, stopView } from "./cameraService.js";
import { Translations } from "./translations/spyCommandTranslations.js";
import { getLang, format } from "./helpers.js";

/** Script event id. The namespace is also used to filter incoming events. */
const SCRIPT_EVENT_ID = "fbw81c:spy";

/**
 * Splits a command message into words. Text in double quotes counts as one word.
 *
 * @param {string} message
 * @returns {string[]}
 */
function tokenize(message) {
    const tokens = [];
    const regex = /"([^"]*)"|(\S+)/g;
    let match;

    while ((match = regex.exec(message)) !== null) {
        tokens.push(match[1] ?? match[2]);
    }

    return tokens;
}

/**
 * Finds an online player by name (case-insensitive).
 *
 * @param {string} name
 * @returns {Player | undefined}
 */
function findPlayer(name) {
    const lower = name.toLowerCase();
    return world.getAllPlayers().find(p => p.name.toLowerCase() === lower);
}

/**
 * Finds a saved camera by id (digits only) or by name (case-insensitive).
 *
 * @param {string} text
 * @returns {import("./constants.js").Camera | undefined}
 */
function findCamera(text) {
    if (/^\d+$/.test(text)) {
        return cameras.find(c => c.id === Number(text));
    }

    const lower = text.toLowerCase();
    return cameras.find(c => c.name.toLowerCase() === lower);
}

system.afterEvents.scriptEventReceive.subscribe((event) => {
    if (event.id !== SCRIPT_EVENT_ID) return;

    // Only players can receive chat feedback, everything else goes to the log.
    const executor = event.sourceEntity instanceof Player ? event.sourceEntity : undefined;
    const t = Translations[executor ? getLang(executor) : "en"];

    /** @param {string} text */
    const reply = (text) => {
        if (executor) executor.sendMessage(text);
        else console.warn(text.replace(/§./g, ""));
    };

    /**
     * Resolves the <spy> argument: "@s" or a player name.
     * @param {string | undefined} token
     * @returns {Player | undefined}
     */
    const resolveSpy = (token) => {
        if (token === "@s") {
            if (!executor) {
                reply(t.spyNeedsPlayer);
                return undefined;
            }
            return executor;
        }

        const spy = token ? findPlayer(token) : undefined;

        if (!spy) reply(format(t.playerNotFound, { NAME: token ?? "?" }));

        return spy;
    };

    const [action, ...args] = tokenize(event.message);

    switch (action?.toLowerCase()) {
        case "start": {
            const [spyToken, type, ...targetWords] = args;
            const targetText = targetWords.join(" ");

            if (!spyToken || !type || !targetText) {
                reply(t.usage);
                return;
            }

            const spy = resolveSpy(spyToken);
            if (!spy) return;

            if (type.toLowerCase() === "player") {
                const observed = findPlayer(targetText);

                if (!observed) {
                    reply(format(t.playerNotFound, { NAME: targetText }));
                    return;
                }

                if (observed.id === spy.id) {
                    reply(t.cannotSpyOnSelf);
                    return;
                }

                startView(spy.id, { type: "player", id: observed.name });
                reply(format(t.startedPlayer, { SPY: spy.name, NAME: observed.name }));
            } else if (type.toLowerCase() === "camera") {
                const camera = findCamera(targetText);

                if (!camera) {
                    reply(format(t.cameraNotFound, { NAME: targetText }));
                    return;
                }

                startView(spy.id, { type: "camera", id: camera.id });
                reply(format(t.startedCamera, { SPY: spy.name, NAME: camera.name }));
            } else {
                reply(t.usage);
            }
            return;
        }

        case "stop": {
            const spy = resolveSpy(args[0] ?? "@s");
            if (!spy) return;

            if (stopView(spy.id)) {
                reply(format(t.stopped, { SPY: spy.name }));
            } else {
                reply(format(t.notViewing, { SPY: spy.name }));
            }
            return;
        }

        default:
            reply(t.usage);
    }
}, { namespaces: ["fbw81c"] });
