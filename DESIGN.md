---
name: Tiny Dispatch / 小小快递站
description: A daylight toy-road playmat, with one clock for two little vans.
colors:
  sage: "#b9cfaf"
  sage-light: "#d2e0c6"
  ink: "#203c49"
  road: "#304c5c"
  ivory: "#fff9e9"
  coral: "#e97c65"
  coral-dark: "#873b2c"
  teal: "#247f80"
  muted: "#3d5746"
  line: "#8aa48b"
  focus: "#164f70"
typography:
  display:
    fontFamily: "Lilita, sans-serif"
    fontSize: "34px"
    fontWeight: 400
    lineHeight: 1.1
  headline:
    fontFamily: "Trebuchet MS, PingFang SC, Microsoft YaHei, sans-serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: 1.18
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Trebuchet MS, PingFang SC, Microsoft YaHei, sans-serif"
    fontSize: "15px"
    lineHeight: 1.65
  action:
    fontFamily: "Trebuchet MS, PingFang SC, Microsoft YaHei, sans-serif"
    fontSize: "17px"
    fontWeight: 700
rounded:
  small: "8px"
  control: "12px"
  map: "24px"
spacing:
  tight: "4px"
  small: "8px"
  compact: "12px"
  regular: "16px"
  section: "24px"
  column: "32px"
components:
  button-primary:
    backgroundColor: "{colors.road}"
    textColor: "{colors.ivory}"
    rounded: "{rounded.control}"
    height: "56px"
    typography: "{typography.action}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    height: "44px"
  junction-sign:
    backgroundColor: "{colors.ivory}"
    textColor: "{colors.road}"
    rounded: "50%"
    size: "44px"
---

# Design System: Tiny Dispatch

## Overview

**Creative North Star: "The daylight toy-road playmat"**

A small town drawn like a sturdy playmat: sage land, blue asphalt and bright road paint. The terrain fills the page, and lettered coral and teal vehicles carry the action. Its depth comes from modest offset shadows, vehicle parts and a clear hierarchy, rather than photographic textures.

This is a game surface. Maps, timing and recovery lead; supporting controls use quiet, familiar semantics. The visual direction was delegated in BUILD_BRIEF.md, not selected by the user from a mockup.

**Key Characteristics:**

- Full-field sage territory and blue roads.
- Letter and color together for vehicle identity.
- Large ivory relative-turn signs.
- A shared clock and a settling delivery stamp.

## Colors

Road blue carries both the actual roads and the primary dispatch control. Sage is the territory, not a small accent. Ivory is reserved for road marks, parcels and high-contrast controls. Coral and teal identify A and B; letters always accompany the colors.

Muted green is used for secondary text. Dark coral is the readable failure color on sage. Vehicle coral is brighter and is not used for small text on the page ground. Focus blue belongs to keyboard navigation.

**The Letter Rule.** Every van and depot carries its A or B identity; color never stands alone.

## Typography

The English title uses self-hosted Lilita One. Chinese title and body use the installed CJK stack. Latin body text uses Trebuchet MS. Headings are compact and bold; counters use tabular numerals. Display lettering scales down to 22px on the compact phone and 28px in low landscape. The level heading scales from 28px desktop to 17px compact phone.

Instruction text is 15px desktop, 14px phone and 12px low landscape. Small beat/save metadata is 10–12px at the narrowest sizes; do not carry that size into new body copy.

## Layout

The outer shell is at most 1180px, with 28px desktop horizontal padding and a 32px gap between the map and 304px desk. The map uses a 700×700 logical Phaser surface and a seven-cell grid. Semantic controls sit at the same normalized coordinates as the canvas roads.

Portrait screens up to 900px stack level heading, instruction, map, beat and dispatch controls. Low landscape (height at most 500px and width at least 501px) keeps the map left and desk right. Compact phones up to 380px tighten spacing to preserve the map and actions inside 568px height. Optional help and level selection use scrollable native dialogs; level tiles are three columns.

## Elevation & Depth

The map floats on a soft blue-green offset shadow. Signs use a smaller shadow to distinguish an editable object from road paint. Dialogs use a stronger diffuse shadow and a darkened backdrop. None use hard offset blocks or glows. Canvas scenery uses restrained shadow ellipses; geometry stays functional and readable.

## Shapes

Roads have round ends and joined strokes; corners form a continuous road network. The map has broad rounded corners. Turn signs are circular, waiting pads are dashed rounded squares, and ordinary controls use the control-radius token. Depots have an ivory parcel body and a colored roof strip.

## Components

The primary action is dark road blue with ivory icon/text. Secondary retry and pause controls have a quiet outline. Disabled controls are inactive and visually muted. Keyboard focus is a three-pixel blue outline with a three-pixel offset.

Relative-turn signs cycle straight → left → right; their arrows are authored SVG icons. Waiting-pad buttons show a one-beat token, an on/off state, and `aria-pressed`. Moving vans remain clear because routing controls fade during execution and failure review.

The shared beat strip combines one counter, four beat dots and both van statuses. Every van advances on that clock. A van's waiting clock and strip status explain the occupied beat. Delivery stamps settle once over 400ms; motion uses a 650ms shared beat, smooth position interpolation and a subtle two-unit vehicle bob. Reduced motion removes interpolation, bob and stamp settling. Pause stops Phaser's loop and audio, not just the movement logic.

**The One Clock Rule.** Never give the two vans separate timers or unrelated movement rhythms.

## Do's and Don'ts

- **Do** preserve the lettered color pairing, high-contrast arrows and full-field territory.
- **Do** keep essential planning, dispatch and recovery actions visible at the supported viewport sizes.
- **Do** use semantic buttons, visible focus and a shared beat for interaction.
- **Don't** turn the game into a landing page, analytics dashboard or card grid.
- **Don't** add external runtime fonts, raster art services or analytics.
- **Don't** use the brighter vehicle coral for small error text on sage.
