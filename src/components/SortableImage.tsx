import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { X, GripVertical } from "lucide-react";

interface SortableImageProps {
  id: string;
  image: string;
  index: number;
  onRemove: (index: number) => void;
}

export const SortableImage: React.FC<SortableImageProps> = ({
  id,
  image,
  index,
  onRemove,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      {/* Drag handle - làm to hơn để dễ drag */}
      <div
        {...listeners}
        {...attributes}
        className="absolute top-1 left-1 p-2 bg-white rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-10"
      >
        <GripVertical size={16} className="text-gray-600" />
      </div>
      <img
        src={image}
        alt={`Image ${index + 1}`}
        className="w-full h-24 object-cover rounded-lg border border-gray-200 select-none"
        draggable={false}
      />
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <X size={14} />
      </button>
      <div className="absolute bottom-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
        {index + 1}
      </div>
    </div>
  );
};
