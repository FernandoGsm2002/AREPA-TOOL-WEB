# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Técnicos y talleres de reparación de celulares (GSM) que usan la app de escritorio ArepaTool para
desbloquear/reparar equipos de sus propios clientes: FRP Samsung, MDM bypass, iCloud bypass, fix
de apps bancarias tras rootear, generación de perfiles DNS para remover bloqueos corporativos.

Canal secundario: distribuidores/revendedores verificados (mostrados en "Distribuidores
Oficiales") que venden las licencias a otros técnicos — el panel no tiene checkout propio.

## Product Purpose

ArepaTool es un software profesional de desbloqueo para Windows dirigido a dispositivos Android e
iOS bloqueados. Este panel web (`AREPA-TOOL-PANEL`) es la landing pública + backend de
licencias/autenticación (auth propia contra una API en un VPS, migrada recientemente fuera de
Supabase) — no es la herramienta en sí, es donde el técnico descubre la cobertura de dispositivos,
se registra, y activa/gestiona su licencia. Éxito = un técnico entiende qué puede desbloquear hoy,
confía en que se sigue actualizando, y termina con una licencia activa (vía revendedor) o una
cuenta registrada.

## Positioning

Precio competitivo frente a otras herramientas de unlock, velocidad (tanto en soporte al cliente
como en sacar parches/soporte a dispositivos nuevos), soporte activo (comunidad de WhatsApp +
revendedores) y cadencia de actualización constante. Esto es evidencia real, no aspiracional: el
changelog embebido en la portada documenta versiones reales (v2.1.0, v2.0.8) con soporte agregado
a Motorola MTK 2026, nuevos servidores DNS, fixes concretos — la landing debe seguir mostrando esa
evidencia, no reemplazarla por promesas vagas.

## Operating Context

- La compra real ocurre fuera del panel: revendedores cobran por USDT/Binance/soles peruanos vía
  WhatsApp/Telegram. El panel muestra "Consultar Precio", nunca un checkout propio.
- El ejecutable de Windows se distribuye vía Mediafire con contraseña de archivo .rar.
- La licencia permite 1 sesión activa por dispositivo con ventana de 6h antes de poder cambiar de
  PC (control de HWID en el backend).
- Comunidad de soporte vía grupo de WhatsApp, con verificación de email + Cloudflare Turnstile
  antes de entregar el link de invitación.

## Capabilities and Constraints

- El panel es un sitio estático (HTML/CSS/JS vanilla, sin build step) desplegado en Vercel; el
  backend de auth/licencias es una API Node propia corriendo en un VPS.
- No hay pago/checkout integrado en el sitio.
- Turnstile anti-bot ya integrado en registro, forgot-password y el modal del grupo de WhatsApp —
  preservar.
- Terminología de producto que la audiencia técnica ya conoce y no debe simplificarse: "MDM
  bypass", "FRP", "iCloud bypass", "DNS bypass", nombres de chipset/marca (MTK, Samsung, Apple).

## Brand Commitments

- Nombre "ArepaTool", isotipo en `pngs/arepalanding.png`.
- Identidad visual incumbente: tema oscuro morado/índigo con estética "herramienta técnica /
  terminal", tipografía display Orbitron + cuerpo Inter + JetBrains Mono (usada para el bloque de
  changelog con formato de editor de código). Evidencia visual existente — su continuidad o
  reemplazo se decide en el trabajo de diseño (new-work), no aquí.
- Lista real de distribuidores verificados (Leope-Gsm, SmartBeUnlock, Ohidera Unlocker,
  JavierBaronGSM) con sus contactos reales (WhatsApp/Telegram/sitio) — no inventar, no modificar,
  no reordenar sin motivo.

## Evidence on Hand

- Changelog real embebido en la portada (v2.1.0 y v2.0.8) — contenido de producto verídico; se
  puede rediseñar la presentación pero no inventar entradas nuevas.
- 3 videos tutoriales reales en YouTube (IDs en `index.html`).
- Lista de distribuidores verificados con contactos reales, ver arriba.
- Sin testimonios, reviews de clientes, cifras de usuarios o benchmarks documentados — no
  fabricar ninguno de estos para la landing.

## Product Principles

1. La landing existe para demostrar cobertura de dispositivos y cadencia de actualización real,
   no solo para "vender una app" con lenguaje genérico.
2. Todo call-to-action de compra dirige a un revendedor real o a "Registro" — nunca a un checkout
   inexistente.
3. La confianza es central: son talleres que dependen del software para su negocio. Evidencia real
   (changelog, distribuidores verificados, precio/velocidad/soporte) pesa más que promesas vagas.
4. La audiencia es técnica: no diluir ni explicar de más los términos del dominio (FRP, MDM,
   iCloud bypass, DNS).
