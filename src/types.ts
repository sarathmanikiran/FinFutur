export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id?: string;
  userId: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  notes?: string;
  createdAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  currency: string;
  dailyLimit?: number;
  totalBalance: number;
  savingStreak: number;
  financialHealthScore: number;
}

export interface Goal {
  id?: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  status: 'active' | 'completed' | 'cancelled';
}

export interface Badge {
  id?: string;
  userId: string;
  badgeId: string;
  name: string;
  earnedAt: string;
}
