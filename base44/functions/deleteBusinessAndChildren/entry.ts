import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const CHILD_ENTITIES = [
  "BusinessProfile",
  "EquipoTemperatura",
  "RegistroTemperatura",
  "ZonaLimpieza",
  "RegistroLimpieza",
  "PuntoAgua",
  "RegistroAgua",
  "SuministroAgua",
  "PuntoPlaga",
  "RegistroPlaga",
  "GestorPlagas",
  "ProductoLimpieza",
  "Proveedor",
  "RegistroRecepcion",
  "RegistroMantenimiento",
  "EmpresaMantenimiento",
  "RegistroFormacion",
  "RegistroAlergeno",
  "RegistroLote",
  "RegistroCongelacion",
  "RegistroResiduo",
  "GestorResiduos",
  "Incidencia",
];

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const user = await base44.auth.me();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { business_id } = await req.json();
  if (!business_id) {
    return Response.json({ error: 'business_id es requerido' }, { status: 400 });
  }

  // Verificar que el negocio pertenece al usuario autenticado
  const businesses = await base44.asServiceRole.entities.Business.filter({ id: business_id, user_id: user.id });
  if (!businesses || businesses.length === 0) {
    return Response.json({ error: 'Negocio no encontrado o sin permisos' }, { status: 403 });
  }

  // Eliminar todas las entidades hijas
  for (const entityName of CHILD_ENTITIES) {
    const records = await base44.asServiceRole.entities[entityName].filter({ business_id });
    for (const record of records) {
      await base44.asServiceRole.entities[entityName].delete(record.id);
    }
  }

  // Finalmente eliminar el negocio
  await base44.asServiceRole.entities.Business.delete(business_id);

  return Response.json({ success: true });
});