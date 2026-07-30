// Mismos 8 perfiles que la app de escritorio (NextDnsService.cs) y el
// backend (AREPA-API/src/lib/dns-profiles.js) — mantener sincronizados.
export interface DnsProfileType {
  key: string;
  name: string;
  description: string;
}

export const DNS_PROFILE_TYPES: DnsProfileType[] = [
  { key: "ClaroTelcelBypass", name: "Claro/Telcel Bypass", description: "Remove Claro/Telcel MDM" },
  { key: "SamsungKGOperations", name: "Samsung KG Operations", description: "kG Lock Bypass Remove" },
  { key: "HonorBloatware", name: "IT Admin Remove (Kiosko-Entel-Movistar-Mas)", description: "Remove Worker Profiles y MDM basado en ITADMIN" },
  { key: "MotorolaWhiteScreen", name: "Motorola White Screen", description: "Remove WhiteScreen en dispositivos Motorola" },
  { key: "OppoGuard", name: "O.Guard — OPPO Locks", description: "Region Lock / SAU / Sitic-PayJoy bypass para OPPO/OnePlus" },
  { key: "TranssionInfinix", name: "Security Plugin (Transsion / Infinix)", description: "MDM Bypass para Transsion, Infinix, Tecno e itel" },
  { key: "MdmPayjoy", name: "MDM PayJoy", description: "PayJoy Device Lock Bypass" },
  { key: "GooglePlayProtect", name: "Google Play Protect", description: "Google Play Protect / Trustonic MDM Bypass" },
];
