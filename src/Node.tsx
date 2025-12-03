import React, { useRef, useState, useEffect } from "react";
import { useDrag } from "react-dnd";
import { ROW, COLUMN, COMPONENT } from "./constants";
import DropZone from "./DropZone";
import shortid from "shortid";
import { NodeProps } from "./interface";

const Node = ({
  data,
  handleDrop,
  path,
  type,
  onAddItem,
  onDeleteItem,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  hasChildrenIndicator,
  isCollapsed,
  rowHeight,
  customClassName,
  icon,
  editable
}: NodeProps) => {
  const ref = useRef(null);
  const [editValue, setEditValue] = useState(data.content || "");
  const [collapsed, setCollapsed] = useState(isCollapsed);
  const hasChildren =
    hasChildrenIndicator && data.children && data.children.length > 0;
  const collapsible = data.children && data.children.length > 0;

  const [{ isDragging }, drag] = useDrag({
    type: type,
    item: {
      id: data.id,
      type: data.type,
      children: data.children,
      content: data.content,
      path,
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0 : 1;
  drag(ref);

  // Determine styles based on type
  const getStyles = (rowHeight: number) => {
    const baseStyle = { opacity };

    switch (type) {
      case COMPONENT:
        return { ...baseStyle, minHeight: rowHeight };
      case ROW:
        return { ...baseStyle, minHeight: rowHeight };
      case COLUMN:
        return { ...baseStyle, minHeight: rowHeight };
      default:
        return baseStyle;
    }
  };

  // Determine CSS classes based on type
  const getClassName = (customClassName: string | undefined) => {
    const customClass = customClassName
      ? `${customClassName} base draggable`
      : "base draggable";
    switch (type) {
      case ROW:
        return `${customClass} row`;
      case COLUMN:
        return `${customClass} column`;
      case COMPONENT:
        return `component draggable ${customClass}`;
      default:
        return customClass;
    }
  };

  // Handle adding new items
  const handleAddItem = () => {
    if (type === ROW) {
      // Add a new column to this row
      onAddItem(data?.children?.length ?? 0, path, COLUMN);
    } else if (type === COLUMN) {
      // Add a new component to this column
      onAddItem(data?.children?.length ?? 0, path, COMPONENT);
    }
    // Components can't have children, so no add button for them
  };

  // Handle deleting this item
  const handleDeleteItem = () => {
    onDeleteItem(path);
  };

  // Handle starting edit mode
  const handleStartEditMode = () => {
    setEditValue(data.content || "");
    onStartEdit(path);
  };

  // Handle saving edit
  const handleSaveEditMode = () => {
    onSaveEdit(path, editValue);
  };

  // Handle canceling edit
  const handleCancelEditMode = () => {
    setEditValue(data.content || "");
    onCancelEdit(path);
  };

  // Handle key press in edit mode
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveEditMode();
    } else if (e.key === "Escape") {
      handleCancelEditMode();
    }
  };

  // Update edit value when data changes
  useEffect(() => {
    setEditValue(data.content || "");
  }, [data.content]);

  // Toggle collapse state
  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  // Render children based on type
  const renderChildren = () => {
    if (type === COMPONENT) {
      return <></>;
    }

    if (collapsed) {
      return null;
    }

    if (!data.children || data.children.length === 0) {
      return (
        <DropZone
          data={{
            path: `${path}-0`,
          }}
          onDrop={handleDrop}
          className={type === ROW ? "horizontalDrag" : undefined}
          isLast={true}
        />
      );
    }

    // Determine child type
    const childType = type === ROW ? COLUMN : COMPONENT;

    return (
      <>
        {data.children.map((child: any, index: number) => {
          const currentPath = `${path}-${index}`;

          return (
            <React.Fragment key={child.id + shortid.generate()}>
              <DropZone
                data={{
                  path: currentPath,
                }}
                onDrop={handleDrop}
                isLast={data?.children && index === data.children.length - 1}
              />
              <Node
                data={child}
                handleDrop={handleDrop}
                path={currentPath}
                type={childType}
                onAddItem={onAddItem}
                onDeleteItem={onDeleteItem}
                onStartEdit={onStartEdit}
                onSaveEdit={onSaveEdit}
                onCancelEdit={onCancelEdit}
                hasChildrenIndicator={hasChildrenIndicator}
                isCollapsed={false}
                rowHeight={rowHeight}
                customClassName={customClassName}
                icon={icon}
                editable={editable}
              />
            </React.Fragment>
          );
        })}
        <DropZone
          data={{
            path: `${path}-${data.children.length}`,
          }}
          onDrop={handleDrop}
          className={type === ROW ? "horizontalDrag" : undefined}
          isLast
        />
      </>
    );
  };

  // Wrap children in appropriate container for rows
  const content =
    type === ROW ? (
      <div className="columns">{renderChildren()}</div>
    ) : (
      renderChildren()
    );

  return (
    <div ref={ref} className={getClassName(customClassName)}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={getStyles(rowHeight)} className="nodeContent">
          {collapsible && (
            <button
              onClick={toggleCollapse}
              className="collapseToggle"
              title={collapsed ? "Expand" : "Collapse"}
            >
              {collapsed ? (
                <i className="fa-solid fa-chevron-right"></i>
              ) : (
                <i className="fa-solid fa-chevron-down"></i>
              )}
            </button>
          )}
          {hasChildren && (
            <span className="hasChildren">
              ({data.children ? data.children.length : 0})
            </span>
          )}
          {icon && <span className="nodeIcon">{icon}</span>}
          {editable && !data.isEditing && (
            <span
              className={`editContent ${!data.content ? 'editContent-placeholder' : ''}`}
              onClick={handleStartEditMode}
              title="Click to edit"
            >
              {data.content || "Click to edit content..."}
            </span>
          )} 
          {!editable && (
          <span className="editContent">
              {data.content || "No content"}
            </span>
          )}
          {data.isEditing && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyPress}
                className="editInput"
                autoFocus
                placeholder="Enter content..."
              />
              <button
                onClick={handleSaveEditMode}
                className="editItemButton-confrim"
              >
                ✓
              </button>
              <button
                onClick={handleCancelEditMode}
                className="editItemButton-cancel"
              >
                ✕
              </button>
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: "4px" }}>
          {editable && (
            <>
            {type !== COMPONENT && (
              <button
                onClick={handleAddItem}
                className="addItemButton"
                title={type === ROW ? "Add Column" : "Add Component"}
              >
                Add {type === ROW ? "Column" : "Component"}
              </button>
            )}
            <button
              onClick={handleDeleteItem}
              className="deleteItemButton"
              title={`Delete this ${type.toLowerCase()}`}
            >
              Delete
            </button>
            </>
          )}
        </div>
      </div>
      {content}
    </div>
  );
};

export default Node;
