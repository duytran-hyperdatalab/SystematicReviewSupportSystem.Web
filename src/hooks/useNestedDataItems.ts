import { useCallback } from "react";
import type { DataItemDefinitionExtended, FieldOption } from "../types/dataExtraction";
import { generateId } from "../utils/uuid";

interface NestedDataItemHandlers {
  flattenItems: (items: DataItemDefinitionExtended[]) => DataItemDefinitionExtended[];
  buildTree: (flatItems: DataItemDefinitionExtended[]) => DataItemDefinitionExtended[];
  handleItemChange: (
    items: DataItemDefinitionExtended[],
    index: number,
    field: keyof DataItemDefinitionExtended,
    value: unknown
  ) => DataItemDefinitionExtended[];
  handleAddOption: (items: DataItemDefinitionExtended[], itemIndex: number) => DataItemDefinitionExtended[];
  handleRemoveOption: (
    items: DataItemDefinitionExtended[],
    itemIndex: number,
    optionIndex: number
  ) => DataItemDefinitionExtended[];
  handleOptionChange: (
    items: DataItemDefinitionExtended[],
    itemIndex: number,
    optionIndex: number,
    value: string
  ) => DataItemDefinitionExtended[];
  handleAddSubItem: (items: DataItemDefinitionExtended[], parentIndex: number) => DataItemDefinitionExtended[];
  handleRemoveItem: (items: DataItemDefinitionExtended[], index: number) => DataItemDefinitionExtended[];
}

export function useNestedDataItems(): NestedDataItemHandlers {
  // Flatten nested structure for editing
  const flattenItems = useCallback((items: DataItemDefinitionExtended[]): DataItemDefinitionExtended[] => {
    const result: DataItemDefinitionExtended[] = [];

    const flatten = (itemList: DataItemDefinitionExtended[], parentId?: string) => {
      itemList.forEach((item) => {
        result.push({ ...item, parent_field_id: parentId });
        if (item.subItems && item.subItems.length > 0) {
          flatten(item.subItems, item.data_item_id);
        }
      });
    };

    flatten(items);
    return result;
  }, []);

  // Build tree structure from flat array
  const buildTree = useCallback((flatItems: DataItemDefinitionExtended[]): DataItemDefinitionExtended[] => {
    const itemMap = new Map<string, DataItemDefinitionExtended>();
    const roots: DataItemDefinitionExtended[] = [];

    flatItems.forEach((item) => {
      itemMap.set(item.data_item_id, { ...item, subItems: [] });
    });

    flatItems.forEach((item) => {
      const node = itemMap.get(item.data_item_id)!;

      if (item.parent_field_id) {
        const parent = itemMap.get(item.parent_field_id);
        if (parent) {
          parent.subItems = parent.subItems || [];
          parent.subItems.push(node);
        } else {
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    return roots;
  }, []);

  const handleItemChange = useCallback(
    (
      items: DataItemDefinitionExtended[],
      index: number,
      field: keyof DataItemDefinitionExtended,
      value: unknown
    ): DataItemDefinitionExtended[] => {
      const flatItems = flattenItems(items);
      if (flatItems[index]) {
        flatItems[index] = { ...flatItems[index], [field]: value };
        return buildTree(flatItems);
      }
      return items;
    },
    [flattenItems, buildTree]
  );

  const handleAddOption = useCallback(
    (items: DataItemDefinitionExtended[], itemIndex: number): DataItemDefinitionExtended[] => {
      const flatItems = flattenItems(items);
      const item = flatItems[itemIndex];

      if (!item) return items;

      const newOption: FieldOption = {
        option_id: `temp_${generateId()}`,
        field_id: item.data_item_id,
        option_value: "",
        display_order: (item.options?.length || 0) + 1,
      };

      flatItems[itemIndex] = {
        ...item,
        options: [...(item.options || []), newOption],
      };

      return buildTree(flatItems);
    },
    [flattenItems, buildTree]
  );

  const handleRemoveOption = useCallback(
    (items: DataItemDefinitionExtended[], itemIndex: number, optionIndex: number): DataItemDefinitionExtended[] => {
      const flatItems = flattenItems(items);
      const item = flatItems[itemIndex];

      if (!item) return items;

      flatItems[itemIndex] = {
        ...item,
        options: item.options?.filter((_, idx) => idx !== optionIndex),
      };

      return buildTree(flatItems);
    },
    [flattenItems, buildTree]
  );

  const handleOptionChange = useCallback(
    (
      items: DataItemDefinitionExtended[],
      itemIndex: number,
      optionIndex: number,
      value: string
    ): DataItemDefinitionExtended[] => {
      const flatItems = flattenItems(items);
      const item = flatItems[itemIndex];

      if (!item || !item.options || !item.options[optionIndex]) return items;

      item.options[optionIndex] = {
        ...item.options[optionIndex],
        option_value: value,
      };

      flatItems[itemIndex] = { ...item };
      return buildTree(flatItems);
    },
    [flattenItems, buildTree]
  );

  const handleAddSubItem = useCallback(
    (items: DataItemDefinitionExtended[], parentIndex: number): DataItemDefinitionExtended[] => {
      const flatItems = flattenItems(items);
      const parentItem = flatItems[parentIndex];

      if (!parentItem) return items;

      const newSubItem: DataItemDefinitionExtended = {
        data_item_id: `temp_${generateId()}`,
        form_id: parentItem.form_id,
        parent_field_id: parentItem.data_item_id,
        name: "",
        data_type: "Text",
        description: "",
        is_required: false,
        display_order: (parentItem.subItems?.length || 0) + 1,
        options: [],
        subItems: [],
      };

      flatItems.splice(parentIndex + 1, 0, newSubItem);
      return buildTree(flatItems);
    },
    [flattenItems, buildTree]
  );

  const handleRemoveItem = useCallback(
    (items: DataItemDefinitionExtended[], index: number): DataItemDefinitionExtended[] => {
      const flatItems = flattenItems(items);
      const removedItem = flatItems[index];

      if (!removedItem) return items;

      const itemsToRemove = new Set<string>([removedItem.data_item_id]);

      const findChildren = (parentId: string) => {
        flatItems.forEach((item) => {
          if (item.parent_field_id === parentId) {
            itemsToRemove.add(item.data_item_id);
            findChildren(item.data_item_id);
          }
        });
      };

      findChildren(removedItem.data_item_id);

      const filtered = flatItems.filter((item) => !itemsToRemove.has(item.data_item_id));
      return buildTree(filtered);
    },
    [flattenItems, buildTree]
  );

  return {
    flattenItems,
    buildTree,
    handleItemChange,
    handleAddOption,
    handleRemoveOption,
    handleOptionChange,
    handleAddSubItem,
    handleRemoveItem,
  };
}