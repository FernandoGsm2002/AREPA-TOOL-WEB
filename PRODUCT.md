# Product

<!-- impeccable:product-schema 1 -->

## Platform

Web: Astro static pages with React islands. ArepaTool itself is a Windows desktop application.

## Users

Mobile service technicians and repair workshops evaluating supported devices, obtaining a license and downloading the application. Official resellers use their own account tools; administrators manage the existing operational interfaces.

## Product Purpose

This repository contains the public website and account/admin interfaces. It explains coverage, publishes release information and connects registered users with official resellers. Authentication, licensing and service operations use the existing external APIs; the marketing page does not perform device operations.

## Positioning

One workspace for Android, Apple and supporting utilities. Demonstrate coverage with the supported-model pages, feature descriptions, tutorials and actual release notes. Do not invent customer counts, performance benchmarks or testimonials.

## Operating Context

- Public purchase links lead to the official reseller directory. Preserve names, order, artwork and contact destinations from src/lib/site-data.ts.
- The Windows download uses https://api2.arepatool.com/api/app-version/download; the server selects the installer.
- An active license is required to use the tool. Credits are separate charges for applicable operations and do not replace a license.
- Public plan prices remain sourced from locale copy: 3 months 15 USDT, 6 months 21 USDT, 1 year 32 USDT; one credit 1.5 USDT. The live Xiaomi operation cost is separate and API-provided.
- Registration, recovery, WhatsApp verification and anti-bot controls retain their current behavior.
- Public content supports Spanish, English and Brazilian Portuguese.

## Capabilities and Constraints

- Astro builds 40 static routes; React powers interactive dialogs, mobile navigation and account interfaces.
- The visual refresh covers the entire website: the approved landing, secondary public pages, authentication, user accounts, administration and reseller tools. Keep marketing, public-interior and app styling boundaries while applying the same black/gold identity.
- Preserve all original copy in Spanish, English and Brazilian Portuguese, including headings, labels, instructions, errors, legal text and release content; visual work does not authorize rewriting or new claims.
- Authentication and authorization remain unchanged: login, registration, recovery, verification, anti-bot checks, session handling, role visibility and API contracts keep their existing behavior.
- Prices and pricing logic remain unchanged, including locale-sourced plans/credits, API-provided costs, balances, licensing, reseller permissions and transactions. Preserve existing loading, empty, error, pending and disabled behavior.
- The module explorer is an illustrative preview, not a live desktop session. Keep its disclosure visible.
- Preserve the live Xiaomi status, price and cooldown logic, including its unavailable fallback.
- Current repository release content presents v3.1.0. A visual redesign is not permission to invent a release.
- Commit/push to GitHub follows the owner's existing automatic deployment workflow.

## Brand Commitments

- Keep the ArepaTool name, logo and mascot. WebP derivatives may optimize delivery while preserving originals.
- The approved public redesign uses restrained black/gold styling inspired by Cerberus Tool Pro's layout and pricing hierarchy. Preserve the approved landing guidance and extend that same pinned world across the website. See DESIGN.md.
- Geist remains the primary family. JetBrains Mono is the normative technical-metadata family, loaded by Layout.astro through Google Fonts. Avenir Next stays confined to its existing legacy declarations and exceptions.
- FOXUNLOCKERS retains its premium fire-themed owner card as an explicitly requested exception.
- Presentation changes do not authorize changes to reseller access, pricing rules, balances or authorization.

## Evidence on Hand

Repository release notes, model lists, feature descriptions, tutorials and reseller contacts are content sources. The public status endpoint supplies the Xiaomi service state and operation cost.

## Product Principles

1. Make download, licensing and compatibility easy to find.
2. Distinguish license duration from separately charged credits.
3. Preserve source-backed claims and disclose illustrative content.
4. Keep visual presentation separate from authentication, account, reseller and billing behavior across every surface.
