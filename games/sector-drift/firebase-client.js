import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

import { firebaseConfig } from "./firebase-config.js";

let app = null;
let auth = null;
let db = null;
let provider = null;
let firebaseInitError = "";
let currentUser = null;
let currentRole = "unknown";
let currentRoleReason = "No user signed in yet.";
const authListeners = new Set();

function friendlyError(error, fallback = "Firebase is unavailable right now. Local save still works.") {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  return error.message || error.code || fallback;
}

function safeUser(user) {
  if (!user) return null;
  return {
    uid: user.uid,
    email: user.email || "",
    displayName: user.displayName || "",
    photoURL: user.photoURL || ""
  };
}

function success(data = null) {
  return { ok: true, data };
}

function failure(error) {
  return { ok: false, error: friendlyError(error) };
}

function isFirebaseConfigured() {
  return Boolean(firebaseConfig?.apiKey && firebaseConfig?.authDomain && firebaseConfig?.projectId && app && auth && db);
}

function getFirebaseStatus() {
  if (firebaseInitError) {
    return { ok: false, status: "unavailable", error: firebaseInitError, role: currentRole, roleReason: currentRoleReason };
  }
  if (!isFirebaseConfigured()) {
    return { ok: false, status: "not initialized", error: "Firebase is not initialized. Local save still works.", role: currentRole, roleReason: currentRoleReason };
  }
  return { ok: true, status: "available", user: safeUser(currentUser), role: currentRole, roleReason: currentRoleReason };
}

function requireFirebase() {
  if (!isFirebaseConfigured()) return failure(firebaseInitError || "Firebase is unavailable. Local save still works.");
  return success();
}

async function ensureUserProfile(user = currentUser) {
  try {
    const ready = requireFirebase();
    if (!ready.ok) return ready;
    if (!user) {
      currentRole = "unknown";
      currentRoleReason = "No signed-in user is available for role lookup.";
      return failure("Sign in first to use cloud backup.");
    }

    const userRef = doc(db, "users", user.uid);
    const snapshot = await getDoc(userRef);
    const now = serverTimestamp();

    if (!snapshot.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email || "",
        displayName: user.displayName || "",
        role: "student",
        createdAt: now,
        lastLoginAt: now
      });
      currentRole = "student";
      currentRoleReason = "Created users/{uid} with default student role.";
    } else {
      const data = snapshot.data() || {};
      currentRole = typeof data.role === "string" && data.role ? data.role : "unknown";
      currentRoleReason = currentRole === "unknown" ? "users/{uid}.role is missing or blank." : "Loaded role from users/{uid}.";
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email || "",
        displayName: user.displayName || "",
        lastLoginAt: now
      }, { merge: true });
    }

    return success({ user: safeUser(user), role: currentRole, roleReason: currentRoleReason });
  } catch (error) {
    currentRole = "unknown";
    currentRoleReason = friendlyError(error, "Role lookup failed.");
    return failure(error);
  }
}

async function signInWithGoogle() {
  try {
    const ready = requireFirebase();
    if (!ready.ok) return ready;
    const result = await signInWithPopup(auth, provider);
    if (!result?.user) return failure("Google sign-in did not return an account. Local save still works.");
    currentUser = result.user;
    const profile = await ensureUserProfile(result.user);
    return profile.ok ? success({ user: safeUser(result.user), role: currentRole, roleReason: currentRoleReason }) : profile;
  } catch (error) {
    return failure(error);
  }
}

async function signOutOfFirebase() {
  try {
    const ready = requireFirebase();
    if (!ready.ok) return ready;
    await signOut(auth);
    currentUser = null;
    currentRole = "unknown";
    currentRoleReason = "Signed out; no role loaded.";
    return success({ signedOut: true });
  } catch (error) {
    return failure(error);
  }
}

function getCurrentFirebaseUser() {
  try {
    return success(safeUser(currentUser));
  } catch (error) {
    return failure(error);
  }
}

function getCurrentUserRole() {
  try {
    return { ok: true, data: currentRole || "unknown", reason: currentRoleReason };
  } catch (error) {
    return failure(error);
  }
}

// TODO: Future multiplayer must not trust client-side credits, cargo, ship ownership, combat outcomes, planet ownership, or PvP results.
// TODO: Future teacher dashboard should be role-gated by Firebase Auth and Firestore Security Rules.
// TODO: Future shared universe needs server-side validation or very careful rules.
// TODO: Future PvP must wait until teacher controls, safe zones, protected space, and restore tools exist.
// TODO: Cloud backup is not anti-cheat. It is only save portability and login readiness.
async function saveCloudBackup(saveData, version = saveData?.version || "localStorage-v1") {
  try {
    const ready = requireFirebase();
    if (!ready.ok) return ready;
    if (!currentUser) return failure("Sign in first to save a cloud backup.");
    if (!saveData || typeof saveData !== "object" || Array.isArray(saveData)) return failure("Cloud backup needs a valid local save object.");
    const profile = await ensureUserProfile(currentUser);
    if (!profile.ok) return failure(profile.error || "Role lookup failed. Local save still works.");
    await setDoc(doc(db, "players", currentUser.uid), {
      uid: currentUser.uid,
      saveData,
      updatedAt: serverTimestamp(),
      version
    }, { merge: true });
    return success({ uid: currentUser.uid, version });
  } catch (error) {
    return failure(error);
  }
}

async function loadCloudBackup() {
  try {
    const ready = requireFirebase();
    if (!ready.ok) return ready;
    if (!currentUser) return failure("Sign in first to load a cloud backup.");
    const snapshot = await getDoc(doc(db, "players", currentUser.uid));
    if (!snapshot.exists()) return failure("No cloud backup was found for this account yet.");
    const data = snapshot.data() || {};
    if (!data || typeof data !== "object") return failure("The cloud backup record could not be read safely. Local save was not changed.");
    if (!data.saveData || typeof data.saveData !== "object" || Array.isArray(data.saveData)) {
      return failure("The cloud backup is missing valid save data.");
    }
    return success({ saveData: data.saveData, version: data.version || "unknown", updatedAt: data.updatedAt || null });
  } catch (error) {
    return failure(error);
  }
}

function notifyAuthListeners() {
  const payload = { user: safeUser(currentUser), role: currentRole, roleReason: currentRoleReason, status: getFirebaseStatus() };
  authListeners.forEach((listener) => {
    try { listener(payload); } catch (error) { console.warn("Sector Drift Firebase listener failed", error); }
  });
}

function onFirebaseAuthChange(callback) {
  try {
    if (typeof callback !== "function") return () => {};
    authListeners.add(callback);
    callback({ user: safeUser(currentUser), role: currentRole, roleReason: currentRoleReason, status: getFirebaseStatus() });
    return () => authListeners.delete(callback);
  } catch (error) {
    console.warn("Sector Drift Firebase auth callback failed", error);
    return () => {};
  }
}

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  provider = new GoogleAuthProvider();
  onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    currentRole = "unknown";
    currentRoleReason = user ? "Loading role from users/{uid}..." : "Signed out; no role loaded.";
    if (user) await ensureUserProfile(user);
    notifyAuthListeners();
  }, (error) => {
    firebaseInitError = friendlyError(error);
    notifyAuthListeners();
  });
} catch (error) {
  firebaseInitError = friendlyError(error);
}

window.SectorDriftFirebase = {
  isFirebaseConfigured,
  getFirebaseStatus,
  signInWithGoogle,
  signOutOfFirebase,
  getCurrentFirebaseUser,
  getCurrentUserRole,
  ensureUserProfile,
  saveCloudBackup,
  loadCloudBackup,
  onFirebaseAuthChange
};

try {
  window.dispatchEvent(new Event("sectorDriftFirebaseReady"));
} catch (error) {
  console.warn("Sector Drift Firebase ready event failed", error);
}
