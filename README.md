# New Frontier Bakery launch page

This project is ready for Vercel. Customer registrations are stored in Upstash Redis, the admin page is password protected, and a Telegram bot alerts your private group automatically.

## Required Vercel environment variables

- `ADMIN_PASSWORD`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

## Deploy

1. Upload this folder to a private GitHub repository.
2. In Vercel, choose **Add New > Project** and import the repository.
3. Leave Framework Preset as **Other** and deploy.
4. Open the project in Vercel, then select **Storage** or **Marketplace** and add **Upstash Redis**.
5. Connect the database to this project. Confirm that the two `UPSTASH_REDIS_REST_*` variables appear under **Settings > Environment Variables**.
6. Add the three private variables for the admin password and Telegram bot.
7. Redeploy from the **Deployments** page.

The pages will be:

- Landing page: `https://your-project.vercel.app`
- Admin dashboard: `https://your-project.vercel.app/admin`

## Telegram setup

1. Create a bot through `@BotFather`.
2. Add the bot to your Telegram notification group.
3. Allow the bot to send messages.
4. Send a message in the group.
5. Visit `https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates`.
6. Find the group `chat.id`, normally a negative number such as `-1001234567890`.

Never commit the bot token, Redis token, or admin password to GitHub. Add them only through Vercel's environment variable settings.

## Local-only server

`server.js` and `start.ps1` remain available for local testing. Vercel production uses the functions in the `api/` directory and Upstash storage.
