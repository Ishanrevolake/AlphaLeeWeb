import { useEffect, useState } from 'react';
import { useFunnelStore } from '@/store/funnelStore';
import { saveDraft } from '@/lib/onboardingDraft';

export function useDraftAutosave(enabled: boolean) {
  const [message, setMessage] = useState('');
  useEffect(() => {
    if (!enabled) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let active = true;
    const sync = () => {
      timer = undefined;
      void saveDraft().then(() => {
        if (active) setMessage('Progress saved. You can log in later to continue.');
      }).catch((error: Error) => {
        if (active) setMessage(error.message);
      });
    };
    const unsubscribe = useFunnelStore.subscribe((state, previous) => {
      if (state.draftUpdatedAt === previous.draftUpdatedAt) return;
      setMessage('Saving progress…');
      clearTimeout(timer);
      timer = setTimeout(sync, 800);
    });
    const flush = () => { if (timer) { clearTimeout(timer); sync(); } };
    sync();
    const onVisibility = () => { if (document.visibilityState === 'hidden') flush(); };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      active = false;
      unsubscribe();
      document.removeEventListener('visibilitychange', onVisibility);
      flush();
    };
  }, [enabled]);
  return message;
}
