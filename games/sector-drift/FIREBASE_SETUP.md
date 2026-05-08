# Sector Drift Firebase Setup

These notes prepare optional Google login and cloud-save backup for classroom testing. LocalStorage remains the primary gameplay save, so the game should still be playable if Firebase is blocked or unavailable.

## 1. Firebase project

Use the Firebase project named **Sector Drift**.

## 2. Web app

Use the Firebase web app named **Sector Drift Web**.

## 3. GitHub Pages domain

The classroom site domain is:

- `mryoungworksheets.github.io`

## 4. Required Firebase services

Enable only the services needed for this phase:

- Authentication
- Cloud Firestore Standard edition

Analytics is not initialized by the game yet.

## 5. Authentication setup

1. Open Firebase Console for **Sector Drift**.
2. Go to **Authentication**.
3. Enable **Google** sign-in.
4. Set the public-facing project name to **Sector Drift**.
5. Set a support email.
6. Add `mryoungworksheets.github.io` to **Authorized Domains**.

## 6. Firestore setup

1. Create a **Cloud Firestore** database using **Standard edition**.
2. The Spark/no-cost plan is enough for early classroom testing.
3. Publish conservative security rules before using cloud saves with students.
4. Start from `firestore.rules.example` and review the rules before expanding beyond backup/load.

## 7. Teacher role setup

Teacher roles are prepared but no Teacher Dashboard is active yet.

1. Sign in once from the Sector Drift app.
2. Find your UID in Firebase Authentication.
3. In Firestore, open or create `users/{yourUid}`.
4. Set `role` to `"teacher"`.
5. Leave students as `"student"`.

The app only displays the known role in this phase. Future teacher tools must also be protected by Firebase Authentication and Firestore Security Rules.

## 8. Current limitations

- LocalStorage remains the primary gameplay save.
- Firebase cloud save is backup/load only.
- Login is optional and is not required to play.
- No multiplayer yet.
- No PvP yet.
- No shared sectors, shared planets, shared combat, or shared economy yet.
- Do not trust client-side gameplay data for future multiplayer.
- Cloud backup is not anti-cheat; it is only save portability and login readiness.
