import React, { useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";

// Initial board data
const initialData = {
  boardName: "StreamHub Development",
  lists: [
    {
      id: "l1",
      title: "Backlog",
      cards: [
        { id: "c1", title: "Kafka Integration", labels: ["backend"] },
        { id: "c2", title: "Rate Limiting", labels: ["security"] },
        { id: "c3", title: "Notification System", labels: ["feature"] },
      ],
    },
    {
      id: "l2",
      title: "In Progress",
      cards: [
        { id: "c10", title: "User Management", labels: ["backend"] },
        { id: "c11", title: "Redis Caching", labels: ["performance"] },
      ],
    },
    {
      id: "l3",
      title: "Done",
      cards: [
        { id: "c15", title: "Authentication System", labels: ["auth"] },
        { id: "c16", title: "Magic Link & OAuth", labels: ["auth"] },
      ],
    },
  ],
};

// Reorder cards within same list
const reorder = (list, startIndex, endIndex) => {
  const newList = [...list];
  const [removed] = newList.splice(startIndex, 1);
  newList.splice(endIndex, 0, removed);
  return newList;
};

// Move cards across lists
const move = (source, destination, droppableSource, droppableDestination) => {
  const sourceClone = [...source];
  const destClone = [...destination];

  const [movedItem] = sourceClone.splice(droppableSource.index, 1);
  destClone.splice(droppableDestination.index, 0, movedItem);

  return {
    sourceList: sourceClone,
    destList: destClone,
  };
};

export default function ProjectBoard() {
  const [data, setData] = useState(initialData);

  const onDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) return;

    const sInd = parseInt(source.droppableId, 10);
    const dInd = parseInt(destination.droppableId, 10);

    const newLists = [...data.lists];

    // Same list ➜ reorder
    if (sInd === dInd) {
      const items = reorder(
        newLists[sInd].cards,
        source.index,
        destination.index
      );
      newLists[sInd].cards = items;
    } else {
      // Move to another list
      const moved = move(
        newLists[sInd].cards,
        newLists[dInd].cards,
        source,
        destination
      );
      newLists[sInd].cards = moved.sourceList;
      newLists[dInd].cards = moved.destList;
    }

    setData({ ...data, lists: newLists });
  };

  return (
    <div className="h-screen flex flex-col bg-[#0f1217] font-sans text-gray-200">
   

      {/* Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="board" direction="horizontal" type="LIST">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex-1 overflow-x-auto pt-6 px-4"
            >
              <div className="flex items-start space-x-4 min-w-max">
                {data.lists.map((list, listIndex) => (
                  <Draggable
                    draggableId={list.id}
                    index={listIndex}
                    key={list.id}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="bg-[#1b1e23] rounded-xl w-72 flex flex-col"
                      >
                        {/* List header */}
                        <div
                          {...provided.dragHandleProps}
                          className="p-3 border-b border-white/10 cursor-grab"
                        >
                          <h3 className="font-bold">{list.title}</h3>
                          <span className="text-xs opacity-60">
                            {list.cards.length} cards
                          </span>
                        </div>

                        {/* Cards */}
                        <Droppable droppableId={String(listIndex)}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className={`flex-1 p-3 space-y-2 transition-colors ${
                                snapshot.isDraggingOver
                                  ? "bg-[#252a31]"
                                  : "bg-transparent"
                              }`}
                            >
                              {list.cards.map((card, cardIndex) => (
                                <Draggable
                                  key={card.id}
                                  draggableId={card.id}
                                  index={cardIndex}
                                >
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={`p-3 rounded-lg border border-gray-700 bg-[#22272b] text-sm shadow 
                                        ${
                                          snapshot.isDragging
                                            ? "rotate-2 shadow-xl"
                                            : ""
                                        }`}
                                    >
                                      {/* Labels */}
                                      {card.labels.length > 0 && (
                                        <div className="flex gap-1 mb-2">
                                          {card.labels.map((label, idx) => (
                                            <span
                                              key={idx}
                                              className="px-2 py-1 text-xs rounded bg-blue-500/20 text-blue-300"
                                            >
                                              {label}
                                            </span>
                                          ))}
                                        </div>
                                      )}

                                      {card.title}
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </div>
                    )}
                  </Draggable>
                ))}

                {/* Add new list button */}
                <button className="w-72 bg-white/10 hover:bg-white/20 text-white p-4 rounded-xl">
                  + Add List
                </button>

                {provided.placeholder}
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
