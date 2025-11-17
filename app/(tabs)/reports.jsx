import { useRouter } from "expo-router";
import { BarChart3, Calendar, ChevronLeft, ChevronRight, Download, Sparkles, TrendingDown, TrendingUp } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, RefreshControl, ScrollView, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import PieChart from '../../components/PieChart';
// Backend Report API integration
import {
    Button,
    Card,
    EmptyState,
    PageHeader,
    SectionTitle,
    StatCard
} from '../../components/ui';
import { exportReport, fetchMonthlyReport } from "../../store/slices/reportSlice";

const reports = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const { userData } = useSelector((state) => state.auth);
  const { currentFlat } = useSelector((state) => state.flat);
  // Backend report data
  const { monthlyReport, forecast, categorySpending, loading: reportLoading } = useSelector((state) => state.report);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [showForecast, setShowForecast] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = async () => {
    if (!currentFlat?._id) return;
    
    const month = selectedDate.getMonth() + 1;
    const year = selectedDate.getFullYear();
    const monthString = `${year}-${String(month).padStart(2, '0')}`;
    
    // Only fetch monthly report - forecast removed from reports screen
    await dispatch(fetchMonthlyReport({ flatId: currentFlat._id, params: { month: monthString } }));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handlePreviousMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    const today = new Date();
    if (selectedDate.getMonth() === today.getMonth() && selectedDate.getFullYear() === today.getFullYear()) {
      Alert.alert('Info', 'You cannot view future reports.');
      return;
    }
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));
  };

  const handleDownloadReport = async () => {
    if (!currentFlat?._id) {
      Alert.alert('Error', 'No flat selected');
      return;
    }
    
    if (!monthlyReport || !monthlyReport.summary || monthlyReport.summary.totalSpent === 0) {
      Alert.alert('Error', 'No data to export');
      return;
    }

    try {
      const month = selectedDate.getMonth() + 1;
      const year = selectedDate.getFullYear();
      const monthString = `${year}-${String(month).padStart(2, '0')}`;
      
      console.log('📄 Requesting PDF generation from backend...');
      await dispatch(exportReport({ 
        flatId: currentFlat._id, 
        params: { month: monthString, format: 'pdf' } 
      })).unwrap();
      
      Alert.alert('Success', 'Report exported as PDF!');
    } catch (error) {
      console.error('Report generation error:', error);
      Alert.alert('Error', error || 'Failed to generate report');
    }
  };

  const getCategoryColor = (index) => {
    const colors = ['#00C471', '#0057FF', '#F59E0B', '#8b5cf6', '#E63946', '#06b6d4', '#ec4899', '#84cc16'];
    return colors[index % colors.length];
  };

  const monthName = selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const isCurrentMonth = selectedDate.getMonth() === new Date().getMonth() && 
                         selectedDate.getFullYear() === new Date().getFullYear();

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <PageHeader
        title="Monthly Reports"
        subtitle="Track your spending patterns"
        rightAction={
          monthlyReport && monthlyReport.summary && monthlyReport.summary.totalSpent > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              onPress={handleDownloadReport}
              leftIcon={<Download size={20} color="#16a34a" />}
            />
          ) : null
        }
      />

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* ML Forecast Banner */}
        {forecast && (
          <Card
            variant="interactive"
            onPress={() => setShowForecast(!showForecast)}
            className="mx-4 mt-4 bg-gradient-to-r from-purple-100 to-pink-100 border-purple-200"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 bg-purple-200 rounded-full items-center justify-center">
                  <Sparkles size={20} color="#8b5cf6" />
                </View>
                <View className="flex-1 ml-3">
                  <Text className="text-purple-900 font-bold text-base">
                    AI Budget Forecast
                  </Text>
                  <Text className="text-purple-700 text-sm">
                    {showForecast ? 'Tap to hide' : 'Tap to view ML predictions'}
                  </Text>
                </View>
              </View>
              <Text className="text-2xl">{showForecast ? '▼' : '▶'}</Text>
            </View>
          </Card>
        )}

        {/* ML Forecast Details */}
        {showForecast && forecast && (
          <Card variant="elevated" className="mx-4 mt-3 bg-surface-0 border-purple-200">
            <SectionTitle title="🤖 Machine Learning Insights" variant="compact" className="mb-3" />
            
            {/* Next Month Forecast */}
            <View className="bg-purple-50 rounded-xl p-4 mb-3">
              <Text className="text-purple-900 font-semibold mb-1">
                Next Month Forecast
              </Text>
              <Text className="text-3xl font-bold text-purple-700">
                ₹{forecast.nextMonthPrediction?.predictedAmount?.toFixed(0) || '0'}
              </Text>
              <Text className="text-purple-600 text-sm mt-1">
                Based on {forecast._metadata?.monthsAnalyzed || 3} months of data
              </Text>
            </View>

            {/* Confidence Level */}
            {forecast.confidence && (
              <View className="mb-3">
                <View className="flex-row justify-between mb-1">
                  <Text className="text-text-primary text-sm">Confidence Level</Text>
                  <Text className="text-text-primary font-bold text-sm capitalize">
                    {forecast.confidence}
                  </Text>
                </View>
              </View>
            )}

            {/* Trend Analysis */}
            {forecast.trend && (
              <View className="flex-row items-center bg-blue-50 rounded-xl p-3">
                {forecast.trend === 'increasing' && <TrendingUp size={18} color="#ef4444" />}
                {forecast.trend === 'decreasing' && <TrendingDown size={18} color="#00C471" />}
                {forecast.trend === 'stable' && <BarChart3 size={18} color="#3b82f6" />}
                <Text className="text-text-primary text-sm ml-2 flex-1">
                  Spending trend: <Text className="font-bold capitalize">{forecast.trend}</Text>
                </Text>
              </View>
            )}

            {/* Recommendations */}
            {forecast.explanation && (
              <View className="mt-3 bg-amber-50 rounded-xl p-3">
                <Text className="text-amber-900 font-semibold text-sm mb-2">
                  💡 Insights
                </Text>
                <Text className="text-amber-800 text-sm">
                  {forecast.explanation}
                </Text>
              </View>
            )}
          </Card>
        )}

        {/* Month Selector */}
        <View className="mx-4 mt-4 mb-4">
          <Card className="bg-surface-0">
            <View className="flex-row items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onPress={handlePreviousMonth}
                leftIcon={<ChevronLeft size={24} color="#374151" />}
              />
              
              <View className="flex-1 items-center">
                <View className="flex-row items-center">
                  <Calendar size={18} color="#6b7280" />
                  <Text className="text-sm text-text-secondary ml-2">Report for</Text>
                </View>
                <Text className="text-xl font-bold text-text-primary mt-1">{monthName}</Text>
                {isCurrentMonth && (
                  <View className="bg-success-100 px-2 py-1 rounded-full mt-1">
                    <Text className="text-xs text-success-700 font-semibold">Current Month</Text>
                  </View>
                )}
              </View>
              
              <Button
                variant="ghost"
                size="sm"
                onPress={handleNextMonth}
                disabled={isCurrentMonth}
                leftIcon={<ChevronRight size={24} color={isCurrentMonth ? "#d1d5db" : "#374151"} />}
              />
            </View>
          </Card>
        </View>

        {/* Report Content */}
        {reportLoading && !refreshing ? (
          <Card className="mx-4 items-center py-8">
            <ActivityIndicator size="large" color="#00C471" />
            <Text className="mt-2 text-text-secondary">Loading report data...</Text>
          </Card>
        ) : !monthlyReport || !monthlyReport.summary || monthlyReport.summary.totalSpent === 0 ? (
          <View className="mx-4">
            <EmptyState
              icon={<BarChart3 size={48} color="#3b82f6" />}
              title="No Data Available"
              message={`No transactions found for ${monthName}`}
            />
          </View>
        ) : (
          <>
            {/* Summary Cards */}
            <View className="mx-4 mb-4">
              <View className="flex-row gap-3">
                <StatCard
                  label="Total Spent"
                  value={`₹${monthlyReport.summary?.totalSpent?.toFixed(0) || 0}`}
                  variant="default"
                  className="flex-1"
                  subtitle={
                    monthlyReport.summary?.percentChange !== undefined && monthlyReport.summary.percentChange !== 0 ? (
                      <View className="flex-row items-center mt-1">
                        {monthlyReport.summary.percentChange > 0 ? (
                          <TrendingUp size={12} color="#ef4444" />
                        ) : (
                          <TrendingDown size={12} color="#00C471" />
                        )}
                        <Text className={`text-xs ml-1 ${monthlyReport.summary.percentChange > 0 ? 'text-danger-600' : 'text-success-600'}`}>
                          {Math.abs(monthlyReport.summary.percentChange).toFixed(1)}%
                        </Text>
                      </View>
                    ) : null
                  }
                />

                <StatCard
                  label="Transactions"
                  value={monthlyReport.summary?.transactionCount || 0}
                  variant="default"
                  subtitle="This month"
                  className="flex-1"
                />
              </View>
            </View>

            {/* Category Breakdown */}
            {monthlyReport?.categoryBreakdown && monthlyReport.categoryBreakdown.length > 0 && (
              <View className="mx-4 mb-4">
                <Card variant="elevated" className="bg-surface-0">
                  <SectionTitle title="Spending by Category" variant="compact" className="mb-4" />
                  
                  {/* Pie Chart */}
                  <View className="items-center mb-6">
                    <PieChart
                      data={monthlyReport.categoryBreakdown.map((cat, idx) => ({
                        label: cat.category,
                        value: cat.totalAmount || 0,
                        color: getCategoryColor(idx),
                        percentage: cat.percentage || 0
                      }))}
                      size={220}
                    />
                  </View>

                  {/* Category List with Progress Bars */}
                  {monthlyReport.categoryBreakdown.map((category, index) => (
                    <View key={index} className="mb-4">
                      <View className="flex-row items-center justify-between mb-2">
                        <View className="flex-row items-center flex-1">
                          <View 
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: getCategoryColor(index) }}
                          />
                          <Text className="text-text-primary font-medium capitalize">{category.category}</Text>
                        </View>
                        <Text className="text-text-primary font-semibold">₹{category.totalAmount?.toFixed(0) || 0}</Text>
                      </View>
                      <View className="bg-surface-200 rounded-full h-3">
                        <View 
                          className="h-3 rounded-full"
                          style={{ 
                            width: `${category.percentage || 0}%`,
                            backgroundColor: getCategoryColor(index)
                          }}
                        />
                      </View>
                      <Text className="text-xs text-text-secondary mt-1">
                        {category.percentage?.toFixed(1) || 0}% • {category.count || 0} transactions
                      </Text>
                    </View>
                  ))}
                </Card>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default reports;
