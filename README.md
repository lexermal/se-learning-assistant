# Rimori

## Building

Run the following commands

```bash
docker compose up --build
```

The application is accessible via port 3000.

## Clone and run locally

1. You'll first need a Supabase project which can be made [via the Supabase dashboard](https://database.new)

2. Rename `.env.example` to `.env.local` and update the following:

   ```
   SUPABASE_URL=[INSERT SUPABASE PROJECT URL]
   SUPABASE_ANON_KEY=[INSERT SUPABASE PROJECT API ANON KEY]
   ```

   Both `SUPABASE_URL` and `SUPABASE_ANON_KEY` can be found in [your Supabase project's API settings](https://app.supabase.com/project/_/settings/api)

3. You can now run the Next.js local development server:

   ```bash
   npm run dev
   ```

   The starter kit should now be running on [localhost:3000](http://localhost:3000/).

## Release process

0. Check light theme and responsive design looks good
1. Update version in package.json
2. Update the license in the LICENSE file
3. Update the docker-compose.yml file with the new version
4. Run `docker compose up --build`
5. Run `docker push registry.rimori.se/language/rimori-ui:vX.X.X`
6. Run `docker push registry.rimori.se/language/rimori-plugins:vX.X.X`
7. Deploy Rimori to production

## Attributions

- Thanks to [modularsamples](https://freesound.org/s/310601/) for the Pomodoro sound!
- Thanks to [Flaticon](https://flaticon.com) for the plugin icons!