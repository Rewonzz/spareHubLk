import React from 'react';
import { Star } from 'lucide-react';

export default function StarRating({ rating = 0, max = 5, size = 16, interactive = false, onRate }) {
  const stars = [];
  for (let i = 1; i <= max; i++) {
    const filled = i <= Math.round(rating);
    stars.push(
      <button
        key={i}
        type="button"
        onClick={() => interactive && onRate?.(i)}
        disabled={!interactive}
        className={`transition-colors ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
      >
        <Star
          size={size}
          className={filled ? 'text-yellow-500 fill-yellow-500' : 'text-zinc-700'}
        />
      </button>
    );
  }
  return <div className="flex items-center gap-0.5">{stars}</div>;
}
