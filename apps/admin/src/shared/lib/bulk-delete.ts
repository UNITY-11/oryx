export async function deleteMany(
  ids: string[],
  deleteOne: (id: string) => Promise<void>
): Promise<{ deleted: string[]; failed: string[] }> {
  const results = await Promise.allSettled(ids.map((id) => deleteOne(id)));
  const deleted: string[] = [];
  const failed: string[] = [];
  results.forEach((result, index) => {
    const id = ids[index]!;
    if (result.status === "fulfilled") deleted.push(id);
    else failed.push(id);
  });
  return { deleted, failed };
}
