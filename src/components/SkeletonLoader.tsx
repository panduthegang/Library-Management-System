import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export const BookCardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      <div className="flex flex-col md:flex-row">
        <div className="relative w-full md:w-1/3">
          <div className="aspect-[3/4]">
            <Skeleton height="100%" />
          </div>
        </div>
        <div className="flex-1 p-6">
          <div className="mb-4">
            <Skeleton width="70%" height={24} className="mb-2" />
            <Skeleton width="50%" height={20} className="mb-2" />
            <Skeleton width="30%" height={16} className="mb-4" />
            <Skeleton count={3} className="mb-4" />
          </div>
          <div className="flex justify-between items-center">
            <Skeleton width={100} height={30} />
            <Skeleton width={120} height={40} />
          </div>
        </div>
      </div>
    </div>
  );
};

export const StatsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-xl p-6 shadow-lg">
          <Skeleton height={24} width="60%" className="mb-2" />
          <Skeleton height={36} width="40%" />
        </div>
      ))}
    </div>
  );
};