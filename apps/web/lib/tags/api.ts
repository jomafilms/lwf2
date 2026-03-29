/** Client-side helpers for the tags/lists API */

export interface Tag {
  id: string;
  name: string;
  ownerId: string;
  visibility: "private" | "public" | "org";
  color: string | null;
  createdAt: string;
}

export interface TagAssignment {
  id: string;
  tagId: string;
  targetType: "plant" | "nursery" | "property" | "plan";
  targetId: string;
}

// ─── Tag CRUD ────────────────────────────────────────────────────────────────

export async function fetchTags(): Promise<Tag[]> {
  const res = await fetch("/api/tags");
  if (!res.ok) throw new Error("Failed to fetch tags");
  return res.json() as Promise<Tag[]>;
}

export async function createTag(data: {
  name: string;
  color?: string;
  visibility?: string;
}): Promise<Tag> {
  const res = await fetch("/api/tags", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create tag");
  return res.json() as Promise<Tag>;
}

export async function updateTag(
  id: string,
  data: { name?: string; color?: string; visibility?: string }
): Promise<Tag> {
  const res = await fetch(`/api/tags/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update tag");
  return res.json() as Promise<Tag>;
}

export async function deleteTag(id: string): Promise<void> {
  const res = await fetch(`/api/tags/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete tag");
}

// ─── Assignments ─────────────────────────────────────────────────────────────

export async function assignTag(
  tagId: string,
  targetType: string,
  targetId: string
): Promise<TagAssignment> {
  const res = await fetch(`/api/tags/${tagId}/assign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ targetType, targetId }),
  });
  if (!res.ok) throw new Error("Failed to assign tag");
  return res.json() as Promise<TagAssignment>;
}

export async function unassignTag(
  tagId: string,
  targetId: string
): Promise<void> {
  const res = await fetch(`/api/tags/${tagId}/assign/${targetId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to unassign tag");
}

export async function fetchTagItems(
  tagId: string
): Promise<{ tag: Tag; items: TagAssignment[] }> {
  const res = await fetch(`/api/tags/${tagId}/items`);
  if (!res.ok) throw new Error("Failed to fetch tag items");
  return res.json() as Promise<{ tag: Tag; items: TagAssignment[] }>;
}

export async function fetchTagAssignments(
  tagId: string
): Promise<TagAssignment[]> {
  const res = await fetch(`/api/tags/${tagId}/assign`);
  if (!res.ok) throw new Error("Failed to fetch assignments");
  return res.json() as Promise<TagAssignment[]>;
}

/** Fetch all assignments across all user tags (for checking which lists a plant is in) */
export async function fetchAllUserAssignments(): Promise<{
  tags: Tag[];
  assignmentsByTag: Record<string, TagAssignment[]>;
}> {
  const userTags = await fetchTags();
  const assignmentsByTag: Record<string, TagAssignment[]> = {};

  // Fetch assignments for each tag in parallel
  await Promise.all(
    userTags.map(async (tag) => {
      try {
        const assignments = await fetchTagAssignments(tag.id);
        assignmentsByTag[tag.id] = assignments;
      } catch {
        assignmentsByTag[tag.id] = [];
      }
    })
  );

  return { tags: userTags, assignmentsByTag };
}

// ─── Fork Lists ──────────────────────────────────────────────────────────────

export async function forkTag(tagId: string): Promise<{
  success: boolean;
  newTag: Tag;
  copiedItems: number;
}> {
  const res = await fetch(`/api/tags/${tagId}/fork`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to fork list");
  return res.json();
}
