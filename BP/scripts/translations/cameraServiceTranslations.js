/**
 * @file Translations (English / German) for the central camera service.
 *
 * Placeholders: #NAME# = camera name or player name.
 * Formatting codes: §l = bold, §7 = gray, §a = green, §c = red,
 *                   §e = yellow, §r = reset.
 *
 * @author FBW81C
 */

export const Translations = {
    en: {
        // Action bar while viewing
        viewingCamera: "§aCamera: §e§l#NAME#§r",
        viewingPlayer: "§aYou are spying on §e§l#NAME#§r§a!§r",
        viewEnded: "§7View ended. Camera reset.§r",

        // Reasons why a view was ended automatically
        cameraNotFound: "§cThis camera no longer exists. View ended.§r",
        cameraOtherDimension: "§cThe camera is located in a different dimension.§r",
        playerOffline: "§c#NAME# is no longer online. View ended.§r",
        playerOtherDimension: "§c#NAME# is in a different dimension. View ended.§r"
    },
    de: {
        // Action bar while viewing
        viewingCamera: "§aKamera: §e§l#NAME#§r",
        viewingPlayer: "§aDu spionierst §e§l#NAME#§r§a aus!§r",
        viewEnded: "§7Ansicht beendet. Kamera zurückgesetzt.§r",

        // Reasons why a view was ended automatically
        cameraNotFound: "§cDiese Kamera existiert nicht mehr. Ansicht beendet.§r",
        cameraOtherDimension: "§cDie Kamera befindet sich in einer anderen Dimension.§r",
        playerOffline: "§c#NAME# ist nicht mehr online. Ansicht beendet.§r",
        playerOtherDimension: "§c#NAME# befindet sich in einer anderen Dimension. Ansicht beendet.§r"
    }
};
