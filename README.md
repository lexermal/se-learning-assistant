# se-learning-assistant

## Building

Run the following commands

```bash
cd _plugins
bash build.sh
docker compose up --build
```
The application is accessible via port 3000.

## Todo

- Creating decks
- Project cleanup (title, pages, files)

### Stage 2 - AI story generator based on flahcards

- New plugin that is based on story feature of Rimori
- Initial possibility do define the topic of the story
- 10-20% are new words
- Rightclick allows adding work as flashcard or to look it up
- Sidebar do discuss with AI agent about gramatik and look up info about words
- Reading aloud with speed adjustment

### Stage 3 - Ansagen

- where audio plays or where it should be translated
- AI sidebar to support with tips
- AI validates result and gives tips on how to fix grammar challenge (from Rimori Story)

### Stage 4 - AI discussions

- From rimori discussions having discussions about different topics in swedish

### Stage 5 - Pronounciaation

- Read text and AI tells how well you did and helps to speak it out the right way
- Basically it shows the text, the user reads aloud and then the ai shows for every word how to make it better
- For local dialect the user could maybe change the phonetics of the sentence to add the withed dialect
- Let user play how it should sound and how the user spoke it out next to each other like "Heeeey" vs "Hej"
- https://thefluent.me/api/docs#score

## Core libraries

https://www.npmjs.com/package/anki-reader
https://www.npmjs.com/package/dictcc

## Notes

Maybe integrate Lingq https://www.lingq.com/apidocs/

Maybe implement a plugin similar to https://github.com/LuteOrg/lute-v3

A translation can be made with https://readloud.net/

Or it simply uses the unofficiel dict.cc client

https://github.com/naitian/dictcc-js

Getting the swedish phunetics: https://github.com/open-dict-data/ipa-dict/blob/master/data/sv.txt

Phunetics cheat sheet: https://upload.wikimedia.org/wikipedia/commons/8/8e/IPA_chart_2018.pdf

Another straight SV to something else translation db https://github.com/open-dict-data/wikidict-sv/blob/master/README.md

https://www.npmjs.com/package/dictcc

## Clone and run locally

1. You'll first need a Supabase project which can be made [via the Supabase dashboard](https://database.new)

2. Rename `.env.example` to `.env.local` and update the following:

   ```
   NEXT_PUBLIC_SUPABASE_URL=[INSERT SUPABASE PROJECT URL]
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[INSERT SUPABASE PROJECT API ANON KEY]
   ```

   Both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` can be found in [your Supabase project's API settings](https://app.supabase.com/project/_/settings/api)

3. You can now run the Next.js local development server:

   ```bash
   npm run dev
   ```

   The starter kit should now be running on [localhost:3000](http://localhost:3000/).
