import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { initialState, useFunnelStore, type FunnelData } from '@/store/funnelStore';
import { getPackageById } from '@/lib/packages';
import { getLatestAskAlphaOrder, getLatestPayment } from '@/lib/clientAccess';
import { getAskAlphaOfferById } from '@/lib/askAlpha';

// Drafts never grant access; payment records remain the source of entitlement.
export function readDraft(value: unknown): FunnelData {
  const result = { ...initialState };
  if (!value || typeof value !== 'object') return result;
  const input = value as Record<string, unknown>;
  for (const key of Object.keys(initialState) as (keyof FunnelData)[]) {
    const item = input[key];
    if (typeof initialState[key] === 'string' && typeof item === 'string') {
      Object.assign(result, { [key]: item.slice(0, 10000) });
    }
  }
  result.selectedPackage = typeof input.selectedPackage === 'string' && getPackageById(input.selectedPackage)
    ? input.selectedPackage : null;
  result.ownerId = typeof input.ownerId === 'string' ? input.ownerId : null;
  result.draftUpdatedAt = typeof input.draftUpdatedAt === 'number' ? input.draftUpdatedAt : 0;
  result.intakeComplete = input.intakeComplete === true && [
    result.age, result.gender, result.height, result.weight, result.goalWeight,
    result.experienceLevel, result.workoutLocation, result.workoutDays,
    result.dietPreference, result.primaryGoal,
  ].every(value => value.trim().length > 0);
  result.replyGuaranteeAddon = input.replyGuaranteeAddon === true;
  // A browser File cannot be restored from a saved draft.
  result.paymentSlipName = '';
  return result;
}

export function restoreDraft(user: User) {
  const local = useFunnelStore.getState();
  const remote = readDraft(user.user_metadata.onboarding_draft);
  const ownsLocal = local.ownerId === user.id || (!local.ownerId && !!local.email && local.email.toLowerCase() === user.email?.toLowerCase());
  const draft = ownsLocal && local.draftUpdatedAt >= remote.draftUpdatedAt ? readDraft(local) : remote;
  // Only carry a guest's package choice, never another client's intake details.
  if (!draft.selectedPackage && !local.ownerId && !local.email) draft.selectedPackage = local.selectedPackage;
  const metadata = user.user_metadata;
  useFunnelStore.setState({
    ...draft,
    ownerId: user.id,
    firstName: String(metadata.first_name || draft.firstName || ''),
    lastName: String(metadata.last_name || draft.lastName || ''),
    name: String(metadata.full_name || draft.name || ''),
    email: user.email || '',
    phone: String(metadata.phone || draft.phone || ''),
  });
}

export function draftRoute(draft: FunnelData = useFunnelStore.getState()) {
  if (!getPackageById(draft.selectedPackage)) return '/packages';
  return draft.intakeComplete ? '/signup/step-3' : '/signup/step-2';
}

let saveQueue: Promise<void> = Promise.resolve();
export function saveDraft() {
  const draft = readDraft(useFunnelStore.getState());
  const save = saveQueue.catch(() => {}).then(async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user || data.user.id !== draft.ownerId) throw new Error('Please log in again to save your progress.');
    const { error: saveError } = await supabase.auth.updateUser({ data: { onboarding_draft: draft, onboarding_flow: 'programme' } });
    if (saveError) throw new Error('Your progress is saved on this browser, but could not sync to your account. Please retry.');
  });
  saveQueue = save;
  return save;
}

export async function resumeSignup(user: User) {
  restoreDraft(user);
  const [payment, order] = await Promise.all([getLatestPayment(user.id), getLatestAskAlphaOrder(user.id)]);
  if (payment?.status === 'verified') return '/dashboard';
  if (order?.status === 'verified') return '/ask-alpha/dashboard';
  if (payment || order) return '/signup/success';
  const offer = user.user_metadata.onboarding_offer;
  if (typeof offer === 'string' && getAskAlphaOfferById(offer) &&
    (user.user_metadata.onboarding_flow === 'ask_alpha' || !useFunnelStore.getState().selectedPackage)) {
    return `/ask-alpha/account?offer=${encodeURIComponent(offer)}`;
  }
  return draftRoute();
}

export async function choosePackage(packageId: string) {
  const { data } = await supabase.auth.getUser();
  if (data.user) restoreDraft(data.user);
  else useFunnelStore.getState().clearFunnel();
  useFunnelStore.getState().setPackage(packageId);
  if (!data.user) return '/signup/step-1';
  await saveDraft();
  return draftRoute();
}
