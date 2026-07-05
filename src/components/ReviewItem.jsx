import React from 'react';
import { AiFillStar } from 'react-icons/ai';

const ReviewItem = ({ review }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border">
      <div className="flex items-center justify-between mb-1">
        <h4 className="font-semibold">{review.studentName}</h4>
        <div className="flex items-center gap-1 text-yellow-500">
          {Array.from({ length: review.rating }).map((_, idx) => (
            <AiFillStar key={idx} />
          ))}
        </div>
      </div>
      <p className="text-gray-600 text-sm">{review.comment}</p>
    </div>
  );
};

export default ReviewItem;
