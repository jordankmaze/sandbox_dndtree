export interface DropZoneProps {
  data: any;
  onDrop: (data: any, item: any) => void;
  isLast?: boolean;
  className?: string;
}

export interface TreeNode {
    id?: string;
    type: string;
    children?: TreeNode[];
    content?: string;
    isEditing?: boolean;
    [key: string]: any;
}

export interface UpdateItemInLayout {
    (
      items: TreeNode[],
      path: string,
      updates: Partial<TreeNode>
    ): TreeNode[];
}

export interface UpdateRecursive {
    (
      items: TreeNode[],
      pathIndex: number
    ): TreeNode[];
}

export interface HandleDeleteItem {
    (itemPath: string): void;
}

export interface RenderRowProps {
    row: TreeNode;
    currentPath: string;
}

export interface ContainerProps {
  treeData?: TreeNode[];
  hasChildrenIndicator?: boolean;
  isCollapsed?: boolean;
  rowHeight?: number;
  customClassName?: string;
  collapseButtons?: boolean;
  icon?: React.ReactNode;
  editable?: boolean;
  placeholderRenderer?: React.ReactNode;
}

export interface NodeProps {
  data: TreeNode;
  handleDrop: (data: any, item: any) => void;
  path: string;
  type: string;
  onAddItem: (index: number, path: string, type: string) => void;
  onDeleteItem: (path: string) => void;
  onStartEdit: (path: string) => void;
  onSaveEdit: (path: string, value: string) => void;
  onCancelEdit: (path: string) => void;
  hasChildrenIndicator: boolean;
  isCollapsed: boolean;
  rowHeight: number;
  customClassName?: string;
  icon?: React.ReactNode;
  editable?: boolean;
}