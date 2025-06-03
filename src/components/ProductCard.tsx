import React from "react";
import { useNavigate } from "react-router-dom";

export interface ProductCardProps {
  id: number; // Add this line
  image: string;
  category: string;
  name: string;
  description: string;
  price: number;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  image,
  category,
  name,
  description,
  price,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/san-pham/${id}`); // Đúng với route trong App.tsx
  };

  return (
    <div
      className=" shadow p-4 cursor-pointer hover:shadow-lg transition"
      onClick={handleClick}
    >
      <img
        src={image}
        alt={name}
        className="w-full h-48 object-cover rounded-lg mb-4"
      />
      <p className="text-sm text-gray-500">{category}</p>
      <h3 className="text-lg font-semibold">{name}</h3>
      <p className="text-gray-600">{description}</p>
      <p className="text-xl font-bold mt-2">${price}</p>
    </div>
  );
};

export default ProductCard;
