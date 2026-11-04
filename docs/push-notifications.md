# Push notifications: setup

The code is in place. These are the steps that need your accounts. Do them in order.

## 1. Create the tables (Supabase)

Open the Supabase dashboard, go to SQL Editor, paste the contents of
`server/sql/push_notifications.sql`, and run it. It is safe to run twice.

The file assumes `profiles.id` is a `uuid`. If that line fails with a type error, tell me the column
type and I will adjust the two `profile` columns.

## 2. Create the push keys

From the `server` folder:

```
npx web-push generate-vapid-keys
```

It prints a public key and a private key. The private key is a secret: do not commit it, paste it
into chat, or put it anywhere except Railway's variables.

## 3. Add variables to the web service (Railway)

On the existing web service, add:

| Variable            | Value                                                                           |
| ------------------- | ------------------------------------------------------------------------------- |
| `VAPID_PUBLIC_KEY`  | the public key                                                                  |
| `VAPID_PRIVATE_KEY` | the private key                                                                 |
| `VAPID_SUBJECT`     | `mailto:` plus an email address you check, for example `mailto:you@example.com` |

Then deploy this code. Nothing is sent until the cron service below exists, so this is safe.

## 4. Check it from your own machine first (optional)

With a local `server/.env` that has the Supabase variables, this prints what would be sent and sends
nothing:

```
npm run notify:dry --prefix server
```

## 5. Create the cron service (Railway)

1. In the same Railway project, add a new service from the same GitHub repo.
2. Settings, Build: use the same build command as the web service (`npm run build`).
3. Settings, Deploy, Custom Start Command: `node server/dist/jobs/notify.js`
4. Settings, Cron Schedule: `*/5 * * * *` runs every 5 minutes all day. To run only while games are
   on (about noon to midnight Eastern, and Railway uses UTC), use `*/5 16-23,0-4 * * *`.
5. Variables: give it the same variables as the web service (all the `SUPABASE_*` ones and the three
   `VAPID_*` ones). Railway's shared variables or variable references avoid copying them.

The job stops itself after at most 60 seconds, so it cannot keep running and billing.

## 6. Turn it on and try it

Notifications can only be turned on from the deployed https site, not from `http://localhost`
on a phone.

- **Android or desktop Chrome:** log in, use the Notifications section in the sidebar profile form,
  tap "Turn on notifications", allow the prompt, then "Send a test".
- **iPhone:** open the site in Safari, tap Share, then Add to Home Screen. Open Hockey Pockey from the
  new icon (not Safari), log in, then turn notifications on and send a test. It must be iOS 16.4 or
  newer.

To try a real result without waiting for a game: in Supabase, edit one row of the `games` table for a
game involving two teams owned by different people in a draft that is `in_play`. Set `gameStateId`
to `7`, set the scores, and set `easternStartTime` to within the last few hours (Eastern clock time).
Then run the cron service once (Railway has a Run Now option on the service). You should get one
notification, and running it again should send nothing.

## What it will and will not do

- Only games that started in the last 6 hours are announced, so turning it on will not announce old
  results.
- Only drafts with status `in_play` send notifications.
- A game where one person owns both teams is skipped.
- Logging out removes that device's subscription, so a shared phone stops getting your messages.
  Log in and turn notifications on again to resume.
- If the private key ever leaks, generate new keys, update the variables, and everyone turns
  notifications on again.
