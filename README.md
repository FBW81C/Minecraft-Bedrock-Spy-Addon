# Spy Addon

A Minecraft Bedrock add-on that lets players **view security cameras** and **spy on other players**. Views are rendered with the `/camera` command (free camera).

Author: FBW81C
YouTube: FBW81C

![Logo Spy Addon](https://github.com/FBW81C/Minecraft-Bedrock-Spy-Addon/blob/main/RP/pack_icon.png)

[![Release Version Badge](https://img.shields.io/github/v/release/FBW81C/Minecraft-Bedrock-Spy-Addon)](https://github.com/FBW81C/Minecraft-Bedrock-Spy-Addon/releases)
[![Downloads@latest](https://img.shields.io/github/downloads/FBW81C/Minecraft-Bedrock-Spy-Addon/latest/total)](https://github.com/FBW81C/Minecraft-Bedrock-Spy-Addon/releases/latest)
[![Total Downloads](https://img.shields.io/github/downloads/FBW81C/Minecraft-Bedrock-Spy-Addon/total)](https://github.com/FBW81C/Minecraft-Bedrock-Spy-Addon/releases)


## Features

### --- This Addon is currently NOT survival friendly. The Camera Controller CAN NOT be crafted. --- 

- **Invisible Security cameras** with name, position, orientation and dimension (create, list, edit, delete)
- **Camera items**: every camera can be handed out as an item. Holding it puts you behind the camera
- **Rotatable cameras**: the viewer turns the camera with their own mouse movement
- **Spy on players**: the camera follows another player's head (position and viewing direction)
- **Command control** via `/scriptevent` (works from chat, command blocks and the server console)
- Bilingual UI (English / German)

## Requirements

| Component | Version |
|---|---|
| Minecraft Bedrock | min engine 1.21.0 (developed for v26.52) |
| `@minecraft/server` | 1.17.0 |
| `@minecraft/server-ui` | 1.3.0 |

The behavior pack declares a dependency on another pack (UUID `814102b2-fbd8-4720-a8f7-606768b7c466`), so both packs must be applied to the world.

## Installation

1. Copy the behavior pack (`BP`) into your `development_behavior_packs` folder and the matching resource pack into `development_resource_packs`.
2. Enable both packs in the world settings.
3. Load the world. Saved cameras are loaded automatically on start.

## Usage

### Items

| Item | ID | Purpose |
|---|---|---|
| Spy Controller | `fbw81c_spyaddon:camera_viewer` | Opens the main menu when used |
| Camera Viewer | `fbw81c_spyaddon:camera_viewer` | Linked to one camera. Select it in the hotbar to look through that camera |

Both items are in the *Equipment* creative category.

### Spy Controller menu

- **Spy on Player**: pick an online player to follow. If you already have an active view, an *End spying* button appears.
- **Manage Cameras**
  - *List all cameras*: open a camera to get its item, edit it or delete it
  - *Add new camera*: the form is pre-filled with your current position and rotation

Camera fields: 
- name, 
- rotatable (yes/no), 
- X, Y, Z, 
- pitch (-90 to 90), 
- yaw (-180 to 180). 

The dimension is taken from the player who creates or updates the camera. 

When editing, the *use current position & rotation* toggle overrides the fields (including the dimension).

### Camera items

1. Open *Manage Cameras*, select a camera and choose *Get camera item*.
2. Select the item in your hotbar to start the view. Switch to another slot to end it.

If a camera is deleted, items already handed out for it stop working. A view that is running at that moment ends automatically.

### Commands

Views can be started and stopped with `/scriptevent` (requires cheats / operator permissions):

```
/scriptevent fbw81c:spy start <spy> player <name>
/scriptevent fbw81c:spy start <spy> camera <id|name>
/scriptevent fbw81c:spy stop [spy]
```

- `<spy>` is a player name or `@s` (the entity that runs the command).
- Names containing spaces must be quoted: `"Mr FBW81C"`.
- `stop` without an argument stops the view of the executing player.
- `/scriptevent` does not resolve selectors. Use `/execute` for that:

```
/execute as @a[tag=agent] run scriptevent fbw81c:spy start @s camera 3
/execute as @a[tag=agent] run scriptevent fbw81c:spy stop
```

Feedback goes to the executing player. For command blocks and the console it is written to the log.

### Language

Players with the tag `Deutsch` get the German UI, everyone else gets English:

```
/tag <player> add Deutsch
```

## Behavior notes

- Only **one view per player** is possible. Starting a new one replaces the old one.
- Selecting a camera item overrides a running view. Switching away from the item only ends views that the item itself started, so spy sessions started via menu or command are not cancelled by changing hotbar slots.
- While a view is active, **breaking blocks is blocked** for that player.
- A view ends automatically (with a chat message) if the camera was deleted, the observed player left, or the target is in a different dimension.
- Rotatable cameras follow the viewer's own mouse movement. Fixed cameras keep the saved rotation.

## Project structure

```
BP/
├── manifest.json
├── items/
│   ├── camera_viewer.json
│   └── spy_controller.json
└── scripts/
    ├── main.js                  Entry point, opens the menu on item use
    ├── worldLoad.js             Loads persisted data on startup
    ├── constants.js             Camera list, id counter, persistence
    ├── helpers.js               getLang() and format() helpers
    ├── cameraService.js         Central view loop + startView/stopView/getView
    ├── spyScriptEvent.js        /scriptevent interface
    ├── ui/
    │   ├── spyController.js     Main menu
    │   ├── playerSpyController.js   "Spy on Player" menu
    │   └── manageCameras.js     Camera management + hotbar monitoring
    └── translations/            English / German texts per module
```

## Architecture

All camera control goes through `cameraService.js`. Features never run `/camera` themselves. They only add or remove an entry in the service's `activeViews` map:

```js
import { startView, stopView, getView } from "./cameraService.js";

startView(spyId, { type: "player", id: "Steve" });  // spy on a player (by name)
startView(spyId, { type: "camera", id: 3 });        // look through camera 3
stopView(spyId);                                    // end the view
getView(spyId);                                     // current view or undefined
```

```
 menu / camera item / /scriptevent ──► startView() / stopView()
                                              │
                                        activeViews (Map)
                                              │
                         one loop per tick ◄──┘
                                              │
                    set / update / clear camera, validate target,
                    update action bar, send messages
```

The loop applies new views, resets removed views with `camera @s clear`, and skips identical commands for fixed cameras. To add a new way of starting a view (for example a custom command), call `startView()` / `stopView()`. Nothing else is needed.

### Data storage

Cameras are stored as JSON in the world dynamic property `fbw81c_spyaddon:cameras`. Camera items store their camera id in the item dynamic property `spyaddon:camera_id`.

## Known limitations

- After `/reload`, a running view is lost from memory but the player's camera stays set. Run `/camera @s clear` manually.
- Anyone who has the Spy Controller item can use all menus. There is no permission system.

## Possible future features

- Permission system for accessing the Spy Controller
- More languages
- Commands for managing cameras (placing, removing, editing) e.g: `/scriptevent fbw81c:spy add camera Home false 100 50 200 0 0`
