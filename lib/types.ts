export interface Subscription {
  id: string
  user_id: string
  name: string
  amount: number
  cycle: 'monthly' | 'yearly'
  next_billing_date: string
  category: string
  created_at: string
}

export type NewSubscription = Omit<Subscription, 'id' | 'user_id' | 'created_at'>
