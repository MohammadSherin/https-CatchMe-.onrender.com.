# Catch Me - going global + App Store / Play Store

## 1. Put the game server online (needed for players in different countries)
1. Push this folder to a GitHub repo.
2. On Render.com: New > Blueprint > pick the repo (uses render.yaml). You get https://<name>.onrender.com.
   Use an always-on plan: free plans sleep and drop running games. Games live in server memory, so a restart ends them.
3. Open the URL on two phones, create a room, join with the code. The web version already works worldwide.

## 2. Build the real apps (Capacitor wraps the same game)
1. Edit `public/config.js` -> `window.SERVER_URL='https://<name>.onrender.com'`
2. `npm install` then `npm i -D @capacitor/cli @capacitor/core @capacitor/ios @capacitor/android @capacitor/assets`
3. `npx cap add ios` and `npx cap add android`, then `npx @capacitor/assets generate` (uses /assets) and `npx cap sync`
4. iOS: `npx cap open ios` (needs a Mac with Xcode, or a cloud builder such as Codemagic). Android: `npx cap open android` (Android Studio).

## 3. Store requirements (accounts are yours to create)
- Apple Developer Program (paid, yearly), Google Play Console (one-time fee).
- A public privacy-policy URL (the game stores display names in memory only), app screenshots, age rating, support email.
- Apple may reject apps that feel like a plain website. Mention real multiplayer gameplay in review notes; adding push notifications ("it's your turn") and haptics makes approval more likely.
- New personal Google Play accounts usually must run a closed test with several testers for ~2 weeks before production.
