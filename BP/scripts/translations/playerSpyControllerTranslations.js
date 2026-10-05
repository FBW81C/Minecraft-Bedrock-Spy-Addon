/**
 * @file Translations (English / German) for the "Spy on a player" feature.
 *
 * Placeholders: #NAME# = name of the observed player.
 * Formatting codes: §l = bold, §b = aqua, §7 = gray, §c = red,
 *                   §a = green, §e = yellow, §r = reset.
 *
 * @author FBW81C
 */

export const Translations = {
    en: {
        title: "§l§bSpy on a Player§r",
        body: "§7Choose a player to spy on:§r",

        // Shown when no other player is online
        noOtherPlayersBody: "§cThere are no other players online to spy on!§r",

        ok: "OK",

        endSpying: "§l§cEnd spying§r"
    },
    de: {
        title: "§l§bSpieler ausspionieren§r",
        body: "§7Wähle einen Spieler zum Ausspionieren:§r",

        // Shown when no other player is online
        noOtherPlayersBody: "§cEs sind keine anderen Spieler online, die du ausspionieren könntest!§r",

        ok: "OK",

        endSpying: "§l§cSpionage beenden§r"
    }
};
