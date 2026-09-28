const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

// Load the browser modules with isolated auth/storage substitutes; no live writes.
function setup() {
  let user = { id: 'alice', email: 'alice@example.test', user_metadata: { first_name: 'Alice' } };
  let payment = null;
  let order = null;
  let failSave = false;
  const writes = [];
  const cache = {};
  const auth = {
    getUser: async () => ({ data: { user }, error: null }),
    updateUser: async (payload) => {
      if (failSave) return { error: new Error('offline') };
      writes.push(payload);
      return { error: null };
    },
  };
  const storage = new Map();
  const localStorage = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) };
  function load(name) {
    if (name === '@/lib/supabase') return { supabase: { auth } };
    if (name === '@/lib/clientAccess') return { getLatestPayment: async () => payment, getLatestAskAlphaOrder: async () => order };
    if (!name.startsWith('@/')) return require(name);
    if (cache[name]) return cache[name].exports;
    const filename = path.resolve(__dirname, '../src', name.slice(2) + '.ts');
    const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
    const module = { exports: {} };
    cache[name] = module;
    vm.runInNewContext(output, { module, exports: module.exports, require: load, localStorage, console, Date }, { filename });
    return module.exports;
  }
  const api = load('@/lib/onboardingDraft');
  const { useFunnelStore: store, initialState } = load('@/store/funnelStore');
  const complete = { ...initialState, selectedPackage: 'rookie', intakeComplete: true, age: '30', gender: 'Male', height: '170', weight: '70', goalWeight: '65', experienceLevel: 'Beginner', workoutLocation: 'Gym', workoutDays: '3', dietPreference: 'Any', primaryGoal: 'Lose Fat', draftUpdatedAt: 10 };
  return { api, store, user, complete, writes, setUser: value => user = value, setPayment: value => payment = value, setOrder: value => order = value, fail: () => failSave = true };
}

test('new device restores the completed intake and resumes payment', async () => {
  const h = setup();
  h.user.user_metadata.onboarding_draft = h.complete;
  assert.equal(await h.api.resumeSignup(h.user), '/signup/step-3');
  assert.equal(h.store.getState().age, '30');
  assert.equal(h.store.getState().ownerId, 'alice');
});

test('partial intake resumes intake; no recorded package returns to packages', async () => {
  const h = setup();
  assert.equal(await h.api.resumeSignup(h.user), '/packages');
  h.user.user_metadata.onboarding_draft = { ...h.complete, height: '' };
  assert.equal(await h.api.resumeSignup(h.user), '/signup/step-2');
  assert.equal(h.store.getState().age, '30');
});

test('another account cannot inherit intake details from this browser', () => {
  const h = setup();
  h.store.setState({ ...h.complete, ownerId: 'bob', notes: 'private', draftUpdatedAt: 999 });
  h.api.restoreDraft(h.user);
  assert.equal(h.store.getState().notes, '');
  assert.equal(h.store.getState().selectedPackage, null);
});

test('newer same-account local edits survive an interrupted sync', () => {
  const h = setup();
  h.user.user_metadata.onboarding_draft = h.complete;
  h.store.setState({ ...h.complete, ownerId: 'alice', age: '31', draftUpdatedAt: 20 });
  h.api.restoreDraft(h.user);
  assert.equal(h.store.getState().age, '31');
});

test('payment status takes priority over all draft data', async () => {
  const h = setup();
  h.user.user_metadata.onboarding_draft = h.complete;
  for (const status of ['pending_verification', 'rejected']) {
    h.setPayment({ status });
    assert.equal(await h.api.resumeSignup(h.user), '/signup/success');
  }
  h.setPayment({ status: 'verified' });
  assert.equal(await h.api.resumeSignup(h.user), '/dashboard');
  h.setPayment(null);
  h.setOrder({ status: 'verified' });
  assert.equal(await h.api.resumeSignup(h.user), '/ask-alpha/dashboard');
});

test('unsent slip filenames are cleared and unknown fields are excluded', () => {
  const h = setup();
  const draft = h.api.readDraft({ ...h.complete, paymentSlipName: 'old.pdf', password: 'secret', role: 'trainer' });
  assert.equal(draft.paymentSlipName, '');
  assert.equal(draft.password, undefined);
  assert.equal(draft.role, undefined);
});

test('save rejects switched accounts and reports failed syncs', async () => {
  const h = setup();
  h.api.restoreDraft(h.user);
  await h.api.saveDraft();
  assert.equal(h.writes.length, 1);
  h.setUser({ ...h.user, id: 'bob' });
  await assert.rejects(h.api.saveDraft(), /log in again/);
  assert.equal(h.writes.length, 1);
  h.setUser(h.user);
  h.fail();
  await assert.rejects(h.api.saveDraft(), /could not sync/);
});

test('Ask Alpha signup resumes its saved offer without programme access', async () => {
  const h = setup();
  h.user.user_metadata.onboarding_offer = 'single-question';
  assert.equal(await h.api.resumeSignup(h.user), '/ask-alpha/account?offer=single-question');
});
