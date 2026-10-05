/**
 * @file Translations (English / German) for the camera management menus.
 *
 * Placeholders: #COUNT# = number of cameras, #NAME# = camera name,
 *               #ID#, #X#, #Y#, #Z#, #DIMENSION#, #ROTATABLE# = camera details.
 * Formatting codes: §l = bold, §b = aqua, §7 = gray, §8 = dark gray,
 *                   §f = white, §e = yellow, §a = green, §c = red, §r = reset.
 *
 * @author FBW81C
 */

export const Translations = {
    en: {
        // Main menu
        title: "§l§bManage Cameras§r",
        body: "§7Saved cameras: §f§l#COUNT#§r",
        optionListCameras: "List all cameras",
        optionAddCamera: "Add new camera",

        // Camera list
        listTitle: "§l§bCameras§r",
        listBody: "§7Choose a camera:§r",
        noCameras: "§7No cameras saved yet.§r",
        back: "§l§cBack§r",

        // Camera details
        detailTitle: "§l§b#NAME#§r",
        detailBody:
            "§7ID: §f#ID#§r\n" +
            "§7Position: §f#X#, #Y#, #Z#§r\n" +
            "§7Dimension: §f#DIMENSION#§r\n" +
            "§7Rotatable: #ROTATABLE#§r",
        yes: "§aYes§r",
        no: "§cNo§r",
        optionGiveItem: "Get camera item",
        optionEditCamera: "Edit camera",
        optionDeleteCamera: "§l§cDelete camera§r",
        cameraNotFound: "§cThis camera no longer exists.§r",

        // Display names for dimension ids
        dimensions: {
            "minecraft:overworld": "Overworld",
            "minecraft:nether": "Nether",
            "minecraft:the_end": "The End"
        },

        // Add camera
        addTitle: "§l§bAdd Camera§r",
        fieldName: "§lName§r",
        fieldNamePlaceholder: "e.g. Main entrance",
        fieldNameEdit: "§lName§r",
        fieldNameEditPlaceholder: "Camera name",
        fieldRotatable: "§7Camera can be rotated§r",
        fieldX: "§lX§r",
        fieldY: "§lY§r",
        fieldZ: "§lZ§r",
        fieldPitch: "§lPitch§r §8(-90 to 90)§r",
        fieldYaw: "§lYaw§r §8(-180 to 180)§r",
        errorInvalidCoordinates: "§cInvalid input: X, Y, Z must be numbers, pitch -90 to 90, yaw -180 to 180.§r",
        errorNameRequired: "§cPlease enter a camera name.§r",
        cameraSaved: "§aCamera §e§l#NAME#§r§a saved.§r",

        // Edit camera
        editTitle: "§l§bEdit Camera§r",
        fieldUpdatePosition: "§7Use current player position & rotation (overrides fields)§r",
        errorNameEmpty: "§cThe name must not be empty.§r",

        // Delete camera
        deleteTitle: "§l§cDelete camera?§r",
        deleteBody: "§7Do you really want to delete §e§l#NAME#§r§7?§r",
        confirmDelete: "§l§cYes, delete§r",
        cancel: "Cancel",
        cameraDeleted: "§aCamera §e§l#NAME#§r§a deleted.§r",

        // Camera item
        inventoryUnavailable: "§cInventory not available.§r",
        inventoryFull: "§cYour inventory is full.§r",
        itemNameTag: "§l§bCamera:§r §f#NAME#§r",
        itemReceived: "§aReceived camera item for §e§l#NAME#§r§a.§r"
    },
    de: {
        // Main menu
        title: "§l§bKameraverwaltung§r",
        body: "§7Gespeicherte Kameras: §f§l#COUNT#§r",
        optionListCameras: "Alle Kameras auflisten",
        optionAddCamera: "Neue Kamera hinzufügen",

        // Camera list
        listTitle: "§l§bKameras§r",
        listBody: "§7Wähle eine Kamera aus:§r",
        noCameras: "§7Noch keine Kameras gespeichert.§r",
        back: "§l§cZurück§r",

        // Camera details
        detailTitle: "§l§b#NAME#§r",
        detailBody:
            "§7ID: §f#ID#§r\n" +
            "§7Position: §f#X#, #Y#, #Z#§r\n" +
            "§7Dimension: §f#DIMENSION#§r\n" +
            "§7Drehbar: #ROTATABLE#§r",
        yes: "§aJa§r",
        no: "§cNein§r",
        optionGiveItem: "Kamera-Item erhalten",
        optionEditCamera: "Kamera bearbeiten",
        optionDeleteCamera: "§l§cKamera löschen§r",
        cameraNotFound: "§cDiese Kamera existiert nicht mehr.§r",

        // Display names for dimension ids
        dimensions: {
            "minecraft:overworld": "Oberwelt",
            "minecraft:nether": "Nether",
            "minecraft:the_end": "Das Ende"
        },

        // Add camera
        addTitle: "§l§bKamera hinzufügen§r",
        fieldName: "§lName§r",
        fieldNamePlaceholder: "z. B. Haupteingang",
        fieldNameEdit: "§lName§r",
        fieldNameEditPlaceholder: "Kameraname",
        fieldRotatable: "§7Kamera darf gedreht werden§r",
        fieldX: "§lX§r",
        fieldY: "§lY§r",
        fieldZ: "§lZ§r",
        fieldPitch: "§lNeigung§r §8(-90 bis 90)§r",
        fieldYaw: "§lDrehung§r §8(-180 bis 180)§r",
        errorInvalidCoordinates: "§cUngültige Eingabe: X, Y, Z müssen Zahlen sein, Neigung -90 bis 90, Drehung -180 bis 180.§r",
        errorNameRequired: "§cBitte gib einen Kameranamen ein.§r",
        cameraSaved: "§aKamera §e§l#NAME#§r§a gespeichert.§r",

        // Edit camera
        editTitle: "§l§bKamera bearbeiten§r",
        fieldUpdatePosition: "§7Aktuelle Spielerposition & -rotation übernehmen (überschreibt Felder)§r",
        errorNameEmpty: "§cDer Name darf nicht leer sein.§r",

        // Delete camera
        deleteTitle: "§l§cKamera löschen?§r",
        deleteBody: "§7Soll §e§l#NAME#§r§7 wirklich gelöscht werden?§r",
        confirmDelete: "§l§cJa, löschen§r",
        cancel: "Abbrechen",
        cameraDeleted: "§aKamera §e§l#NAME#§r§a gelöscht.§r",

        // Camera item
        inventoryUnavailable: "§cInventar nicht verfügbar.§r",
        inventoryFull: "§cDein Inventar ist voll.§r",
        itemNameTag: "§l§bKamera:§r §f#NAME#§r",
        itemReceived: "§aKamera-Item für §e§l#NAME#§r§a erhalten.§r"
    }
};
