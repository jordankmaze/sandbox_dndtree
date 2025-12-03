import { StrictMode } from "react";
import Container from "./Container";
import { DndProvider } from "react-dnd";
import { createRoot } from "react-dom/client";
import { HTML5Backend } from "react-dnd-html5-backend";
import "./styles.css";
import initialData from "./initial-data";

// Inject custom styles into the document
function App() {
  console.log(initialData.layout);
  return (
    <div className="App">
      <DndProvider backend={HTML5Backend}>
        <Container
          treeData={initialData.layout}
          hasChildrenIndicator={true}
          isCollapsed={false}
          collapseButtons={true}
          rowHeight={25} // 23px is the minimum height
          customClassName={''}
          icon={null}
          editable={true}
          placeholderRenderer={null}
        />
      </DndProvider>
    </div>
  );
}

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
