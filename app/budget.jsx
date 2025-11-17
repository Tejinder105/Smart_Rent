import { useRouter } from 'expo-router';
import {
    AlertCircle, Calendar, ChevronLeft, DollarSign,
    Save, TrendingDown, TrendingUp
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    Text,
    View
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { Button, Card, Input, PageHeader } from '../components/ui';
import { getColors } from '../constants/colors';
import { fetchBudgetHistory, fetchCurrentBudget } from '../store/slices/expenseUnifiedSlice';
import { fetchUserFlat, updateFlat } from '../store/slices/flatSlice';
import { fetchBudgetForecast } from '../store/slices/reportSlice';

const Budget = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const { currentFlat, loading } = useSelector((state) => state.flat);
  const { userData } = useSelector((state) => state.auth);
  const { currentBudget, budgetHistory } = useSelector((state) => state.expenseUnified);
  const { forecast, forecastLoading } = useSelector((state) => state.report);
  const { isDark } = useSelector((state) => state.theme);

  const colors = getColors(isDark);

  const [monthlyBudget, setMonthlyBudget] = useState('');
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showForecast, setShowForecast] = useState(false);

  useEffect(() => {
    if (currentFlat?.monthlyBudget) {
      setMonthlyBudget(String(currentFlat.monthlyBudget));
    }
  }, [currentFlat]);

  useEffect(() => {
    if (currentFlat?._id) {
      dispatch(fetchCurrentBudget({ flatId: currentFlat._id }));
      dispatch(fetchBudgetHistory({ flatId: currentFlat._id, limit: 3 }));
      // Fetch ML forecast for next month only
      dispatch(fetchBudgetForecast({ 
        flatId: currentFlat._id
      })).catch(err => {
        console.log('⚠️ Forecast not available:', err);
      });
    }
  }, [currentFlat?._id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      dispatch(fetchUserFlat()),
      currentFlat?._id && dispatch(fetchCurrentBudget({ flatId: currentFlat._id })),
      currentFlat?._id && dispatch(fetchBudgetHistory({ flatId: currentFlat._id, limit: 3 })),
      currentFlat?._id && dispatch(fetchBudgetForecast({ 
        flatId: currentFlat._id
      })).catch(() => {})
    ]);
    setRefreshing(false);
  };

  const handleSaveBudget = () => {
    const amount = Number(monthlyBudget);

    if (isNaN(amount) || amount <= 0) {
      return Alert.alert("Invalid amount", "Please enter a valid number");
    }

    Alert.alert(
      "Update Budget",
      `Set monthly budget to ₹${amount}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            setSaving(true);
            try {
              await dispatch(
                updateFlat({
                  flatId: currentFlat._id,
                  updateData: { monthlyBudget: amount }
                })
              ).unwrap();

              Alert.alert("Success", "Monthly budget updated!");
              dispatch(fetchUserFlat());
            } catch (e) {
              Alert.alert("Error", e?.message || "Failed to update budget");
            } finally {
              setSaving(false);
            }
          }
        }
      ]
    );
  };

  const isAdmin =
    currentFlat?.admin?._id === userData?._id ||
    currentFlat?.admin === userData?._id;

  const budgetAmount = currentBudget?.budgetAmount || currentFlat?.monthlyBudget || 0;
  const currentMonthSpending = currentBudget?.actualSpent || 0;

  const spentPercentage =
    budgetAmount > 0 ? (currentMonthSpending / budgetAmount) * 100 : 0;

  const remaining = budgetAmount - currentMonthSpending;

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <PageHeader
        title="Budget Management"
        leftAction={
          <Button
            variant="ghost"
            size="sm"
            onPress={() => router.back()}
          >
            <ChevronLeft size={22} color={colors.text} />
          </Button>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ padding: 16, gap: 16 }}
      >

        {/* Monthly Budget Overview */}
        <Card className="rounded-2xl" style={{ backgroundColor: colors.primary }}>
          <View className="flex-row items-center mb-4">
            <DollarSign size={22} color={colors.textInverse} />
            <Text className="text-white font-semibold text-lg ml-2">
              Monthly Budget
            </Text>
          </View>

          <Text className="text-white text-4xl font-bold mb-1">
            ₹{budgetAmount.toFixed(0)}
          </Text>

          <Text className="text-white/80 text-sm">
            Per person: ₹{(budgetAmount / (currentFlat?.stats?.totalMembers || 1)).toFixed(0)}
          </Text>
        </Card>

        {/* Budget Progress */}
        {budgetAmount > 0 && (
          <Card variant="elevated" className="rounded-2xl">
            <View className="flex-row justify-between mb-3">
              <Text style={{ color: colors.text, fontWeight: "700", fontSize: 18 }}>
                This Month's Progress
              </Text>

              <View
                style={{
                  backgroundColor: colors.primaryLight,
                  paddingVertical: 4,
                  paddingHorizontal: 12,
                  borderRadius: 20,
                }}
              >
                <Text style={{ color: colors.primaryDark, fontSize: 12 }}>
                  {new Date().toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                </Text>
              </View>
            </View>

            <Text style={{ color: colors.textSecondary, marginBottom: 8 }}>
              Spent: ₹{currentMonthSpending.toFixed(0)} / ₹{budgetAmount.toFixed(0)}
            </Text>

            {/* Progress Bar */}
            <View
              style={{
                height: 12,
                backgroundColor: colors.backgroundTertiary,
                borderRadius: 999,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  width: `${Math.min(spentPercentage, 100)}%`,
                  height: "100%",
                  backgroundColor:
                    spentPercentage > 100
                      ? colors.error
                      : spentPercentage > 80
                      ? colors.warning
                      : colors.success,
                }}
              />
            </View>

            <Text style={{ marginTop: 6, color: colors.textSecondary, fontSize: 12 }}>
              {spentPercentage.toFixed(1)}% used
            </Text>

            {/* Remaining / Over */}
            <View className="flex-row justify-between items-center mt-4 border-t pt-4"
              style={{ borderColor: colors.border }}
            >
              <View className="flex-row items-center">
                {remaining >= 0 ? (
                  <TrendingDown size={20} color={colors.success} />
                ) : (
                  <TrendingUp size={20} color={colors.error} />
                )}

                <Text style={{ marginLeft: 6, color: colors.textSecondary }}>
                  {remaining >= 0 ? "Remaining" : "Over Budget"}
                </Text>
              </View>

              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "700",
                  color: remaining >= 0 ? colors.success : colors.error,
                }}
              >
                ₹{Math.abs(remaining).toFixed(0)}
              </Text>
            </View>
          </Card>
        )}



        {/* AI Budget Forecast */}
        {forecast && (
          <Card style={{ backgroundColor: colors.primaryDark }} className="rounded-2xl">
            <Button
              variant="ghost"
              className="flex-row justify-between"
              onPress={() => setShowForecast(!showForecast)}
            >
              <View className="flex-row items-center">
                <View
                  style={{
                    backgroundColor: "rgba(255,255,255,0.2)",
                    width: 40,
                    height: 40,
                    borderRadius: 999,
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 12,
                  }}
                >
                  <TrendingUp size={20} color={colors.textInverse} />
                </View>

                <View>
                  <Text style={{ color: colors.textInverse, fontSize: 16, fontWeight: "600" }}>
                    Budget Forecast
                  </Text>
                  <Text style={{ color: "white", opacity: 0.8, fontSize: 12 }}>
                    AI Prediction
                  </Text>
                </View>
              </View>

              <Text style={{ color: colors.textInverse, fontSize: 18 }}>
                {showForecast ? "▼" : "▶"}
              </Text>
            </Button>

            {showForecast && (
              <View style={{ marginTop: 16 }}>
                {forecastLoading ? (
                  <View className="items-center py-4">
                    <ActivityIndicator color="white" />
                    <Text style={{ color: "white", marginTop: 8, opacity: 0.8 }}>
                      Analyzing patterns with ML...
                    </Text>
                  </View>
                ) : (
                  <>
                    {/* ML Model Info */}
                    <View
                      style={{
                        backgroundColor: "rgba(255,255,255,0.15)",
                        padding: 14,
                        borderRadius: 12,
                        marginBottom: 12,
                      }}
                    >
                      <View className="flex-row items-center mb-2">
                        <Text style={{ color: "white", fontWeight: "700", fontSize: 16 }}>
                          {forecast.modelInfo?.algorithm || 'ML Model'}
                        </Text>
                        {forecast.usedFallback && (
                          <View style={{ backgroundColor: 'rgba(255,165,0,0.3)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginLeft: 8 }}>
                            <Text style={{ color: 'white', fontSize: 10 }}>Fallback</Text>
                          </View>
                        )}
                      </View>
                      <Text style={{ color: "white", opacity: 0.8, fontSize: 13 }}>
                        {forecast.explanation || 'ML-based prediction'}
                      </Text>
                      <View className="flex-row justify-between mt-3">
                        <View>
                          <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>Avg Spending</Text>
                          <Text style={{ color: "white", fontWeight: "600", fontSize: 15 }}>
                            ₹{forecast.averageSpending?.toFixed(0) || 0}
                          </Text>
                        </View>
                        <View>
                          <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>Trend</Text>
                          <Text style={{ color: "white", fontWeight: "600", fontSize: 15, textTransform: 'capitalize' }}>
                            {forecast.trend || 'stable'}
                          </Text>
                        </View>
                        <View>
                          <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>Confidence</Text>
                          <Text style={{ color: "white", fontWeight: "600", fontSize: 15, textTransform: 'capitalize' }}>
                            {forecast.confidence || 'medium'}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Current Month Projection */}
                    {forecast.currentMonthProjection && (
                      <View
                        style={{
                          backgroundColor: forecast.isLikelyOverBudget ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.2)",
                          padding: 14,
                          borderRadius: 12,
                          marginBottom: 12,
                          borderWidth: 1,
                          borderColor: forecast.isLikelyOverBudget ? "rgba(239,68,68,0.5)" : "rgba(34,197,94,0.5)"
                        }}
                      >
                        <View className="flex-row items-center mb-2">
                          {forecast.isLikelyOverBudget ? (
                            <AlertCircle size={18} color="#fca5a5" />
                          ) : (
                            <TrendingDown size={18} color="#86efac" />
                          )}
                          <Text style={{ color: "white", marginLeft: 8, fontWeight: "700", fontSize: 15 }}>
                            {forecast.isLikelyOverBudget ? 'Over-Budget Warning' : 'On Track'}
                          </Text>
                        </View>
                        <Text style={{ color: "white", fontSize: 13, opacity: 0.9 }}>
                          Projected month-end: <Text style={{ fontWeight: '700' }}>₹{forecast.currentMonthProjection.projectedTotal?.toFixed(0)}</Text>
                        </Text>
                        {forecast.isLikelyOverBudget && (
                          <Text style={{ color: "#fca5a5", fontSize: 12, marginTop: 4 }}>
                            May exceed budget by ₹{Math.abs(forecast.budgetDifference || 0).toFixed(0)}
                          </Text>
                        )}
                        <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, marginTop: 6 }}>
                          {forecast.currentMonthProjection.daysRemaining} days remaining • 
                          Daily budget: ₹{forecast.currentMonthProjection.dailyBudgetRemaining?.toFixed(0)}
                        </Text>
                      </View>
                    )}

                    {/* Future Predictions */}
                    {forecast.predictions?.length > 0 && (
                      <View>
                        <Text style={{ color: 'white', fontWeight: '600', marginBottom: 10, fontSize: 14 }}>
                          📊 Next Month Forecast
                        </Text>
                        {forecast.predictions.map((pred, idx) => {
                          const date = new Date(pred.month + '-01');
                          const label = date.toLocaleDateString("en-US", {
                            month: "short",
                            year: "numeric",
                          });

                          const predictedAmount = pred.predictedAmount || 0;
                          const isOverBudget = predictedAmount > budgetAmount;
                          const confidenceColor = pred.confidence === 'high' ? '#86efac' : pred.confidence === 'medium' ? '#fde047' : '#fca5a5';

                          return (
                            <View
                              key={idx}
                              style={{
                                backgroundColor: "rgba(255,255,255,0.15)",
                                padding: 14,
                                borderRadius: 12,
                                marginBottom: 10,
                              }}
                            >
                              <View className="flex-row justify-between items-center mb-3">
                                <View className="flex-row items-center">
                                  <Calendar size={16} color="white" />
                                  <Text style={{ color: "white", marginLeft: 6, fontWeight: '600' }}>
                                    {label}
                                  </Text>
                                </View>
                                <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
                                  <Text style={{ color: confidenceColor, fontSize: 10, fontWeight: '600', textTransform: 'uppercase' }}>
                                    {pred.confidence}
                                  </Text>
                                </View>
                              </View>

                              <View className="flex-row justify-between items-center mb-2">
                                <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}>
                                  Predicted Spending
                                </Text>
                                <Text
                                  style={{
                                    color: isOverBudget ? "#fca5a5" : "white",
                                    fontWeight: "700",
                                    fontSize: 18,
                                  }}
                                >
                                  ₹{predictedAmount.toFixed(0)}
                                </Text>
                              </View>

                              <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: 8, borderRadius: 8 }}>
                                <View className="flex-row justify-between">
                                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>Range:</Text>
                                  <Text style={{ color: 'white', fontSize: 11 }}>
                                    ₹{pred.lowerBound?.toFixed(0)} - ₹{pred.upperBound?.toFixed(0)}
                                  </Text>
                                </View>
                                {isOverBudget && (
                                  <View className="flex-row items-center mt-2">
                                    <AlertCircle size={12} color="#fca5a5" />
                                    <Text style={{ color: "#fca5a5", marginLeft: 4, fontSize: 11 }}>
                                      May exceed budget by ₹{(predictedAmount - budgetAmount).toFixed(0)}
                                    </Text>
                                  </View>
                                )}
                              </View>
                            </View>
                          );
                        })}
                      </View>
                    )}
                  </>
                )}
              </View>
            )}
          </Card>
        )}

        {/* Admin Budget Setter */}
        {isAdmin && (
          <Card variant="elevated" className="rounded-2xl">
            <View className="flex-row items-center mb-4">
              <Calendar size={20} color={colors.text} />
              <Text style={{ marginLeft: 8, color: colors.text, fontWeight: "700", fontSize: 18 }}>
                {budgetAmount > 0 ? "Update" : "Set"} Budget
              </Text>
            </View>

            <Input
              label="Budget Amount (₹)"
              keyboardType="numeric"
              value={monthlyBudget}
              onChangeText={setMonthlyBudget}
              required
            />

            <Button
              variant="primary"
              size="lg"
              onPress={handleSaveBudget}
              loading={saving}
              disabled={!monthlyBudget}
            >
              <Save size={20} color={colors.textInverse} />
              Save Budget
            </Button>
          </Card>
        )}

        {!isAdmin && (
          <Card variant="flat" className="rounded-2xl">
            <View className="flex-row items-center">
              <AlertCircle size={18} color={colors.primary} />
              <Text style={{ color: colors.textSecondary, marginLeft: 8 }}>
                Only the admin can update the budget
              </Text>
            </View>
          </Card>
        )}
      </ScrollView>
    </View>
  );
};

export default Budget;
