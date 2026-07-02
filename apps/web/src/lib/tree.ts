import { fileHref, type ApiCategory, type TreeCategory } from "./api";

export type TreeFile = {
  kind: "file";
  name: string;
  href: string;
};

export type TreeFolder = {
  kind: "folder";
  name: string;
  children: TreeNode[];
};

export type TreeNode = TreeFile | TreeFolder;

type FolderBuilder = {
  folders: Map<string, FolderBuilder>;
  files: Map<string, string>;
};

function createFolderBuilder(): FolderBuilder {
  return { folders: new Map(), files: new Map() };
}

function insertPath(root: FolderBuilder, path: string): void {
  const parts = path.split("/");
  if (parts.length === 1) {
    root.files.set(parts[0], path);
    return;
  }

  let current = root;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!current.folders.has(part)) {
      current.folders.set(part, createFolderBuilder());
    }
    current = current.folders.get(part)!;
  }

  const fileName = parts[parts.length - 1];
  current.files.set(fileName, path);
}

function sortNodes(nodes: TreeNode[]): TreeNode[] {
  return [...nodes]
    .sort((a, b) => {
      if (a.kind !== b.kind) {
        return a.kind === "folder" ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    })
    .map((node) => {
      if (node.kind === "folder") {
        return { ...node, children: sortNodes(node.children) };
      }
      return node;
    });
}

function folderBuilderToNodes(builder: FolderBuilder, category: ApiCategory): TreeNode[] {
  const nodes: TreeNode[] = [];

  for (const [name, sub] of builder.folders) {
    nodes.push({
      kind: "folder",
      name,
      children: folderBuilderToNodes(sub, category),
    });
  }

  for (const [name, fullPath] of builder.files) {
    nodes.push({
      kind: "file",
      name,
      href: fileHref(category, fullPath),
    });
  }

  return sortNodes(nodes);
}

export function buildTree(category: TreeCategory): TreeNode[] {
  if (category.files.length === 0) {
    return [];
  }

  const root = createFolderBuilder();
  for (const file of category.files) {
    insertPath(root, file.name);
  }

  return folderBuilderToNodes(root, category.category);
}
