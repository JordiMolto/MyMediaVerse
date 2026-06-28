import * as idb from "@/utils/db";
import * as api from "@/services/api/detail-templates.api";
import { useAuthStore } from "@/stores/auth";
import { DetailTemplate } from "@/types";

export async function fetchTemplates(): Promise<DetailTemplate[]> {
  const { canUseSupabase } = useAuthStore();
  return canUseSupabase ? api.fetchTemplates() : idb.getAllDetailTemplates();
}

export async function createTemplate(
  tpl: Omit<DetailTemplate, "id" | "userId" | "createdAt" | "updatedAt">,
): Promise<DetailTemplate> {
  const { canUseSupabase } = useAuthStore();
  if (canUseSupabase) return api.createTemplate(tpl);

  const newTpl: DetailTemplate = {
    ...tpl,
    id: crypto.randomUUID(),
    userId: "local",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  await idb.addDetailTemplate(newTpl);
  return newTpl;
}

export async function updateTemplate(
  id: string,
  updates: Partial<Pick<DetailTemplate, "nombre" | "tipoAsociado" | "bloques">>,
): Promise<DetailTemplate> {
  const { canUseSupabase } = useAuthStore();
  if (canUseSupabase) return api.updateTemplate(id, updates);

  const all = await idb.getAllDetailTemplates();
  const existing = all.find((t) => t.id === id);
  if (!existing) throw new Error("Template not found");
  const updated: DetailTemplate = { ...existing, ...updates, updatedAt: new Date() };
  await idb.putDetailTemplate(updated);
  return updated;
}

export async function deleteTemplate(id: string): Promise<void> {
  const { canUseSupabase } = useAuthStore();
  return canUseSupabase ? api.deleteTemplate(id) : idb.deleteDetailTemplate(id);
}
