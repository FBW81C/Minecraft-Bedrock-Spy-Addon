/**
 * @file Camera management: create, list, edit and delete security cameras,
 *       hand out camera items and show a camera's view while the item is held.
 * @author FBW81C
 */

import { world, system, ItemStack } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { Translations } from "../translations/manageCamerasTranslations.js";
import { getLang, format } from "../helpers.js";
import { cameras, saveCameras, getNextCameraId } from "../constants.js";
import { startView, stopView, getView } from "../cameraService.js";

/** Item id of the camera viewer item. */
const CAMERA_ITEM_ID = "fbw81c:camera_viewer";

/** Dynamic property on the camera item that stores the linked camera id. */
const CAMERA_ID_PROPERTY = "spyaddon:camera_id";

/**
 * Hotbar slot in which each player last held a camera item (-1 if none).
 * Used to detect when a player switches to a camera item.
 * @type {Map<string, number>}
 */
const lastSelectedCamera = new Map();

/**
 * Players whose current view was started by holding a camera item.
 * Maps a player id to the id of that camera. Only these views are ended
 * again when the item is deselected, so views started in another way
 * (spy menu, /scriptevent) are never cancelled by switching hotbar slots.
 * @type {Map<string, number>}
 */
const itemStartedViews = new Map();

// CAMERA MANAGEMENT MENUS

/**
 * Opens the camera management main menu.
 *
 * @param {import("@minecraft/server").Player} player
 */
export async function openManageCamerasMenu(player) {
    const t = Translations[getLang(player)];

    const form = new ActionFormData()
        .title(t.title)
        .body(format(t.body, { COUNT: cameras.length }))
        .button(t.optionListCameras)
        .button(t.optionAddCamera);

    const result = await form.show(player);

    if (result.canceled) return;

    if (result.selection === 0) {
        await listAllCameras(player);
    } else if (result.selection === 1) {
        await showAddCameraMenu(player);
    }
}

/**
 * Shows a list of all saved cameras. Selecting one opens its detail menu.
 *
 * @param {import("@minecraft/server").Player} player
 */
async function listAllCameras(player) {
    const t = Translations[getLang(player)];

    const form = new ActionFormData()
        .title(t.listTitle)
        .body(cameras.length > 0 ? t.listBody : t.noCameras);

    for (const camera of cameras) {
        form.button(camera.name);
    }

    // The back button comes after all camera buttons.
    form.button(t.back);

    const result = await form.show(player);

    if (result.canceled) return;

    if (result.selection === cameras.length) {
        await openManageCamerasMenu(player);
        return;
    }

    const camera = cameras[result.selection];

    if (camera) {
        await showCameraDetails(player, camera.id);
    }
}

/**
 * Shows the details of a camera with actions (give item, edit, delete).
 *
 * @param {import("@minecraft/server").Player} player
 * @param {number} cameraId Id of the camera to show.
 */
async function showCameraDetails(player, cameraId) {
    const t = Translations[getLang(player)];
    const camera = cameras.find(c => c.id === cameraId);

    if (!camera) {
        player.sendMessage(t.cameraNotFound);
        return;
    }

    const form = new ActionFormData()
        .title(format(t.detailTitle, { NAME: camera.name }))
        .body(
            format(t.detailBody, {
                ID: camera.id,
                X: camera.position.x.toFixed(2),
                Y: camera.position.y.toFixed(2),
                Z: camera.position.z.toFixed(2),
                DIMENSION: t.dimensions[camera.dimension] ?? camera.dimension,
                ROTATABLE: camera.canRotate ? t.yes : t.no
            })
        )
        .button(t.optionGiveItem)
        .button(t.optionEditCamera)
        .button(t.optionDeleteCamera)
        .button(t.back);

    const result = await form.show(player);

    if (result.canceled) return;

    switch (result.selection) {
        case 0:
            giveCameraItem(player, camera);
            await showCameraDetails(player, cameraId); break;
        case 1:
            await showEditCameraMenu(player, cameraId); break;
        case 2:
            await deleteCamera(player, cameraId); break;
        case 3:
            await listAllCameras(player); break;
    }
}


// POSITION / ROTATION HELPERS

/**
 * Rounds a number to two decimals and converts it to a string,
 * so it can be used as a text field default value.
 *
 * @param {number} value
 * @returns {string}
 */
function fmt(value) {
    return String(Number(value.toFixed(2)));
}

/**
 * Parses a number from a text field. Accepts a decimal comma ("12,5").
 *
 * @param {unknown} value Raw form value.
 * @returns {number} The parsed number, or NaN if the input is empty or invalid.
 */
function parseNumber(value) {
    if (typeof value !== "string" || !value.trim()) return NaN;
    return Number(value.trim().replace(",", "."));
}

/**
 * Reads and validates X, Y, Z, pitch and yaw from the form values.
 * Pitch must be within -90..90 and yaw within -180..180.
 *
 * @param {unknown[]} values Raw values in the order [x, y, z, pitch, yaw].
 * @returns {{position: {x: number, y: number, z: number}, rotation: {x: number, y: number}} | null}
 *          The parsed pose, or null if any value is invalid.
 */
function parsePose(values) {
    const [x, y, z, pitch, yaw] = values.map(parseNumber);

    if (![x, y, z, pitch, yaw].every(Number.isFinite)) return null;
    if (pitch < -90 || pitch > 90) return null;
    if (yaw < -180 || yaw > 180) return null;

    return {
        position: { x, y, z },
        rotation: { x: pitch, y: yaw }
    };
}

// ADD

/**
 * Shows the "add camera" form. Position and rotation fields are
 * pre-filled with the player's current values.
 *
 * @param {import("@minecraft/server").Player} player
 */
async function showAddCameraMenu(player) {
    const t = Translations[getLang(player)];

    const loc = player.location;
    const rot = player.getRotation();

    const form = new ModalFormData()
        .title(t.addTitle)
        .textField(t.fieldName, t.fieldNamePlaceholder, "")
        .toggle(t.fieldRotatable, true)
        .textField(t.fieldX, "0", fmt(loc.x))
        .textField(t.fieldY, "0", fmt(loc.y))
        .textField(t.fieldZ, "0", fmt(loc.z))
        .textField(t.fieldPitch, "0", fmt(rot.x))
        .textField(t.fieldYaw, "0", fmt(rot.y));

    const result = await form.show(player);

    if (result.canceled) return;

    const [name, canRotate, ...poseValues] = result.formValues;

    if (typeof name !== "string" || !name.trim()) {
        player.sendMessage(t.errorNameRequired);
        return;
    }

    const pose = parsePose(poseValues);

    if (!pose) {
        player.sendMessage(t.errorInvalidCoordinates);
        return;
    }

    const camera = {
        id: getNextCameraId(),
        name: name.trim(),
        position: pose.position,
        rotation: pose.rotation,
        dimension: player.dimension.id,
        canRotate: Boolean(canRotate)
    };

    cameras.push(camera);
    saveCameras();

    player.sendMessage(format(t.cameraSaved, { NAME: camera.name }));
    await showCameraDetails(player, camera.id);
}

// EDIT

/**
 * Shows the "edit camera" form, pre-filled with the camera's saved values.
 * The last toggle replaces position, rotation and dimension with the
 * player's current ones.
 *
 * @param {import("@minecraft/server").Player} player
 * @param {number} cameraId Id of the camera to edit.
 */
async function showEditCameraMenu(player, cameraId) {
    const t = Translations[getLang(player)];
    const camera = cameras.find(c => c.id === cameraId);

    if (!camera) return;

    const form = new ModalFormData()
        .title(t.editTitle)
        .textField(t.fieldNameEdit, t.fieldNameEditPlaceholder, camera.name)
        .toggle(t.fieldRotatable, camera.canRotate)
        .textField(t.fieldX, "0", fmt(camera.position.x))
        .textField(t.fieldY, "0", fmt(camera.position.y))
        .textField(t.fieldZ, "0", fmt(camera.position.z))
        .textField(t.fieldPitch, "0", fmt(camera.rotation.x))
        .textField(t.fieldYaw, "0", fmt(camera.rotation.y))
        .toggle(t.fieldUpdatePosition, false);

    const result = await form.show(player);

    if (result.canceled) return;

    const [name, canRotate, x, y, z, pitch, yaw, useCurrentPose] = result.formValues;

    if (typeof name !== "string" || !name.trim()) {
        player.sendMessage(t.errorNameEmpty);
        return;
    }

    let newPosition;
    let newRotation;
    let newDimension = camera.dimension;

    if (useCurrentPose) {
        // Take over the player's current location, rotation and dimension.
        newPosition = {
            x: player.location.x,
            y: player.location.y,
            z: player.location.z
        };
        newRotation = {
            x: player.getRotation().x,
            y: player.getRotation().y
        };
        newDimension = player.dimension.id;
    } else {
        const pose = parsePose([x, y, z, pitch, yaw]);

        if (!pose) {
            player.sendMessage(t.errorInvalidCoordinates);
            return;
        }

        newPosition = pose.position;
        newRotation = pose.rotation;
    }

    // Apply the changes only after everything has been validated.
    camera.name = name.trim();
    camera.canRotate = Boolean(canRotate);
    camera.position = newPosition;
    camera.rotation = newRotation;
    camera.dimension = newDimension;

    saveCameras();

    await showCameraDetails(player, cameraId);
}

// DELETE

/**
 * Asks for confirmation and deletes the camera.
 *
 * @param {import("@minecraft/server").Player} player
 * @param {number} cameraId Id of the camera to delete.
 */
async function deleteCamera(player, cameraId) {
    const t = Translations[getLang(player)];
    const camera = cameras.find(c => c.id === cameraId);

    if (!camera) return;

    const form = new ActionFormData()
        .title(t.deleteTitle)
        .body(format(t.deleteBody, { NAME: camera.name }))
        .button(t.confirmDelete)
        .button(t.cancel);

    const result = await form.show(player);

    if (result.canceled || result.selection !== 0) {
        await showCameraDetails(player, cameraId);
        return;
    }

    // Imported bindings cannot be reassigned, so the array is modified in place.
    const index = cameras.findIndex(c => c.id === cameraId);
    if (index !== -1) cameras.splice(index, 1);
    saveCameras();

    // Camera items that were already handed out become invalid.
    player.sendMessage(format(t.cameraDeleted, { NAME: camera.name }));
    await listAllCameras(player);
}

// CAMERA ITEM

/**
 * Gives the player a camera viewer item linked to the given camera.
 *
 * @param {import("@minecraft/server").Player} player
 * @param {import("../constants.js").Camera} camera
 */
function giveCameraItem(player, camera) {
    const t = Translations[getLang(player)];
    const inventory = player.getComponent("minecraft:inventory")?.container;

    if (!inventory) {
        player.sendMessage(t.inventoryUnavailable);
        return;
    }

    const item = new ItemStack(CAMERA_ITEM_ID, 1);

    item.nameTag = format(t.itemNameTag, { NAME: camera.name });
    item.setDynamicProperty(CAMERA_ID_PROPERTY, camera.id);

    // addItem returns the part of the stack that did not fit.
    const leftover = inventory.addItem(item);

    if (leftover) {
        player.sendMessage(t.inventoryFull);
        return;
    }

    player.sendMessage(format(t.itemReceived, { NAME: camera.name }));
}

// HOTBAR MONITORING

// Every 2 ticks: start the camera view when a player selects a camera item,
// and end it when they switch to another item. The actual camera handling
// is done by the camera service, this only adds / removes the view.
system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        const inventory = player.getComponent("minecraft:inventory")?.container;

        if (!inventory) continue;

        const slot = player.selectedSlotIndex;
        const item = inventory.getItem(slot);

        const isCameraItem =
            item?.typeId === CAMERA_ITEM_ID;

        const previousSlot = lastSelectedCamera.get(player.id);

        if (isCameraItem) {
            const cameraId = item.getDynamicProperty(CAMERA_ID_PROPERTY);
            const camera = cameras.find(c => c.id === cameraId);

            // Only (re)start the view when the selected slot changed.
            if (camera && previousSlot !== slot) {
                startView(player.id, { type: "camera", id: camera.id });
                itemStartedViews.set(player.id, camera.id);
            }
        } else if (itemStartedViews.has(player.id)) {
            const cameraId = itemStartedViews.get(player.id);
            itemStartedViews.delete(player.id);

            // Only end the view if it is still the one the item started.
            const view = getView(player.id);

            if (view?.type === "camera" && view.id === cameraId) {
                stopView(player.id);
            }
        }

        lastSelectedCamera.set(
            player.id,
            isCameraItem ? slot : -1
        );
    }
}, 2);

// Prevent block breaking while looking through a camera or at another player.
world.beforeEvents.playerBreakBlock.subscribe((event) => {
    if (!getView(event.player.id)) return;

    event.cancel = true;
});

// Clean up when a player leaves.
world.afterEvents.playerLeave.subscribe(({ playerId }) => {
    lastSelectedCamera.delete(playerId);
    itemStartedViews.delete(playerId);
});
