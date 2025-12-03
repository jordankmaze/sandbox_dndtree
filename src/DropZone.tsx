import { useRef} from "react";
import { useDrop } from "react-dnd";
import { COMPONENT, ROW, COLUMN } from "./constants";
import { DropZoneProps } from "./interface";
const ACCEPTS = [COMPONENT, ROW, COLUMN];

const DropZone: React.FC<DropZoneProps> = ({ data, onDrop, isLast }) => {
  const ref = useRef(null);
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ACCEPTS,
    drop: (item, monitor) => {
      onDrop(data, item);
    },
    canDrop: (item, monitor) => {
      const dropZonePath = data.path;
      const splitDropZonePath = dropZonePath.split("-");
      const itemPath = (item as { path?: string }).path;

      if (!itemPath) {
        return true;
      }

      const splitItemPath = itemPath.split("-");

      // Invalid (Can't drop a parent element (row) into a child (column))
      const parentDropInChild = splitItemPath.length < splitDropZonePath.length;
      if (parentDropInChild) return false;

      // Current item can't possible move to it's own location
      if (itemPath === dropZonePath) return false;

      // Current area
      if (splitItemPath.length === splitDropZonePath.length) {
        const pathToItem = splitItemPath.slice(0, -1).join("-");
        const currentItemIndex = Number(splitItemPath.slice(-1)[0]);

        const pathToDropZone = splitDropZonePath.slice(0, -1).join("-");

        const currentDropZoneIndex = Number(splitDropZonePath.slice(-1)[0]);

        if (pathToItem === pathToDropZone) {
          const nextDropZoneIndex = currentItemIndex + 1;
          if (nextDropZoneIndex === currentDropZoneIndex) return false;
        }
      }

      return true;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const isActive = isOver && canDrop;
  drop(ref)

  return (
    <div
      className={`dropZone ${isActive ? 'active' : ''} ${isLast ? 'isLast' : ''}`}
      ref={ref}
    />
  );
};
export default DropZone;
