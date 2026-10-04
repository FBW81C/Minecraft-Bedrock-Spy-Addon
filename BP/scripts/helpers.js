/**
 * @file Shared helper functions used across the add-on.
 * @author FBW81C
 */

/**
 * Determines the UI language of a player.
 *
 * Players with the tag "Deutsch" get German, everyone else gets English.
 *
 * @param {import("@minecraft/server").Player} player The player to check.
 * @returns {"de" | "en"} The language key used to index the translation files.
 */
export function getLang(player) {
    if (player.hasTag("Deutsch")) return "de";
    return "en";
}

/**
 * Replaces placeholders in the format #KEY# with the given values.
 * Placeholders without a matching value are left untouched.
 *
 * @example
 * format("Hello #NAME#!", { NAME: "Steve" }); // "Hello Steve!"
 *
 * @param {string} text The text containing placeholders.
 * @param {Record<string, string | number>} [values] Placeholder values, keyed by placeholder name.
 * @returns {string} The text with all known placeholders replaced.
 */
export function format(text, values = {}) {
    return text.replace(/#([A-Z_]+)#/g, (match, key) =>
        key in values ? String(values[key]) : match
    );
}
