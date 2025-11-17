import { useFocusEffect, useRouter } from "expo-router";
import { Bell, ChevronRight, DollarSign, PlusCircleIcon, Receipt, TrendingDown, TrendingUp, Wallet } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
    Button,
    Card,
    EmptyState,
    PageHeader,
    SectionTitle,
    StatCard
} from "../../components/ui";
import { useTheme } from "../../store/hooks/useTheme";
import { getIconColor } from "../../utils/themeUtils";
// V2 Unified API - Single call for all dashboard data ⭐
import {
    fetchCurrentBudget,
    fetchUserDues,
    invalidateCache,
    selectCurrentBudget,
    selectFinancials,
    selectIsCacheValid,
    selectLoading as selectUnifiedLoading
} from "../../store/slices/expenseUnifiedSlice";
import { fetchUserFlat } from "../../store/slices/flatSlice";

export default function Index() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { theme } = useTheme();

  const { currentFlat, loading: flatLoading } = useSelector((state) => state.flat);
  const { userData } = useSelector((state) => state.auth);
  const user = userData;

  // Memoized styles and colors
  const styles = useMemo(() => createStyles(theme), [theme]);
  const iconColor = useMemo(() => getIconColor(theme, 'secondary'), [theme]);
  const accentIconColor = useMemo(() => getIconColor(theme, 'accent'), [theme]);

  // V2 Unified API - Get all financial data from single source ⭐
  const financials = useSelector(selectFinancials);
  const currentBudget = useSelector(selectCurrentBudget);
  const unifiedLoading = useSelector(selectUnifiedLoading);
  const isCacheValid = useSelector(selectIsCacheValid);

  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    loadData();
  }, []);

  // Reload data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Only fetch if cache is invalid (smart caching)
      if (!isCacheValid && currentFlat?._id) {
        loadFinancialData();
      }
    }, [isCacheValid, currentFlat])
  );

  const loadData = async () => {
    await dispatch(fetchUserFlat());
  };

  const loadFinancialData = async () => {
    if (currentFlat?._id) {
      await Promise.all([
        dispatch(fetchUserDues(currentFlat._id)),
        dispatch(fetchCurrentBudget({ flatId: currentFlat._id }))
      ]);
    }
  };

  // Load financial data when flat is available
  useEffect(() => {
    if (currentFlat?._id && !isCacheValid) {
      loadFinancialData();
    }
  }, [currentFlat?._id]);

  const onRefresh = async () => {
    setRefreshing(true);
    dispatch(invalidateCache()); // Invalidate cache to force refresh
    await Promise.all([
      dispatch(fetchUserFlat()),
      loadFinancialData()
    ]);
    setRefreshing(false);
  };
  
  const handleNotificationPress = () => {
    router.push("/reminders");
  };

  const handlePayDues = () => {
    router.push("/payDues");
  };

  const handleSplitExpense = () => {
    router.push("/splitExpense");
  };

  const totalRent = currentFlat?.rent || 0;
  const totalMembers = currentFlat?.stats?.totalMembers || 1;
  const rentPerPerson = totalMembers > 0 ? totalRent / totalMembers : 0;

  // Extract data from V2 unified financials ⭐
  const { userDues } = financials;
  
  // Calculate spending and budget
  const monthlyBudget = currentFlat?.monthlyBudget || 0;
  
  // User dues from V2 API
  const billDues = userDues?.billDues || [];
  const expenseDues = userDues?.expenseDues || [];
  const totalBillDue = userDues?.totalBillDue || 0;
  const totalExpenseDue = userDues?.totalExpenseDue || 0;
  const totalDue = userDues?.totalDue || 0;
  
  // Debug logging
  console.log('📊 [Home] User Dues Data:', {
    billDuesCount: billDues.length,
    expenseDuesCount: expenseDues.length,
    totalBillDue,
    totalExpenseDue,
    totalDue,
    currentFlat: currentFlat?._id,
    userData: user?._id
  });
  
  // Log individual dues with structure
  if (billDues.length > 0) {
    console.log('📋 [Home] Bill Dues Sample:', JSON.stringify(billDues[0], null, 2));
  }
  if (expenseDues.length > 0) {
    console.log('📋 [Home] Expense Dues Sample:', JSON.stringify(expenseDues[0], null, 2));
  }
  
  // Combine all pending dues
  const pendingExpenses = [...billDues, ...expenseDues];
  
  // Calculate payment stats
  const pendingAmount = totalDue;
  const paidAmount = 0; // Will be calculated from paid dues if needed
  const totalOwed = totalDue;
  const paymentProgress = totalOwed > 0 ? ((totalOwed - pendingAmount) / totalOwed) * 100 : 0;

  const loading = flatLoading || unifiedLoading;
  
  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle={theme.isDark ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.colors.background}
      />
      
      {/* Header */}
      <PageHeader
        title="Smart Rent"
        subtitle={user ? `Welcome, ${user.userName}` : undefined}
        rightAction={
          <TouchableOpacity 
            onPress={handleNotificationPress}
            style={styles.notificationButton}
          >
            <Bell size={theme.layout.iconSize.sm} color={iconColor} />
          </TouchableOpacity>
        }
      />

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
            progressBackgroundColor={theme.colors.card}
          />
        }
      >
        <View style={styles.content}>
          {/* Action Cards */}
          <View style={styles.actionCardsRow}>
            <Card
              variant="interactive"
              onPress={handlePayDues}
              style={styles.actionCard}
            >
              <View style={[styles.actionIcon, { backgroundColor: theme.colors.primaryBg }]}>
                <Wallet size={theme.layout.iconSize.md} color={theme.colors.primary} />
              </View>
              <Text style={[styles.actionText, { color: theme.colors.primary }]}>Pay Dues</Text>
            </Card>
            
            <Card
              variant="interactive"
              onPress={handleSplitExpense}
              style={styles.actionCard}
            >
              <View style={[styles.actionIcon, { backgroundColor: theme.colors.primaryBg }]}>
                <PlusCircleIcon size={theme.layout.iconSize.md} color={theme.colors.primary} />
              </View>
              <Text style={[styles.actionText, { color: theme.colors.primary }]}>Split Expense</Text>
            </Card>
          </View>

          {loading && !refreshing ? (
            <Card style={styles.loadingCard}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Loading data...</Text>
            </Card>
          ) : (
            <>
              {/* Current Month's Rent */}
              {currentFlat ? (
                <Card
                  variant="interactive"
                  onPress={() => router.push('/flatDetails')}
                  style={styles.flatCard}
                >
                  <View style={styles.flatHeader}>
                    <View style={styles.flatHeaderContent}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.flatName}>{currentFlat.name}</Text>
                        <Text style={styles.flatDate}>
                          {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </Text>
                      </View>
                      <View style={styles.viewDetailsButton}>
                        <Text style={[styles.viewDetailsText, { color: theme.colors.primary }]}>View Details</Text>
                        <ChevronRight size={theme.layout.iconSize.xs} color={theme.colors.primary} />
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.rentSection}>
                    <Text style={styles.rentLabel}>Total Monthly Rent</Text>
                    <Text style={styles.rentAmount}>₹{totalRent.toFixed(2)}</Text>
                  </View>

                  <View style={[styles.shareCard, { backgroundColor: theme.colors.primaryBg, borderColor: theme.colors.primary }]}>
                    <Text style={[styles.shareLabel, { color: theme.colors.primary }]}>Your Share</Text>
                    <Text style={[styles.shareAmount, { color: theme.colors.primary }]}>
                      ₹{rentPerPerson.toFixed(2)}
                    </Text>
                    <Text style={[styles.shareSplit, { color: theme.colors.primary }]}>
                      Split among {totalMembers} member{totalMembers !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  
                  {/* Payment Status Section */}
                  <View style={styles.paymentSection}>
                    {/* Monthly Rent Bar */}
                    <View style={styles.progressBarContainer}>
                      <View style={styles.progressBarHeader}>
                        <Text style={styles.progressBarLabel}>Monthly Rent</Text>
                        <Text style={styles.progressBarAmount}>₹{rentPerPerson.toFixed(2)}</Text>
                      </View>
                      <View style={[styles.progressBar, { backgroundColor: theme.colors.backgroundTertiary }]}>
                        <View 
                          style={[styles.progressBarFill, { backgroundColor: theme.colors.warning, width: '0%' }]}
                        />
                      </View>
                      <View style={styles.progressBarFooter}>
                        <Text style={styles.progressBarFooterText}>Pending</Text>
                        <Text style={[styles.progressBarFooterText, { color: theme.colors.warning, fontWeight: theme.typography.fontWeight.semibold }]}>Due this month</Text>
                      </View>
                    </View>

                    {/* Other Expenses Bar */}
                    {totalOwed > 0 && (
                      <View style={styles.progressBarContainer}>
                        <View style={styles.progressBarHeader}>
                          <Text style={styles.progressBarLabel}>Other Expenses</Text>
                          <Text style={styles.progressBarAmount}>₹{totalOwed.toFixed(2)}</Text>
                        </View>
                        <View style={[styles.progressBar, { backgroundColor: theme.colors.backgroundTertiary }]}>
                          <View 
                            style={[styles.progressBarFill, { backgroundColor: theme.colors.success, width: `${Math.min(paymentProgress, 100)}%` }]}
                          />
                        </View>
                        <View style={styles.progressBarFooter}>
                          <Text style={[styles.progressBarFooterText, { color: theme.colors.success, fontWeight: theme.typography.fontWeight.semibold }]}>
                            Paid: ₹{paidAmount.toFixed(2)}
                          </Text>
                          <Text style={[styles.progressBarFooterText, { color: theme.colors.error, fontWeight: theme.typography.fontWeight.semibold }]}>
                            Pending: ₹{pendingAmount.toFixed(2)}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                  
                  {/* Make Payment Button */}
                  <Button
                    variant="primary"
                    size="lg"
                    onPress={(e) => {
                      e?.stopPropagation?.();
                      handlePayDues();
                    }}
                  >
                    View Payment Details
                  </Button>
                </Card>
              ) : (
                <EmptyState
                  icon={<Receipt size={theme.layout.iconSize.lg} color={iconColor} />}
                  title="No Flat Yet"
                  message="Create or join a flat to start managing your rent and expenses"
                  actionLabel="Create Flat"
                  onAction={() => router.push('/createFlat')}
                />
              )}

              {/* Monthly Budget Card */}
              {currentFlat && monthlyBudget > 0 && (() => {
                // Use actual spending data from budget snapshot ⭐
                const spent = currentBudget?.actualSpent || 0;
                const budget = currentBudget?.budgetAmount || monthlyBudget;
                const percentage = budget > 0 ? (spent / budget) * 100 : 0;
                const remaining = budget - spent;
                
                console.log('💰 Budget display:', { spent, budget, percentage, currentBudget });
                
                return (
                  <Card
                    variant="interactive"
                    onPress={() => router.push('/budget')}
                    style={[styles.budgetCard, { backgroundColor: theme.colors.primary }]}
                  >
                    <View style={styles.budgetHeader}>
                      <View style={styles.budgetHeaderLeft}>
                        <View style={[styles.budgetIcon, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
                          <DollarSign size={theme.layout.iconSize.sm} color={theme.colors.textInverse} />
                        </View>
                        <View>
                          <Text style={[styles.budgetLabel, { color: theme.colors.textInverse }]}>Monthly Budget</Text>
                          <Text style={[styles.budgetAmount, { color: theme.colors.textInverse }]}>
                            ₹{currentFlat.monthlyBudget.toFixed(0)}
                          </Text>
                        </View>
                      </View>
                      <View style={[styles.budgetBadge, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
                        <Text style={[styles.budgetBadgeText, { color: theme.colors.textInverse }]}>
                          {new Date().toLocaleDateString('en-US', { month: 'short' })}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.budgetProgress}>
                      <View style={styles.budgetProgressHeader}>
                        <Text style={[styles.budgetProgressLabel, { color: 'rgba(255, 255, 255, 0.9)' }]}>Spent this month</Text>
                        <Text style={[styles.budgetProgressAmount, { color: theme.colors.textInverse }]}>
                          ₹{spent.toFixed(0)}
                        </Text>
                      </View>
                      <View style={[styles.budgetProgressBar, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
                        <View 
                          style={[
                            styles.budgetProgressFill,
                            { 
                              backgroundColor: percentage > 100 ? theme.colors.danger : percentage > 80 ? '#FCD34D' : theme.colors.textInverse,
                              width: `${Math.min(percentage, 100)}%` 
                            }
                          ]}
                        />
                      </View>
                      <Text style={[styles.budgetProgressText, { color: 'rgba(255, 255, 255, 0.9)' }]}>
                        {percentage.toFixed(0)}% used
                      </Text>
                    </View>

                    <View style={[styles.budgetFooter, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
                      <View style={styles.budgetFooterLeft}>
                        {remaining >= 0 ? (
                          <TrendingDown size={theme.layout.iconSize.sm} color={theme.colors.textInverse} />
                        ) : (
                          <TrendingUp size={theme.layout.iconSize.sm} color={theme.colors.danger} />
                        )}
                        <Text style={[styles.budgetFooterLabel, { color: theme.colors.textInverse }]}>
                          {remaining >= 0 ? 'Remaining' : 'Over Budget'}
                        </Text>
                      </View>
                      <Text style={[styles.budgetFooterAmount, { color: remaining >= 0 ? theme.colors.textInverse : theme.colors.danger }]}>
                        ₹{Math.abs(remaining).toFixed(0)}
                      </Text>
                    </View>
                  </Card>
                );
              })()}



              {/* Set Budget Prompt (if no budget set) */}
              {currentFlat && (!monthlyBudget || monthlyBudget === 0) && (
                <Card
                  variant="interactive"
                  onPress={() => router.push('/budget')}
                  style={[styles.setBudgetCard, { backgroundColor: theme.colors.primaryBg, borderColor: theme.colors.primary }]}
                >
                  <View style={styles.setBudgetContent}>
                    <View style={[styles.setBudgetIcon, { backgroundColor: theme.colors.primaryBg }]}>
                      <DollarSign size={theme.layout.iconSize.md} color={theme.colors.primary} />
                    </View>
                    <View style={styles.setBudgetText}>
                      <Text style={[styles.setBudgetTitle, { color: theme.colors.text }]}>
                        Set Monthly Budget
                      </Text>
                      <Text style={[styles.setBudgetSubtitle, { color: theme.colors.primary }]}>
                        Track your spending and stay within limits
                      </Text>
                    </View>
                    <ChevronRight size={theme.layout.iconSize.md} color={theme.colors.primary} />
                  </View>
                </Card>
              )}

              {/* Pending Expenses */}
              {pendingExpenses.length > 0 && (
                <View style={styles.section}>
                  <SectionTitle
                    title={`Pending Payments (${pendingExpenses.length})`}
                  />
                  
                  <View style={styles.pendingList}>
                    {pendingExpenses.slice(0, 5).map((due, index) => {
                      // Handle both bill dues and expense dues
                      const isBillDue = !!due.billId;
                      const id = isBillDue ? due.billId?._id : due.expenseId;
                      const title = isBillDue ? due.billId?.title : due.title;
                      const category = isBillDue ? due.billId?.category : due.category;
                      const amountOwed = due.userAmount || 0;
                      const dueDate = isBillDue ? due.billId?.dueDate : null;
                      
                      console.log('💳 [Home] Pending item:', { title, amountOwed, userAmount: due.userAmount, amount: due.amount });
                      
                      return (
                        <Card
                          key={`${id}-${index}`}
                          variant="interactive"
                          onPress={() => {
                            router.push('/payDues');
                          }}
                          style={styles.pendingCard}
                        >
                          <View style={styles.pendingCardContent}>
                            <View style={styles.pendingCardLeft}>
                              <View style={[styles.categoryIcon, { backgroundColor: theme.colors.warningBg }]}>
                                <Text style={[styles.categoryIconText, { color: theme.colors.warning }]}>
                                  {category?.charAt(0).toUpperCase() || (isBillDue ? 'B' : 'E')}
                                </Text>
                              </View>
                              <View style={{ flex: 1 }}>
                                <Text style={styles.pendingTitle}>{title || (isBillDue ? 'Bill' : 'Expense')}</Text>
                                <Text style={styles.pendingDate}>
                                  {dueDate ? new Date(dueDate).toLocaleDateString() : 'No due date'}
                                </Text>
                              </View>
                            </View>
                            <View style={styles.pendingCardRight}>
                              <Text style={styles.pendingAmount}>
                                ₹{amountOwed?.toFixed(2) || '0.00'}
                              </Text>
                              <Text style={[styles.pendingStatus, { color: theme.colors.error }]}>Unpaid</Text>
                            </View>
                          </View>
                        </Card>
                      );
                    })}
                  </View>

                  {pendingExpenses.length > 5 && (
                    <TouchableOpacity 
                      onPress={handlePayDues}
                      style={styles.viewAllButton}
                    >
                      <Text style={[styles.viewAllText, { color: theme.colors.primary }]}>
                        View All ({pendingExpenses.length})
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Expense Stats - From V2 Unified API ⭐ */}
              <View style={styles.section}>
                <SectionTitle title="Monthly Overview" />
                
                <View style={styles.statsRow}>
                  <StatCard
                    label="Bill Dues"
                    value={billDues.length || 0}
                    variant="info"
                    style={{ flex: 1 }}
                  />
                  <StatCard
                    label="Expense Dues"
                    value={expenseDues.length || 0}
                    variant="warning"
                    style={{ flex: 1 }}
                  />
                </View>

                <Card style={[styles.summaryCard, { backgroundColor: theme.colors.backgroundSecondary }]}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Monthly Budget:</Text>
                    <Text style={styles.summaryValue}>
                      ₹{monthlyBudget.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Bill Dues:</Text>
                    <Text style={[styles.summaryValue, { color: theme.colors.warning }]}>
                      ₹{totalBillDue.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Expense Dues:</Text>
                    <Text style={[styles.summaryValue, { color: theme.colors.primary }]}>
                      ₹{totalExpenseDue.toFixed(2)}
                    </Text>
                  </View>
                  <View style={[styles.summaryRow, { marginBottom: 0 }]}>
                    <Text style={styles.summaryLabel}>Total Dues:</Text>
                    <Text style={[styles.summaryValue, { color: theme.colors.error }]}>
                      ₹{totalDue.toFixed(2)}
                    </Text>
                  </View>
                </Card>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.lg,
  },
  notificationButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.full,
  },
  actionCardsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing['2xl'],
  },
  actionCard: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primaryBg,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  actionText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  loadingCard: {
    marginBottom: theme.spacing['2xl'],
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.sm,
    color: theme.colors.textSecondary,
  },
  flatCard: {
    marginBottom: theme.spacing['2xl'],
  },
  flatHeader: {
    marginBottom: theme.spacing.lg,
  },
  flatHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  flatName: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  flatDate: {
    color: theme.colors.textTertiary,
    fontSize: theme.typography.fontSize.sm,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewDetailsText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    marginRight: theme.spacing.xs,
  },
  rentSection: {
    marginBottom: theme.spacing.lg,
  },
  rentLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  rentAmount: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  shareCard: {
    borderRadius: theme.borderRadius['2xl'],
    borderWidth: 1,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  shareLabel: {
    fontSize: theme.typography.fontSize.sm,
    marginBottom: theme.spacing.xs,
  },
  shareAmount: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
  },
  shareSplit: {
    fontSize: theme.typography.fontSize.xs,
    marginTop: theme.spacing.xs,
  },
  paymentSection: {
    marginBottom: theme.spacing.lg,
  },
  progressBarContainer: {
    marginBottom: theme.spacing.lg,
  },
  progressBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  progressBarLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
  },
  progressBarAmount: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  progressBar: {
    height: 12,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 12,
    borderRadius: theme.borderRadius.full,
  },
  progressBarFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xs,
  },
  progressBarFooterText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textTertiary,
  },
  budgetCard: {
    marginBottom: theme.spacing['2xl'],
  },
  budgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  budgetHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  budgetIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  budgetLabel: {
    fontSize: theme.typography.fontSize.sm,
  },
  budgetAmount: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
  },
  budgetBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  budgetBadgeText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  budgetProgress: {
    marginBottom: theme.spacing.md,
  },
  budgetProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  budgetProgressLabel: {
    fontSize: theme.typography.fontSize.sm,
  },
  budgetProgressAmount: {
    fontWeight: theme.typography.fontWeight.semibold,
  },
  budgetProgressBar: {
    borderRadius: theme.borderRadius.full,
    height: 8,
  },
  budgetProgressFill: {
    height: 8,
    borderRadius: theme.borderRadius.full,
  },
  budgetProgressText: {
    fontSize: theme.typography.fontSize.xs,
    marginTop: theme.spacing.xs,
  },
  budgetFooter: {
    borderRadius: theme.borderRadius['2xl'],
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  budgetFooterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  budgetFooterLabel: {
    fontSize: theme.typography.fontSize.sm,
    marginLeft: theme.spacing.sm,
  },
  budgetFooterAmount: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
  },
  setBudgetCard: {
    marginBottom: theme.spacing['2xl'],
    borderWidth: 2,
  },
  setBudgetContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  setBudgetIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.lg,
  },
  setBudgetText: {
    flex: 1,
  },
  setBudgetTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing.xs,
  },
  setBudgetSubtitle: {
    fontSize: theme.typography.fontSize.sm,
  },
  section: {
    marginBottom: theme.spacing['2xl'],
  },
  pendingList: {
    gap: theme.spacing.md,
  },
  pendingCard: {
    // No additional styles needed, using Card defaults
  },
  pendingCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pendingCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  categoryIconText: {
    fontWeight: theme.typography.fontWeight.bold,
  },
  pendingTitle: {
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
  },
  pendingDate: {
    color: theme.colors.textTertiary,
    fontSize: theme.typography.fontSize.sm,
  },
  pendingCardRight: {
    alignItems: 'flex-end',
  },
  pendingAmount: {
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  pendingStatus: {
    fontSize: theme.typography.fontSize.sm,
  },
  viewAllButton: {
    marginTop: theme.spacing.md,
  },
  viewAllText: {
    fontWeight: theme.typography.fontWeight.semibold,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  summaryCard: {
    // backgroundColor set inline with theme
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  summaryLabel: {
    color: theme.colors.textSecondary,
  },
  summaryValue: {
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
});