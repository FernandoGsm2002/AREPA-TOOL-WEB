// Rutas Vercel retiradas tras el corte al VPS. No deben conservar código que
// pueda firmar URLs R2 ni hablar con el relay antiguo de Supabase/NextDNS.
export function retiredEndpoint(_req, res) {
    return res.status(410).json({ error: 'Endpoint retirado. Usa la API actual de ArepaTool.' });
}
