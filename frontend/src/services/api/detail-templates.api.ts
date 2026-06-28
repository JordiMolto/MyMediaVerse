import { supabase } from "@/config/supabase";
import { DetailTemplate, TemplateBlocks } from "@/types";

function mapFromSupabase(row: any): DetailTemplate {
  return {
    id: row.id,
    userId: row.user_id,
    nombre: row.nombre,
    tipoAsociado: row.tipo_asociado ?? null,
    esPredeterminada: row.es_predeterminada,
    bloques: row.bloques as TemplateBlocks,
    createdAt: row.created_at ? new Date(row.created_at) : undefined,
    updatedAt: row.updated_at ? new Date(row.updated_at) : undefined,
  };
}

export async function fetchTemplates(): Promise<DetailTemplate[]> {
  if (!supabase) throw new Error("Supabase not configured");
  const { data, error } = await supabase
    .from("detail_templates")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data.map(mapFromSupabase);
}

export async function createTemplate(
  tpl: Omit<DetailTemplate, "id" | "userId" | "createdAt" | "updatedAt">,
): Promise<DetailTemplate> {
  if (!supabase) throw new Error("Supabase not configured");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("detail_templates")
    .insert({
      user_id: user.id,
      nombre: tpl.nombre,
      tipo_asociado: tpl.tipoAsociado ?? null,
      es_predeterminada: tpl.esPredeterminada,
      bloques: tpl.bloques,
    })
    .select()
    .single();
  if (error) throw error;
  return mapFromSupabase(data);
}

export async function updateTemplate(
  id: string,
  updates: Partial<Pick<DetailTemplate, "nombre" | "tipoAsociado" | "bloques">>,
): Promise<DetailTemplate> {
  if (!supabase) throw new Error("Supabase not configured");
  const payload: any = { updated_at: new Date().toISOString() };
  if (updates.nombre !== undefined) payload.nombre = updates.nombre;
  if (updates.tipoAsociado !== undefined) payload.tipo_asociado = updates.tipoAsociado;
  if (updates.bloques !== undefined) payload.bloques = updates.bloques;

  const { data, error } = await supabase
    .from("detail_templates")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return mapFromSupabase(data);
}

export async function deleteTemplate(id: string): Promise<void> {
  if (!supabase) throw new Error("Supabase not configured");
  const { error } = await supabase.from("detail_templates").delete().eq("id", id);
  if (error) throw error;
}
