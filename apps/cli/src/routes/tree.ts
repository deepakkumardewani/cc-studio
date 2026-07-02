import { listAllCategories } from "../fs/scoped.js";

export async function getTreeResponse() {
  const categories = await listAllCategories();
  return {
    categories: categories.map(({ category, label, files }) => ({
      category,
      label,
      files: files.map((name) => ({ name })),
    })),
  };
}
