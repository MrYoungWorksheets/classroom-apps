# Sector Drift Firebase Setup

These notes prepare Google login, classroom role recognition, and cloud-save backup for Sector Drift. LocalStorage remains the gameplay save format, but the app now starts with a launch/login gate so students enter the cockpit through a signed-in classroom flow or an explicitly labeled Local Prototype Mode fallback.

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

## 7. How teacher role works

On first Google sign-in, the browser client creates `users/{uid}` with `role = "student"`. Later sign-ins preserve the existing role, so the client does **not** promote anyone to teacher.

The app reads `users/{uid}.role` and reports one of these values in the launch screen, Settings / Save, and Admin Panel diagnostics:

- `student`
- `teacher`
- `unknown`

`unknown` means the role field was missing, blank, or could not be loaded. The UI should show a friendly reason such as missing role data or insufficient permissions.

## 8. How to make yourself teacher

1. Open Sector Drift and sign in once with Google.
2. Go to Firebase Console.
3. Open **Firestore Database**.
4. Find `users/{uid}` for your account. If you are not sure which UID is yours, check Firebase Authentication or use the in-game Admin/Settings UID display after role setup.
5. Set the document field `role` to exactly `"teacher"`.
6. Refresh Sector Drift or use **Refresh Role / Auth Status** after signing in again.

Leave student accounts as `"student"`. Do not add any client-side button that changes a user to teacher.

## 9. Admin Panel status

The **Admin Panel** button appears only for a signed-in user whose loaded role is `teacher`. Students, signed-out users, and normal Local Prototype Mode users do not see it.

Functional teacher tools in this shell currently include current-browser/local-only actions plus existing cloud backup actions:

- Save Current Browser State to Cloud
- Load Cloud Save to Browser, with confirmation before replacing local browser save
- Repair / Normalize Current Save
- Export Save JSON
- Import Save JSON
- Soft Reset Current Browser Save
- Full Reset Current Browser Save
- View Current Account Record
- Refresh Role / Auth Status
- Show Firebase UID
- Give Credits
- Give Fuel
- Give Turns
- Repair Hull
- Fill Fighters
- Add Test Resources

These tools affect the currently open browser save unless the button explicitly uses the signed-in account cloud backup.

## 10. Placeholder-only Admin Panel tools

The Admin Panel intentionally includes future classroom/multiplayer placeholders that are **not active yet**, including:

- Student Roster
- Reset Student Save
- Restore Student Save
- Freeze PvP
- Enable / Disable Combat
- Enable / Disable Smuggled Inventory Events
- Enable / Disable Local Prototype Mode
- Start New Season
- End Current Season
- Reveal Current Sector
- Reveal All Sectors
- Clear Current Pirate
- Clear Warp Destination
- Return to Sector 1
- Add Smuggled Inventory
- Remove Smuggled Inventory
- Copy Diagnostics
- Open Student / Teacher Help
- List Future Classroom Features

Do not wire these to multiplayer or student records until teacher controls, rules, recovery tools, and classroom policies are ready.

## 11. Local Prototype Mode vs signed-in classroom mode

Signed-in classroom mode:

- Uses Google sign-in before entering the cockpit.
- Loads the account role from Firestore.
- Can save/load cloud backups at `players/{uid}`.
- Shows Admin Panel only for `teacher` role accounts.

Local Prototype Mode:

- Is clearly labeled as a prototype/dev fallback.
- Saves only in this browser's localStorage.
- Is not tied to a school account.
- Should be used for testing or when Firebase is unavailable.
- Does not show the Admin Panel unless a signed-in teacher role is also loaded.

Cloud saves are never loaded automatically on the launch screen. **Load Cloud Backup** always requires confirmation before replacing the local browser save.

## 12. Troubleshooting

### Signed in but role is unknown

Check `users/{uid}.role`. It must be a non-empty string such as `"student"` or `"teacher"`. If the app reports a permission error, review Firestore rules for reads to the signed-in user's own `users/{uid}` document.

### No `users/{uid}` document

Ask the user to sign out and sign in again. First sign-in should create `users/{uid}` with `role = "student"`. If it still does not appear, check Firestore write rules and the Firebase config loaded by `firebase-config.js`.

### No `players/{uid}` document

This is normal until the user clicks **Save Cloud Backup**. The `players/{uid}` document stores optional backup data, not the main localStorage save.

### Insufficient permissions

Confirm that Authentication is enabled, the domain is authorized, and Firestore rules allow the signed-in user to read/write their own `users/{uid}` and `players/{uid}` documents. Teacher-only future tools will need stricter rules before they touch student records.

### Teacher role not updating until refresh

Use **Refresh Role / Auth Status**, sign out/in again, or reload the page. Browser auth state can briefly show the previous role while Firestore finishes loading.

## 13. Current limitations

- LocalStorage remains the primary gameplay save.
- Firebase cloud save is backup/load only.
- Students should sign in before classroom play; Local Prototype Mode is a fallback/testing mode.
- No multiplayer yet.
- No PvP yet.
- No shared sectors, shared planets, shared combat, or shared economy yet.
- Do not trust client-side gameplay data for future multiplayer.
- Cloud backup is not anti-cheat; it is only save portability and login readiness.
