---
name: ArepaTool Website and Workspaces
description: One calm black and gold system for public pages, authentication, user, admin and reseller workspaces.
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
  app-line: "#303539"
  input-line: "#454c52"
  input-surface: "#0e1012"
  sidebar-surface: "#101214"
  modal-surface: "#15181b"
  success: "#8ed5ab"
  warning: "#eec983"
  danger: "#ff9292"
  info: "#9ec4ef"
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
  app-heading:
    fontFamily: "Geist Variable, Geist, sans-serif"
    fontSize: "2rem"
    fontWeight: 550
    lineHeight: 1.2
    letterSpacing: "-.035em"
  admin-heading:
    fontFamily: "Geist Variable, Geist, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 550
    lineHeight: 1.2
    letterSpacing: "-.025em"
  table:
    fontFamily: "Geist Variable, Geist, sans-serif"
    fontSize: ".8rem"
    lineHeight: 1.55
  technical-metadata:
    fontFamily: "JetBrains Mono, monospace"
rounded:
  app-control: "9px"
  sidebar-item: "8px"
  control: "10px"
  window: "14px"
  card: "16px"
  capsule: "999px"
spacing:
  small: ".75rem"
  medium: "1.5rem"
  large: "2rem"
  section: "6.5rem"
  compact: ".5rem"
  field-gap: ".55rem"
  form-gap: "1.4rem"
  app-gutter: "2.5rem"
  mobile-gutter: "1rem"
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
  app-button:
    backgroundColor: "{colors.primary}"
    textColor: "#1b1509"
    rounded: "{rounded.app-control}"
    height: "2.65rem"
  app-input:
    backgroundColor: "{colors.input-surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.app-control}"
    padding: ".65rem .85rem"
    height: "2.75rem"
  auth-input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.control}"
    height: "3.25rem"
  app-panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.window}"
    padding: "1.5rem"
  admin-table-cell:
    typography: "{typography.table}"
    padding: "1rem 1.1rem"
  table-header:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.muted}"
  user-sidebar:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    width: "15.5rem"
    padding: "1.75rem 1rem"
  admin-sidebar:
    backgroundColor: "{colors.sidebar-surface}"
    textColor: "{colors.text}"
    width: "16.5rem"
    padding: "1.5rem .85rem .85rem"
  app-modal:
    backgroundColor: "{colors.modal-surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.card}"
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

The approved landing composition and its guidance below remain intact. The same pinned world extends across secondary public pages, authentication, user accounts, administration and reseller tools. Operational surfaces use denser layouts without changing copy or workflows. Source evidence: `src/styles/application.css`, `auth.css`, `dashboard.css`, `admin.css` and `public-interior.css`.

## Colors

Primary gold marks key actions, selected modules and headline emphasis. Neutral surfaces provide separation. The light annual card is a deliberate pricing contrast.

**The Scope Rule.** Apply the shared black/gold identity to the entire website: landing and public interior pages, authentication, user, admin and reseller interfaces. Keep the marketing layout flag and app/interior selectors as styling boundaries; they do not exclude private screens from the refresh or change access permissions.

Operational panels use the shared surface and raised tokens, with app-line for app/admin borders and input-line for controls. Public and user-dashboard separators retain line. Success, warning, danger and info colors communicate existing states with text; gold remains the primary action and selection color.

## Typography

Geist is self-hosted by the project. Headings use balanced wrapping, negative tracking and weights around 500–550. Body copy uses comfortable line heights. Supporting preview text is smaller; prices use tabular numerals.

Geist remains the primary family throughout public, auth and application interfaces. App headings use the smaller app-heading/admin-heading roles; table copy is compact and numeric values remain tabular.

JetBrains Mono is the normative technical-metadata role for identifiers, hostnames, filenames, code/logs and technical values, using the existing `--font-mono` mapping. It is loaded through Google Fonts in `src/layouts/Layout.astro` with `display=swap`; it is not a legacy exception. Preserve role-specific sizes without turning ordinary labels or prose into monospace.

Avenir Next (with its existing Segoe UI fallback) remains only in the already-existing shared legacy heading/branding declarations. Preserve their existing file/value-scoped exceptions; do not add new Avenir declarations or broaden those exceptions to any refreshed surface.

**The Hierarchy Rule.** Use size and spacing before extra decoration. Preserve readable technical names and localized content in ES, EN and PT-BR.

## Layout

The content container is capped at 76rem and the navigation capsule at 80rem. Desktop gutters total 3rem, reducing to 2rem on narrow screens. Hero, release details and FAQ use paired columns. Resources and licenses use three columns.

Navigation switches to its drawer below 1100px. Content stacks at 799px. Below 479px the preview selector becomes four horizontal controls and major actions fill their width. Section spacing reduces from 6.5rem to 4.5rem on mobile.

**The Clear Controls Rule.** At widths up to 799px, WhatsApp and the update reopening button live in document flow below the footer so they cannot cover content. Desktop retains corner shortcuts.

Operational layout keeps the existing density: user content caps at 84rem, admin content at 104rem, and the desktop auth form at 27rem. Sidebars are sticky, viewport-height surfaces with independently scrollable navigation. User sidebar width reduces to 14rem at 1279px; admin width reduces to 15rem at 1199px. Reseller tools inherit their enclosing app/admin shell without changing visible permissions.

| Surface | Responsive behavior (maximum widths) |
| --- | --- |
| Public interiors | At 799px, reading columns stack and sticky headings become static; tutorials/resellers stack at 539px, model grids at 359px. |
| Authentication | At 799px, use a single column and hide decorative art; at 479px use mobile-gutter and keep terms actions reachable. |
| User workspace | At 899px, replace the sidebar column with in-flow three-column navigation; at 599px, stack content/actions and use mobile-gutter. |
| Admin/reseller shell | At 1023px, show the existing menu and navigation sheet, width `min(21rem, 90vw)`; at 539px, wrap headers and forms. |
| Shared controls | At 639px, inputs use 1rem text and small buttons have a 2.75rem minimum height. |

**The Containment Rule.** Keep wide tables and logs inside their own keyboard-scrollable regions, never the page viewport. Preserve columns, record values and actions; wrap long identifiers and translated labels rather than dropping data. Component height tokens describe current heights/minima; allow labels to wrap and retain larger controls in auth/mobile contexts.

## Elevation & Depth

Use tonal layering and fine borders by default. The illustrative window has a diffuse shadow (0 26px 70px -22px #000). Ordinary cards do not need ambient glows.

FOXUNLOCKERS intentionally retains its premium fire artwork and orange treatment under an explicit user instruction. This branded exception does not define the rest of the site.

App panels use fine borders without shadows. App dialogs use a 70% black overlay, no backdrop blur, and a soft shadow (0 20px 70px rgb(0 0 0 / 40%)); constrain height to `calc(100dvh - 2rem)` and scroll the contents.

## Shapes

Controls use modest rounded corners; containers use 14–16px radii. Navigation and small labels use capsules. Editorial resource columns remain open, separated by fine rules.

Operational controls use app-control, while existing auth controls retain control. Admin navigation uses sidebar-item; app panels and tables use window; dialogs use card. These density variants extend the approved landing shapes.

## Components

- **Navigation:** four primary destinations and a native Resources disclosure. Outside click and Escape close it. The mobile drawer retains all links, account actions and languages.
- **Preview:** native radios expose one descriptive panel at a time. Selection uses gold and keyboard focus stays visible. Always show the illustrative disclosure.
- **Licenses:** three duration cards with a light annual plan. Credits occupy a separate row explaining their relationship to an active license.
- **Live strip:** preserve server-derived status, cost and cooldown. Use text as well as color. Only status is a live region, avoiding countdown announcements.
- **FAQ/release notes:** native disclosures with subtle rotation and reduced-motion support.
- **Dialogs:** keep existing content/behavior with dark/gold chrome. Close controls remain available on small screens.
- **Actions:** gold primary and outlined dark secondary. Download uses the server installer endpoint; purchases route to resellers.

- **App actions and states:** retain loading, empty, error, success and disabled states and their original messages. Shared buttons use app-button as a minimum height; hover lightens gold, disabled controls remain unavailable. App transitions last 160–180ms and are suppressed for reduced motion.
- **Forms/auth:** visible labels, field-gap within fields and form-gap between auth fields. Keep current validation, autofill, password reveal, consent, verification, pending/disabled controls and submission behavior. Inputs retain a visible border; app focus uses a 2px gold outline with 3px offset. Auth controls keep their larger auth-input height.
- **Tables:** raised headers, tonal row hover, fine separators and tabular numbers. Admin cells use admin-table-cell; user history cells retain 1.125rem by 1rem padding. User history keeps a 56rem minimum table width; admin tables keep 38rem at 1023px and below, inside local overflow regions. Preserve sorting, filters, pagination, row actions and all data.
- **Sidebars:** preserve route names, order, role visibility and sign-out. Current destinations use `aria-current="page"` with a gold accent; hover and keyboard focus remain distinct. Preserve the existing admin mobile sheet and user in-flow navigation patterns.
- **Modals:** use app-modal chrome and the existing dialog semantics, focus management, Escape/dismissal rules and focus return. Keep titles, close controls and existing action order reachable; scroll content within the viewport. Auth terms retain their separate header/body/footer layout and `calc(100dvh - 1rem)` limit at 479px.
- **Public interiors/resellers:** retain capability lists, reading steps, changelogs, search/filter behavior, tutorials and reseller ordering/contact links. Preserve FOXUNLOCKERS artwork as the existing exception.

**The Preservation Rule.** This is a visual refresh only. Original copy in every locale, authentication/authorization, routes, API behavior, prices and pricing logic, balances, licensing and reseller operations remain unchanged.

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
