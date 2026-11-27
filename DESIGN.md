---
name: ArepaTool Public Website
description: A calm black and gold storefront for a mobile service workspace.
colors:
  primary: "#f6b94c"
  background: "#090a0b"
  surface: "#121416"
  raised: "#1b1e21"
  text: "#f5f5f2"
  muted: "#aeb3b8"
  line: "#2a2d30"
  annual-surface: "#eeefeb"
  annual-text: "#151719"
typography:
  display:
    fontFamily: "Geist Variable, Geist, sans-serif"
    fontSize: "clamp(2.7rem, 4.4vw, 4.5rem)"
    fontWeight: 550
    lineHeight: 1.06
    letterSpacing: "-.035em"
  headline:
    fontFamily: "Geist Variable, Geist, sans-serif"
    fontSize: "clamp(2rem, 3.5vw, 3.25rem)"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "-.035em"
  body:
    fontFamily: "Geist Variable, Geist, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "Geist Variable, Geist, sans-serif"
    fontSize: ".8rem"
    fontWeight: 500
    lineHeight: 1.5
rounded:
  control: "10px"
  window: "14px"
  card: "16px"
  capsule: "999px"
spacing:
  small: ".75rem"
  medium: "1.5rem"
  large: "2rem"
  section: "6.5rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#1b1509"
    rounded: "{rounded.control}"
    padding: ".85rem 1.25rem"
    height: "3.15rem"
  button-secondary:
    backgroundColor: "#17191b"
    textColor: "{colors.text}"
    rounded: "{rounded.control}"
    padding: ".85rem 1.25rem"
  annual-plan:
    backgroundColor: "{colors.annual-surface}"
    textColor: "{colors.annual-text}"
    rounded: "{rounded.card}"
    padding: "2rem"
---

# Design System: ArepaTool

## Overview

**Creative North Star: "A clear workspace for the next repair"**

The public site presents a practical desktop product with generous spacing, calm near-black surfaces and a warm gold identity. The user's pinned reference, Cerberus Tool Pro, informs capsule navigation, the paired hero and contrasting annual card. ArepaTool content, colors and assets remain authoritative.

**Key Characteristics:**
- Large, restrained sans-serif headings.
- Tonal dark surfaces with gold actions.
- Clearly separated license and credit offers.
- An interactive, explicitly illustrative module preview.

Direction contract: TYPE is Geist with strong scale and moderate weights; MATERIAL is existing logo/mascot artwork and an illustrative workspace; GROUND is black with restrained gold; FORM follows the pinned reference, taking precedence over exploratory seed 0659cdb2; the quality target is its clarity, spacing and pricing hierarchy rather than its brand treatment.

## Colors

Primary gold marks key actions, selected modules and headline emphasis. Neutral surfaces provide separation. The light annual card is a deliberate pricing contrast.

**The Scope Rule.** Apply this system to public pages through the explicit marketing layout flag. Private account and admin interfaces retain their own styles.

## Typography

Geist is self-hosted by the project. Headings use balanced wrapping, negative tracking and weights around 500–550. Body copy uses comfortable line heights. Supporting preview text is smaller; prices use tabular numerals.

**The Hierarchy Rule.** Use size and spacing before extra decoration. Preserve readable technical names and localized content in ES, EN and PT-BR.

## Layout

The content container is capped at 76rem and the navigation capsule at 80rem. Desktop gutters total 3rem, reducing to 2rem on narrow screens. Hero, release details and FAQ use paired columns. Resources and licenses use three columns.

Navigation switches to its drawer below 1100px. Content stacks at 799px. Below 479px the preview selector becomes four horizontal controls and major actions fill their width. Section spacing reduces from 6.5rem to 4.5rem on mobile.

**The Clear Controls Rule.** At widths up to 799px, WhatsApp and the update reopening button live in document flow below the footer so they cannot cover content. Desktop retains corner shortcuts.

## Elevation & Depth

Use tonal layering and fine borders by default. The illustrative window has a diffuse shadow (0 26px 70px -22px #000). Ordinary cards do not need ambient glows.

FOXUNLOCKERS intentionally retains its premium fire artwork and orange treatment under an explicit user instruction. This branded exception does not define the rest of the site.

## Shapes

Controls use modest rounded corners; containers use 14–16px radii. Navigation and small labels use capsules. Editorial resource columns remain open, separated by fine rules.

## Components

- **Navigation:** four primary destinations and a native Resources disclosure. Outside click and Escape close it. The mobile drawer retains all links, account actions and languages.
- **Preview:** native radios expose one descriptive panel at a time. Selection uses gold and keyboard focus stays visible. Always show the illustrative disclosure.
- **Licenses:** three duration cards with a light annual plan. Credits occupy a separate row explaining their relationship to an active license.
- **Live strip:** preserve server-derived status, cost and cooldown. Use text as well as color. Only status is a live region, avoiding countdown announcements.
- **FAQ/release notes:** native disclosures with subtle rotation and reduced-motion support.
- **Dialogs:** keep existing content/behavior with dark/gold chrome. Close controls remain available on small screens.
- **Actions:** gold primary and outlined dark secondary. Download uses the server installer endpoint; purchases route to resellers.

**The Access Rule.** Preserve focus rings, the skip link, translated control labels and reduced-motion support. Check mobile overflow after content changes.

## Do's and Don'ts

### Do:
- **Do** preserve real prices, reseller contacts and release content.
- **Do** optimize existing artwork without changing its identity.
- **Do** keep public presentation separate from billing and account behavior.
- **Do** check desktop, mobile and all three languages.

### Don't:
- **Don't** present the preview as a live connected device.
- **Don't** invent statistics, reviews or popularity claims.
- **Don't** cover mobile controls with floating shortcuts.
- **Don't** apply the FOXUNLOCKERS fire exception to ordinary cards.
