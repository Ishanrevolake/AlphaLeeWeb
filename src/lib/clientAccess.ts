import { supabase } from '@/lib/supabase';

export type PaymentStatus = 'pending_verification' | 'verified' | 'rejected';

export type LatestPayment = {
  id: string;
  reference: string;
  amount_lkr: number;
  status: PaymentStatus;
  slip_file_name: string | null;
  submitted_at: string;
  verified_at: string | null;
  rejection_reason: string | null;
};

export async function hasVerifiedPayment(userId: string) {
  const { data, error } = await supabase
    .from('payments')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'verified')
    .limit(1);

  if (error) {
    return false;
  }

  return Boolean(data?.length);
}

export async function getLatestPayment(userId: string): Promise<LatestPayment | null> {
  const { data, error } = await supabase
    .from('payments')
    .select('id, reference, amount_lkr, status, slip_file_name, submitted_at, verified_at, rejection_reason')
    .eq('user_id', userId)
    .order('submitted_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as LatestPayment;
}
