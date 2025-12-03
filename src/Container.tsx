import React, { useState, useCallback } from "react";
import DropZone from "./DropZone";
import Node from "./Node";
import {
  handleMoveWithinParent,
  handleMoveToDifferentParent,
  handleRemoveItemFromLayout,
  handleAddItemToParent,
  handleAddRowToLayout,
  getDefaultContent,
} from "./helpers";
import {
  TreeNode,
  UpdateItemInLayout,
  UpdateRecursive,
  RenderRowProps,
  HandleDeleteItem,
  ContainerProps,
} from "./interface";

import { COMPONENT, COLUMN, ROW } from "./constants";

const Container: React.FC<ContainerProps> = ({
  treeData = [],
  hasChildrenIndicator = false,
  isCollapsed = false,
  rowHeight = 25,
  customClassName = "",
  collapseButtons = true,
  icon = null,
  editable = true,
  placeholderRenderer = null,
}) => {
  const assignIdsByIndexPath = (
    tree: TreeNode[],
    parentPath: string = ""
  ): TreeNode[] => {
    return tree.map((node, index) => {
      const path = parentPath ? `${parentPath}-${index}` : `${index}`;
      const newId = `${path}`;
      const newNode: TreeNode = { ...node, id: newId };
      if (node.children && node.children.length > 0) {
        newNode.children = assignIdsByIndexPath(node.children, path);
      }
      return newNode;
    });
  };
  const initialLayout = assignIdsByIndexPath(treeData);
  const [layout, setLayout] = useState(initialLayout);

  const handleDrop = useCallback(
    (dropZone: TreeNode, item: TreeNode) => {
      const splitDropZonePath = dropZone.path.split("-");
      const pathToDropZone = splitDropZonePath.slice(0, -1).join("-");

      const newItem: TreeNode = { ...item };
      if (item.type === COLUMN) {
        newItem.children = item.children;
      }
      // Preserve content when moving items, or add default if missing
      if (item.content) {
        newItem.content = item.content;
      } else {
        newItem.content = getDefaultContent(item.type);
      }

      // move down here since sidebar items dont have path
      const splitItemPath = item.path.split("-");
      const pathToItem = splitItemPath.slice(0, -1).join("-");

      // 2. Pure move (no create)
      if (splitItemPath.length === splitDropZonePath.length) {
        // 2.a. move within parent
        if (pathToItem === pathToDropZone) {
          setLayout(
            handleMoveWithinParent(layout, splitDropZonePath, splitItemPath)
          );
          return;
        }

        // 2.b. OR move different parent
        // TODO FIX columns. item includes children
        setLayout(
          handleMoveToDifferentParent(
            layout,
            splitDropZonePath,
            splitItemPath,
            newItem
          )
        );
        return;
      }

      // 3. Move + Create
      setLayout(
        handleMoveToDifferentParent(
          layout,
          splitDropZonePath,
          splitItemPath,
          newItem
        )
      );
    },
    [layout]
  );

  const handleAddItem = useCallback(
    (count: number, parentPath: string, itemType: string) => {
      // Helper function to clear all editing states
      const clearAllEditingStates = (items: TreeNode[]): TreeNode[] => {
        return items.map((item: TreeNode) => ({
          ...item,
          isEditing: false,
          children: item.children
            ? clearAllEditingStates(item.children)
            : undefined,
        }));
      };

      // Clear all editing states before adding new item
      const layoutWithClearedEditing = clearAllEditingStates(layout);

      if (itemType === ROW) {
        const newId = layoutWithClearedEditing.length;
        const newRow = {
          id: `${newId}`,
          type: ROW,
          children: [],
          content: getDefaultContent(ROW),
          isEditing: true, // Mark as editing when first created
        };

        setLayout(handleAddRowToLayout(layoutWithClearedEditing, newRow));
      }
      if (itemType === COLUMN) {
        // Add a new empty column to a row with default content
        const newColumn = {
          id: `${parentPath}-${count}`,
          type: COLUMN,
          children: [],
          content: getDefaultContent(COLUMN),
          isEditing: true, // Mark as editing when first created
        };

        setLayout(
          handleAddItemToParent(layoutWithClearedEditing, parentPath, newColumn)
        );
      } else if (itemType === COMPONENT) {
        // Add a new component to a column with default content
        const newItem = {
          id: `${parentPath}-${count}`,
          type: COMPONENT,
          content: getDefaultContent(COMPONENT),
          isEditing: true,
        };

        setLayout(
          handleAddItemToParent(layoutWithClearedEditing, parentPath, newItem)
        );
      }
    },
    [layout]
  );

  const handleStartEdit = useCallback(
    (itemPath: string) => {
      const updateItemInLayout: UpdateItemInLayout = (
        items: TreeNode[],
        path: string,
        updates: Partial<TreeNode>
      ): TreeNode[] => {
        const pathParts = path.split("-").map(Number);

        const updateRecursive: UpdateRecursive = (
          items: TreeNode[],
          pathIndex: number
        ): TreeNode[] => {
          if (pathIndex >= pathParts.length) return items;

          const index = pathParts[pathIndex];
          if (pathIndex === pathParts.length - 1) {
            // Last level - update the item
            return items.map((item: TreeNode, i: number) =>
              i === index ? { ...item, ...updates } : item
            );
          } else {
            // Intermediate level - recurse into children
            return items.map((item: TreeNode, i: number) =>
              i === index
                ? {
                    ...item,
                    children: updateRecursive(
                      item.children || [],
                      pathIndex + 1
                    ),
                  }
                : item
            );
          }
        };

        return updateRecursive(items, 0);
      };

      // Helper function to clear all editing states
      const clearAllEditingStates = (items: TreeNode[]): TreeNode[] => {
        return items.map((item: TreeNode) => ({
          ...item,
          isEditing: false,
          children: item.children
            ? clearAllEditingStates(item.children)
            : undefined,
        }));
      };

      // First clear all editing states, then set the new one
      const layoutWithClearedEditing = clearAllEditingStates(layout);
      setLayout(
        updateItemInLayout(layoutWithClearedEditing, itemPath, {
          isEditing: true,
        })
      );
    },
    [layout]
  );

  // Handle saving inline edit
  const handleSaveEdit: (itemPath: string, newContent: string) => void =
    useCallback(
      (itemPath: string, newContent: string) => {
        const updateItemInLayout: UpdateItemInLayout = (
          items: TreeNode[],
          path: string,
          updates: Partial<TreeNode>
        ): TreeNode[] => {
          const pathParts: number[] = path.split("-").map(Number);

          const updateRecursive: UpdateRecursive = (
            items: TreeNode[],
            pathIndex: number
          ): TreeNode[] => {
            if (pathIndex >= pathParts.length) return items;

            const index: number = pathParts[pathIndex];
            if (pathIndex === pathParts.length - 1) {
              // Last level - update the item
              return items.map((item: TreeNode, i: number) =>
                i === index ? { ...item, ...updates } : item
              );
            } else {
              // Intermediate level - recurse into children
              return items.map((item: TreeNode, i: number) =>
                i === index
                  ? {
                      ...item,
                      children: updateRecursive(
                        item.children || [],
                        pathIndex + 1
                      ),
                    }
                  : item
              );
            }
          };

          return updateRecursive(items, 0);
        };

        setLayout(
          updateItemInLayout(layout, itemPath, {
            content: newContent,
            isEditing: false,
          })
        );
      },
      [layout]
    );

  // Handle canceling inline edit
  const handleCancelEdit = useCallback(
    (itemPath: string) => {
      const updateItemInLayout: UpdateItemInLayout = (
        items: TreeNode[],
        path: string,
        updates: Partial<TreeNode>
      ): TreeNode[] => {
        const pathParts: number[] = path.split("-").map(Number);

        const updateRecursive: UpdateRecursive = (
          items: TreeNode[],
          pathIndex: number
        ): TreeNode[] => {
          if (pathIndex >= pathParts.length) return items;

          const index: number = pathParts[pathIndex];
          if (pathIndex === pathParts.length - 1) {
            // Last level - update the item
            return items.map((item: TreeNode, i: number) =>
              i === index ? { ...item, ...updates } : item
            );
          } else {
            // Intermediate level - recurse into children
            return items.map((item: TreeNode, i: number) =>
              i === index
                ? {
                    ...item,
                    children: updateRecursive(
                      item.children || [],
                      pathIndex + 1
                    ),
                  }
                : item
            );
          }
        };

        return updateRecursive(items, 0);
      };

      setLayout(updateItemInLayout(layout, itemPath, { isEditing: false }));
    },
    [layout]
  );

  const handleDeleteItem: HandleDeleteItem = useCallback(
    (itemPath: string) => {
      const splitItemPath: string[] = itemPath.split("-");
      setLayout(handleRemoveItemFromLayout(layout, splitItemPath));
    },
    [layout]
  );

  const renderRow = ({
    row,
    currentPath,
  }: RenderRowProps): React.ReactElement => {
    return (
      <Node
        key={row.id as string}
        data={row}
        handleDrop={handleDrop}
        path={currentPath}
        type={ROW}
        onAddItem={handleAddItem}
        onDeleteItem={handleDeleteItem}
        onStartEdit={handleStartEdit}
        onSaveEdit={handleSaveEdit}
        onCancelEdit={handleCancelEdit}
        hasChildrenIndicator={hasChildrenIndicator}
        isCollapsed={isCollapsed}
        rowHeight={rowHeight}
        customClassName={customClassName}
        icon={icon}
        editable={editable}
      />
    );
  };

  return (
    <div className="body">
      <div className="pageContainer">
        <div className="addRowContainer">
          {collapseButtons && editable && (
            <>
              <button
                onClick={() => handleAddItem(layout.length, "", ROW)}
                className="addItemButton"
                title="Expand all of the tree items"
              >
                Expand All
              </button>
              <button
                onClick={() => handleAddItem(layout.length, "", ROW)}
                className="addItemButton"
                title="Collapse all of the tree items"
              >
                Collapse All
              </button>
            </>
          )}
          {editable && (
            <button
              onClick={() => handleAddItem(layout.length, "", ROW)}
              className="addItemButton"
              title="Add a new row to the layout"
            >
              Add {ROW === ROW ? "Row" : "Item"}
            </button>
          )}
        </div>
        <div className="page">
          {layout.length === 0 ? (
            <>
              {placeholderRenderer ? <>{placeholderRenderer}</> : <p>No data found</p>}
            </>
          ) : (
            layout.map((row, index) => {
              const currentPath = `${index}`;
              return (
                <React.Fragment key={row.id}>
                  <DropZone
                    data={{
                      path: currentPath,
                    }}
                    onDrop={handleDrop}
                  />
                  {renderRow({ row, currentPath })}
                </React.Fragment>
              );
            })
          )}
          <DropZone
            data={{
              path: `${layout.length}`,
            }}
            onDrop={handleDrop}
            isLast
          />
        </div>
      </div>
    </div>
  );
};
export default Container;
