import { Star } from 'lucide-react';

export default function ReviewBadge({ rating, count }: { rating?: number | null; count?: number | null }) {
  const hasReviewStats = typeof rating === 'number' && rating > 0 && typeof count === 'number' && count > 0;

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-800 shadow-sm">
      <Star className="h-4 w-4 text-amber-500" fill="#f59e0b" />
      <span className="font-bold tabular-nums">{hasReviewStats ? rating.toFixed(1) : '...'}</span>
      <span className="text-[#1a1a3e]">/ 5</span>
      <span className="mx-1 text-[#5a5a82]">•</span>
      <span className="whitespace-nowrap font-semibold text-[#1a1a3e]">
        {hasReviewStats ? count.toLocaleString('th-TH') : '...'} รีวิว
      </span>
    </div>
  );
}
