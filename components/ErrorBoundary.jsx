import { AlertCircle, RefreshCw } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 * Provides graceful error handling with retry capability
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });

    // You can also log the error to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    // Call optional onReset callback
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleReset);
      }

      // Default fallback UI
      return (
        <View className="flex-1 items-center justify-center bg-gray-50 px-6">
          <View className="bg-white rounded-3xl p-8 shadow-lg items-center max-w-md">
            {/* Error icon */}
            <View className="bg-red-100 rounded-full p-4 mb-4">
              <AlertCircle size={48} color="#E63946" />
            </View>

            {/* Error title */}
            <Text className="text-xl font-bold text-gray-900 mb-2 text-center">
              Oops! Something went wrong
            </Text>

            {/* Error message */}
            <Text className="text-gray-600 text-center mb-6">
              {this.props.errorMessage || 
                'We encountered an unexpected error. Please try again.'}
            </Text>

            {/* Error details (development only) */}
            {__DEV__ && this.state.error && (
              <View className="bg-gray-100 rounded-lg p-4 mb-4 w-full">
                <Text className="text-xs font-mono text-gray-700">
                  {this.state.error.toString()}
                </Text>
              </View>
            )}

            {/* Retry button */}
            <TouchableOpacity
              onPress={this.handleReset}
              className="bg-blue-500 rounded-xl px-8 py-4 flex-row items-center"
              activeOpacity={0.8}
            >
              <RefreshCw size={20} color="white" />
              <Text className="text-white font-semibold ml-2 text-base">
                Try Again
              </Text>
            </TouchableOpacity>

            {/* Contact support (optional) */}
            {this.props.showContactSupport && (
              <TouchableOpacity
                onPress={this.props.onContactSupport}
                className="mt-4"
                activeOpacity={0.7}
              >
                <Text className="text-blue-500 font-medium">
                  Contact Support
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
