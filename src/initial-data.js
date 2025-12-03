import { COMPONENT, ROW, COLUMN } from "./constants";

const initialData = {
  layout: [
    {
      type: ROW,
      id: "row0",
      content: "row0",
      children: [
        {
          type: COLUMN,
          id: "column0",
          content: "column0",
          children: [
            {
              type: COMPONENT,
              id: "component0",
              content: "component0"
            },
            {
              type: COMPONENT,
              id: "component1",
              content: "component1"
            }
          ]
        },
        {
          type: COLUMN,
          id: "column1",
          content: "column1",
          children: [
            {
              type: COMPONENT,
              id: "component2",
              content: "component2"
            }
          ]
        }
      ]
    },
    {
      type: ROW,
      id: "row1",
      content: "row1",
      children: [
        {
          type: COLUMN,
          id: "column2",
          content: "column2",
          children: [
            {
              type: COMPONENT,
              id: "component3",
              content: "component3"
            },
            {
              type: COMPONENT,
              id: "component0",
              content: "component0"
            },
            {
              type: COMPONENT,
              id: "component2",
              content: "component2"
            }
          ]
        }
      ]
    }
  ],
  layoutCount: []
};

export default initialData;
