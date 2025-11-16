import { View } from 'react-native';

/**
 * Loading Skeleton Component
 * Provides smooth, animated loading placeholders instead of spinners
 * Improves perceived performance and UX
 */
const LoadingSkeleton = ({ type = 'bill', count = 3 }) => {
  const skeletons = Array.from({ length: count }, (_, i) => i);

  if (type === 'bill') {
    return (
      <View className="px-5 space-y-3">
        {skeletons.map((index) => (
          <View
            key={index}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
          >
            {/* Header skeleton */}
            <View className="flex-row justify-between items-start mb-3">
              <View className="flex-1">
                {/* Title skeleton */}
                <View className="h-5 bg-gray-200 rounded-lg mb-2 w-3/4 animate-pulse" />
                {/* Category skeleton */}
                <View className="h-4 bg-gray-200 rounded-lg w-1/3 animate-pulse" />
              </View>
              {/* Badge skeleton */}
              <View className="h-6 w-16 bg-gray-200 rounded-full animate-pulse" />
            </View>

            {/* Amount skeleton */}
            <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-gray-100">
              <View className="h-4 bg-gray-200 rounded-lg w-1/4 animate-pulse" />
              <View className="h-6 bg-gray-200 rounded-lg w-1/5 animate-pulse" />
            </View>
          </View>
        ))}
      </View>
    );
  }

  if (type === 'summary') {
    return (
      <View className="px-5 mb-4">
        <View className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-6 shadow-lg">
          {/* Header skeleton */}
          <View className="h-4 bg-white/30 rounded-lg w-1/3 mb-4 animate-pulse" />
          
          {/* Amount skeleton */}
          <View className="h-8 bg-white/40 rounded-lg w-2/3 mb-6 animate-pulse" />
          
          {/* Stats row skeleton */}
          <View className="flex-row justify-between">
            <View className="flex-1 mr-2">
              <View className="h-3 bg-white/30 rounded-lg mb-2 animate-pulse" />
              <View className="h-5 bg-white/40 rounded-lg animate-pulse" />
            </View>
            <View className="flex-1 ml-2">
              <View className="h-3 bg-white/30 rounded-lg mb-2 animate-pulse" />
              <View className="h-5 bg-white/40 rounded-lg animate-pulse" />
            </View>
          </View>
        </View>
      </View>
    );
  }

  if (type === 'history') {
    return (
      <View className="px-5 space-y-2">
        {skeletons.map((index) => (
          <View
            key={index}
            className="bg-white rounded-xl p-3 flex-row items-center shadow-sm border border-gray-100"
          >
            {/* Icon skeleton */}
            <View className="w-10 h-10 rounded-full bg-gray-200 mr-3 animate-pulse" />
            
            {/* Content skeleton */}
            <View className="flex-1">
              <View className="h-4 bg-gray-200 rounded-lg mb-2 w-3/4 animate-pulse" />
              <View className="h-3 bg-gray-200 rounded-lg w-1/2 animate-pulse" />
            </View>
            
            {/* Amount skeleton */}
            <View className="h-5 bg-gray-200 rounded-lg w-16 animate-pulse" />
          </View>
        ))}
      </View>
    );
  }

  // Default skeleton
  return (
    <View className="px-5 space-y-3">
      {skeletons.map((index) => (
        <View
          key={index}
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
        >
          <View className="h-4 bg-gray-200 rounded-lg mb-2 animate-pulse" />
          <View className="h-3 bg-gray-200 rounded-lg w-2/3 animate-pulse" />
        </View>
      ))}
    </View>
  );
};

export default LoadingSkeleton;
