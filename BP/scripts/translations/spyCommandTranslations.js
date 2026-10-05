/**
 * @file Translations (English / German) for the /scriptevent spy interface.
 *
 * Placeholders: #SPY# = name of the spying player,
 *               #NAME# = name of the observed player or camera.
 * Formatting codes: §a = green, §c = red, §7 = gray, §e = yellow, §r = reset.
 *
 * @author FBW81C
 */

export const Translations = {
    en: {
        usage:
            "§cUsage:§r\n" +
            "§7/scriptevent fbw81c:spy start <spy> player <name>§r\n" +
            "§7/scriptevent fbw81c:spy start <spy> camera <id|name>§r\n" +
            "§7/scriptevent fbw81c:spy stop [spy]§r\n" +
            "§7<spy> is a player name or @s.§r",
        spyNeedsPlayer: "§c@s only works if the command is run by a player.§r",
        playerNotFound: "§cPlayer §e#NAME#§c is not online.§r",
        cameraNotFound: "§cCamera §e#NAME#§c not found.§r",
        cannotSpyOnSelf: "§cA player cannot spy on themselves.§r",
        startedPlayer: "§a#SPY# is now spying on §e#NAME#§a.§r",
        startedCamera: "§a#SPY# is now viewing camera §e#NAME#§a.§r",
        stopped: "§a#SPY# stopped viewing.§r",
        notViewing: "§7#SPY# is not viewing anything.§r"
    },
    de: {
        usage:
            "§cVerwendung:§r\n" +
            "§7/scriptevent fbw81c:spy start <spy> player <name>§r\n" +
            "§7/scriptevent fbw81c:spy start <spy> camera <id|name>§r\n" +
            "§7/scriptevent fbw81c:spy stop [spy]§r\n" +
            "§7<spy> ist ein Spielername oder @s.§r",
        spyNeedsPlayer: "§c@s funktioniert nur, wenn der Befehl von einem Spieler ausgeführt wird.§r",
        playerNotFound: "§cSpieler §e#NAME#§c ist nicht online.§r",
        cameraNotFound: "§cKamera §e#NAME#§c nicht gefunden.§r",
        cannotSpyOnSelf: "§cEin Spieler kann sich nicht selbst ausspionieren.§r",
        startedPlayer: "§a#SPY# spioniert jetzt §e#NAME#§a aus.§r",
        startedCamera: "§a#SPY# sieht jetzt durch die Kamera §e#NAME#§a.§r",
        stopped: "§a#SPY# hat die Ansicht beendet.§r",
        notViewing: "§7#SPY# schaut gerade nichts an.§r"
    }
};
