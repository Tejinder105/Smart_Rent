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
import { exportReport, fetchBudgetForecast, fetchCategorySpending, fetchMonthlyReport } from "../../store/slices/reportSlice";

const reports = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const { userData } = useSelector((state) => state.auth);
  const { currentFlat } = useSelector((state) => state.flat);
  // Backend report data
  const { monthlyReport, budgetForecast, categorySpending, loading: reportLoading } = useSelector((state) => state.report);

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
    
    await Promise.all([
      dispatch(fetchMonthlyReport({ flatId: currentFlat._id, params: { month: monthString } })),
      dispatch(fetchBudgetForecast({ flatId: currentFlat._id, params: { months: 3 } })),
      dispatch(fetchCategorySpending({ flatId: currentFlat._id, params: {} }))
    ]);
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
    
    if (!monthlyReport || monthlyReport.totalSpent === 0) {
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
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      <PageHeader
        title="Monthly Reports"
        subtitle="Track your spending patterns"
        rightAction={
          monthlyReport && monthlyReport.totalSpent > 0 ? (
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
        {budgetForecast && (
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
        {showForecast && budgetForecast && (
          <Card variant="elevated" className="mx-4 mt-3 bg-white border-purple-200">
            <SectionTitle title="🤖 Machine Learning Insights" variant="compact" className="mb-3" />
            
            {/* Next Month Forecast */}
            <View className="bg-purple-50 rounded-xl p-4 mb-3">
              <Text className="text-purple-900 font-semibold mb-1">
                Next Month Forecast
              </Text>
              <Text className="text-3xl font-bold text-purple-700">
                ₹{budgetForecast.forecast?.toFixed(0) || '0'}
              </Text>
              <Text className="text-purple-600 text-sm mt-1">
                Based on {budgetForecast.monthsAnalyzed || 3} months of data
              </Text>
            </View>

            {/* Confidence Level */}
            {budgetForecast.confidence && (
              <View className="mb-3">
                <View className="flex-row justify-between mb-1">
                  <Text className="text-gray-700 text-sm">Confidence Level</Text>
                  <Text className="text-gray-900 font-bold text-sm">
                    {budgetForecast.confidence}%
                  </Text>
                </View>
                <View className="bg-gray-200 rounded-full h-2">
                  <View 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                    style={{ width: `${budgetForecast.confidence}%` }}
                  />
                </View>
              </View>
            )}

            {/* Trend Analysis */}
            {budgetForecast.trend && (
              <View className="flex-row items-center bg-blue-50 rounded-xl p-3">
                {budgetForecast.trend === 'increasing' && <TrendingUp size={18} color="#ef4444" />}
                {budgetForecast.trend === 'decreasing' && <TrendingDown size={18} color="#00C471" />}
                {budgetForecast.trend === 'stable' && <BarChart3 size={18} color="#3b82f6" />}
                <Text className="text-gray-700 text-sm ml-2 flex-1">
                  Spending trend: <Text className="font-bold">{budgetForecast.trend}</Text>
                </Text>
              </View>
            )}

            {/* Recommendations */}
            {budgetForecast.recommendations && budgetForecast.recommendations.length > 0 && (
              <View className="mt-3 bg-amber-50 rounded-xl p-3">
                <Text className="text-amber-900 font-semibold text-sm mb-2">
                  💡 Recommendations
                </Text>
                {budgetForecast.recommendations.map((rec, idx) => (
                  <Text key={idx} className="text-amber-800 text-sm mb-1">
                    • {rec}
                  </Text>
                ))}
              </View>
            )}
          </Card>
        )}

        {/* Month Selector */}
        <View className="mx-4 mt-4 mb-4">
          <Card className="bg-white">
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
                  <Text className="text-sm text-gray-500 ml-2">Report for</Text>
                </View>
                <Text className="text-xl font-bold text-gray-900 mt-1">{monthName}</Text>
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
            <Text className="mt-2 text-gray-600">Loading report data...</Text>
          </Card>
        ) : !monthlyReport || monthlyReport.totalSpent === 0 ? (
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
                  value={`₹${monthlyReport.totalSpent?.toFixed(0) || 0}`}
                  variant="default"
                  className="flex-1"
                  subtitle={
                    monthlyReport.percentChange !== undefined && monthlyReport.percentChange !== 0 ? (
                      <View className="flex-row items-center mt-1">
                        {monthlyReport.percentChange > 0 ? (
                          <TrendingUp size={12} color="#ef4444" />
                        ) : (
                          <TrendingDown size={12} color="#00C471" />
                        )}
                        <Text className={`text-xs ml-1 ${monthlyReport.percentChange > 0 ? 'text-danger-600' : 'text-success-600'}`}>
                          {Math.abs(monthlyReport.percentChange).toFixed(1)}%
                        </Text>
                      </View>
                    ) : null
                  }
                />

                <StatCard
                  label="Transactions"
                  value={monthlyReport.transactionCount || 0}
                  variant="default"
                  subtitle="This month"
                  className="flex-1"
                />
              </View>
            </View>

            {/* Category Breakdown */}
            {categorySpending && categorySpending.length > 0 && (
              <View className="mx-4 mb-4">
                <Card variant="elevated" className="bg-white">
                  <SectionTitle title="Spending by Category" variant="compact" className="mb-4" />
                  
                  {/* Pie Chart */}
                  <View className="items-center mb-6">
                    <PieChart
                      data={categorySpending.map((cat, idx) => ({
                        label: cat.category,
                        value: cat.totalAmount || 0,
                        color: getCategoryColor(idx),
                        percentage: cat.percentage || 0
                      }))}
                      size={220}
                    />
                  </View>

                  {/* Category List with Progress Bars */}
                  {categorySpending.map((category, index) => (
                    <View key={index} className="mb-4">
                      <View className="flex-row items-center justify-between mb-2">
                        <View className="flex-row items-center flex-1">
                          <View 
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: getCategoryColor(index) }}
                          />
                          <Text className="text-gray-700 font-medium capitalize">{category.category}</Text>
                        </View>
                        <Text className="text-gray-900 font-semibold">₹{category.totalAmount?.toFixed(0) || 0}</Text>
                      </View>
                      <View className="bg-gray-200 rounded-full h-3">
                        <View 
                          className="h-3 rounded-full"
                          style={{ 
                            width: `${category.percentage || 0}%`,
                            backgroundColor: getCategoryColor(index)
                          }}
                        />
                      </View>
                      <Text className="text-xs text-gray-500 mt-1">
                        {category.percentage?.toFixed(1) || 0}% • {category.count || 0} transactions
                      </Text>
                    </View>
                  ))}
                </Card>
              </View>
            )}

            {/* Transaction List */}
            {monthlyReport.transactions && monthlyReport.transactions.length > 0 && (
              <View className="mx-4 mb-6">
                <Card variant="elevated" className="bg-white">
                  <SectionTitle title="Recent Transactions" variant="compact" className="mb-4" />
                  {monthlyReport.transactions.slice(0, 10).map((txn, idx) => (
                    <View key={idx} className="flex-row items-center justify-between py-3 border-b border-gray-100">
                      <View className="flex-1">
                        <Text className="text-gray-900 font-medium">{txn.description || 'Transaction'}</Text>
                        <Text className="text-gray-500 text-xs mt-1">
                          {new Date(txn.date).toLocaleDateString('en-IN')} • {txn.type}
                        </Text>
                      </View>
                      <Text className="text-gray-900 font-bold">₹{txn.amount?.toFixed(0) || 0}</Text>
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
