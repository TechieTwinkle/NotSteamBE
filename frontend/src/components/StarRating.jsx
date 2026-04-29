import { Star } from "lucide-react";

const StarRating = ({ value, onRate }) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button" onClick={() => onRate?.(star)}>
          <Star
            className={`h-5 w-5 transition ${star <= value ? "fill-orange-400 text-orange-400" : "text-zinc-600 hover:text-orange-300"}`}
          />
        </button>
      ))}
    </div>
  );
};

export default StarRating;

