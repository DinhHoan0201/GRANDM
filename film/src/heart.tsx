import React from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";

interface HeartProps {
  isFavorite: boolean;
  onClick: () => void;
}

const Heart: React.FC<HeartProps> = ({ isFavorite, onClick }) => {
  return (
    <div onClick={onClick}>
      {isFavorite ? <FaHeart color="red" /> : <FaRegHeart />}
    </div>
  );
};

export default Heart;
