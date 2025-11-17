import { useRouter } from "expo-router";
import { ArrowUpDown, Calendar, CheckCircle, DollarSign } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from "react-native";
import { useDispatch, useSelector } from 'react-redux';
import {
    Card,
    EmptyState,
    PageHeader,
    SectionTitle,
    StatCard
} from '../../components/ui';
import { fetchExpenseHistory, selectExpenseHistory } from '../../store/slices/expenseUnifiedSlice';

const history = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  
  const { userData } = useSelector((state) => state.auth);
  const { currentFlat } = useSelector((state) => state.flat);
  const expenseHistory = useSelector(selectExpenseHistory);
  const { loading } = useSelector((state) => state.expenseUnified);
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  
  useEffect(() => {
    loadData();
  }, [currentFlat?._id]);

  const loadData = async () => {
    if (currentFlat?._id) {
      await dispatch(fetchExpenseHistory({ 
        flatId: currentFlat._id, 
        page: 1,
        limit: 50
      }));
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Extract only bills/expenses that the current user has PAID
  const allExpenses = expenseHistory?.data || [];
  const currentUserId = userData?._id;
  
  console.log('📜 History - Total expenses:', allExpenses.length);
  console.log('📜 History - Current user:', currentUserId);
  
  // Debug: Log all expenses with their structure
  if (allExpenses.length > 0) {
    const sampleExp = allExpenses[0];
    console.log('📜 Sample expense structure:', {
      title: sampleExp.title,
      type: sampleExp.type,
      hasSplits: !!sampleExp.splits,
      hasParticipants: !!sampleExp.participants,
      splits: sampleExp.splits?.map(s => ({
        userId: s.userId?._id || s.userId,
        amount: s.amount,
        status: s.status,
        paidAt: s.paidAt
      })),
      participants: sampleExp.participants?.map(p => ({
        userId: p.userId?._id || p.userId,
        amount: p.amount,
        isPaid: p.isPaid,
        paidAt: p.paidAt
      }))
    });
  }
  
  // Get bills where user has paid their split
  const paidBills = allExpenses
    .filter(exp => exp.splits !== undefined) // Is a bill
    .filter(bill => {
      const userSplit = bill.splits?.find(split => {
        const splitUserId = split.userId?._id?.toString() || split.userId?.toString();
        return splitUserId === currentUserId;
      });
      const isPaid = userSplit && userSplit.status === 'paid';
      if (isPaid) {
        console.log('📜 Found paid bill:', {
          title: bill.title,
          split: userSplit,
          splitAmount: userSplit?.amount,
          splitStatus: userSplit?.status,
          paidAt: userSplit?.paidAt
        });
      }
      return isPaid;
    })
    .map(bill => {
      const userSplit = bill.splits?.find(split => {
        const splitUserId = split.userId?._id?.toString() || split.userId?.toString();
        return splitUserId === currentUserId;
      });
      const amount = userSplit?.amount || 0;
      console.log('📜 Mapping bill to transaction:', {
        billTitle: bill.title,
        amount: amount,
        userSplit: userSplit
      });
      return {
        _id: bill._id,
        description: bill.title,
        type: bill.category || 'bill',
        amount: amount,
        date: userSplit?.paidAt || bill.createdAt,
        category: bill.category,
        paymentMethod: 'cash'
      };
    });
  
  // Get split expenses where user has paid
  const paidSplitExpenses = allExpenses
    .filter(exp => exp.participants !== undefined && exp.splits === undefined) // Is a split expense
    .filter(expense => {
      const userParticipant = expense.participants?.find(p => {
        const participantUserId = p.userId?._id?.toString() || p.userId?.toString();
        return participantUserId === currentUserId;
      });
      const isPaid = userParticipant && userParticipant.isPaid;
      if (isPaid) {
        console.log('📜 Found paid expense:', {
          title: expense.title,
          participant: userParticipant,
          participantAmount: userParticipant?.amount,
          isPaid: userParticipant?.isPaid,
          paidAt: userParticipant?.paidAt
        });
      }
      return isPaid;
    })
    .map(expense => {
      const userParticipant = expense.participants?.find(p => {
        const participantUserId = p.userId?._id?.toString() || p.userId?.toString();
        return participantUserId === currentUserId;
      });
      const amount = userParticipant?.amount || 0;
      console.log('📜 Mapping expense to transaction:', {
        expenseTitle: expense.title,
        amount: amount,
        userParticipant: userParticipant
      });
      return {
        _id: expense._id,
        description: expense.title,
        type: 'split_expense',
        amount: amount,
        date: userParticipant?.paidAt || expense.createdAt,
        category: expense.category,
        paymentMethod: 'cash'
      };
    });
  
  // Combine and sort by date
  const transactions = [...paidBills, ...paidSplitExpenses]
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  
  console.log('📜 History - Paid bills:', paidBills.length);
  console.log('📜 History - Paid split expenses:', paidSplitExpenses.length);
  console.log('📜 History - Total transactions:', transactions.length);
  
  // Debug: Log sample transactions with amounts
  if (transactions.length > 0) {
    console.log('📜 Sample transaction:', {
      description: transactions[0].description,
      amount: transactions[0].amount,
      type: transactions[0].type,
      date: transactions[0].date
    });
  }
  
  // Calculate summary
  const summary = {
    totalAmount: transactions.reduce((sum, txn) => sum + txn.amount, 0),
    thisMonth: transactions
      .filter(txn => {
        const txnDate = new Date(txn.date);
        const now = new Date();
        return txnDate.getMonth() === now.getMonth() && txnDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, txn) => sum + txn.amount, 0),
    avgTransaction: transactions.length > 0 ? transactions.reduce((sum, txn) => sum + txn.amount, 0) / transactions.length : 0
  };

  const filteredTransactions = transactions.filter(txn => {
    if (selectedPeriod === 'all') return true;
    const txnDate = new Date(txn.date);
    const now = new Date();
    
    switch (selectedPeriod) {
      case 'month':
        return txnDate.getMonth() === now.getMonth() && txnDate.getFullYear() === now.getFullYear();
      case 'quarter':
        const quarterStart = Math.floor(now.getMonth() / 3) * 3;
        return txnDate.getMonth() >= quarterStart && txnDate.getMonth() < quarterStart + 3 && txnDate.getFullYear() === now.getFullYear();
      case 'year':
        return txnDate.getFullYear() === now.getFullYear();
      default:
        return true;
    }
  });



  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <PageHeader
        title="Payment History"
        subtitle="Track all your past payments"
      />

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Transaction Summary Cards */}
        {summary && (
          <View className="px-4 py-4">
            <View className="flex-row gap-3">
              <StatCard
                label="Total Paid"
                value={`₹${summary.totalAmount?.toFixed(0) || 0}`}
                variant="success"
                icon={<CheckCircle size={18} color="#16a34a" />}
                className="flex-1"
              />

              <StatCard
                label="This Month"
                value={`₹${summary.thisMonth?.toFixed(0) || 0}`}
                variant="info"
                icon={<Calendar size={18} color="#3b82f6" />}
                className="flex-1"
              />

              <StatCard
                label="Avg/Txn"
                value={`₹${summary.avgTransaction?.toFixed(0) || 0}`}
                variant="default"
                icon={<DollarSign size={18} color="#8b5cf6" />}
                className="flex-1"
              />
            </View>
          </View>
        )}

        {/* Transaction List */}
        <View className="pb-6">
          {loading && !refreshing ? (
            <Card className="mx-4 items-center py-8">
              <ActivityIndicator size="large" color="#16a34a" />
              <Text className="mt-2 text-text-secondary">Loading history...</Text>
            </Card>
          ) : !filteredTransactions || filteredTransactions.length === 0 ? (
            <View className="mx-4">
              <EmptyState
                icon={<ArrowUpDown size={48} color="#3b82f6" />}
                title="No Transactions"
                message="Your transaction history will appear here"
              />
            </View>
          ) : (
            <View className="px-4">
              <View className="flex-row items-center justify-between mb-4">
                <SectionTitle title="All Transactions" variant="compact" className="mb-0" />
                <View className="bg-success-100 px-3 py-1 rounded-full">
                  <Text className="text-success-700 text-xs font-semibold">
                    {filteredTransactions.length} total
                  </Text>
                </View>
              </View>

              <View className="gap-3">
                {filteredTransactions.map((txn, index) => (
                  <Card key={txn._id || index} variant="flat">
                    <View className="flex-row items-start justify-between mb-2">
                      <View className="flex-row items-center flex-1">
                        <View className="w-12 h-12 bg-success-100 rounded-2xl items-center justify-center mr-3">
                          <CheckCircle size={24} color="#16a34a" />
                        </View>
                        <View className="flex-1">
                          <Text className="text-base font-bold text-text-primary">
                            {txn.description || 'Payment'}
                          </Text>
                          <Text className="text-sm text-text-secondary mt-1 capitalize">
                            {txn.type?.replace('_', ' ') || 'Transaction'}
                          </Text>
                        </View>
                      </View>
                      
                      <View className="items-end">
                        <Text className="text-lg font-bold text-success-600">
                          ₹{txn.amount?.toFixed(0) || 0}
                        </Text>
                        <Text className="text-xs text-text-secondary mt-1">
                          {new Date(txn.date).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </Text>
                      </View>
                    </View>

                    {txn.category && (
                      <View className="bg-surface-100 rounded-lg p-2 mt-2">
                        <Text className="text-xs text-text-secondary capitalize">
                          Category: {txn.category}
                        </Text>
                      </View>
                    )}
                  </Card>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default history;
