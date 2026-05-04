import type { ChecklistItemTemplate } from "../../types/checklist";

export interface ChecklistTreeNode extends ChecklistItemTemplate {
  children: ChecklistTreeNode[];
}

/**
 * Builds a hierarchical checklist tree from a flat API array.
 * parentId = null/undefined means root item; otherwise item is attached to its parent.
 * Every level is sorted by "order" ascending to keep rendering deterministic.
 */
export const buildChecklistTree = (items: ChecklistItemTemplate[]): ChecklistTreeNode[] => {
  const nodeMap = new Map<string, ChecklistTreeNode>();

  items.forEach((item) => {
    nodeMap.set(item.id, {
      ...item,
      children: [],
    });
  });

  const roots: ChecklistTreeNode[] = [];

  nodeMap.forEach((node) => {
    if (!node.parentId) {
      roots.push(node);
      return;
    }

    const parentNode = nodeMap.get(node.parentId);
    if (!parentNode) {
      // If parent is missing, keep item visible by promoting to root.
      roots.push({ ...node, parentId: undefined, isSubItem: false });
      return;
    }

    parentNode.children.push(node);
  });

  const sortByOrder = (a: ChecklistTreeNode, b: ChecklistTreeNode) => a.order - b.order;

  const sortRecursively = (nodes: ChecklistTreeNode[]): ChecklistTreeNode[] => {
    return nodes.sort(sortByOrder).map((node) => ({
      ...node,
      children: sortRecursively(node.children),
    }));
  };

  return sortRecursively(roots);
};

/**
 * Flattens a checklist tree in pre-order (parent first, then descendants).
 * Useful for persisting a stable ordered array back to API payloads.
 */
export const flattenChecklistTree = (nodes: ChecklistTreeNode[]): ChecklistItemTemplate[] => {
  const flattened: ChecklistItemTemplate[] = [];

  const visit = (node: ChecklistTreeNode) => {
    const { children, ...item } = node;
    flattened.push(item);
    children.forEach(visit);
  };

  nodes.forEach(visit);

  return flattened;
};
