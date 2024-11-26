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
- Project cleanup (title, pages, files) in main application
- main application sends the api urls to the plugins (currently hardcoded in flahcards translation page)

### Storytelling plugin - Understanding
- Adjust AI plugin to be called storytelling and embedd as example the default chatwindow page
- user tells what the story is about
- Letting AI come up with story and writes out chapter after chapter
- User read each chapter silently
- User adds new words as flashcards
- (optionally) AI can read out the story then (speed adjustment)
- Example: https://chatgpt.com/c/674330a8-d3a4-8007-80cb-125c1bb9fd1a

### Storytelling plugin - pronounciation
- AI prints chapter
- user reads out chapter aloud and corrects him (use api i mentioned below)

### Storytelling plugin - Flexible story development
- Based on stories in rimori (user defines how story continues)
- user writes or tells how story should continue (using swedish)
- Can just be orally or just be written or switches, one-by-one like in Rimori

### Storytelling plugin - small enhancements
- Adjustment of difficulty
- Using words already learned in the flashcards
- Read articles by pasting url
- Have config parameter for AI backend(model,provider,triggerable frontend tools)
- Read whole books(ebook or pdf) with this plugin and continue whenever (AI can read out page and shows text in swedish, user simply continues)
- AI explains a topic based on a topic (eg swedish history or christmas traditions)

### Other enhancements
- Proper editor for flashcards (add page and toolbar)
- Listing of cards in a deck
- Import card from Anki


--------------------OLD IDEAS-------------------------------
### Stage 2 - AI story generator based on flahcards

- New plugin that is based on story feature of Rimori
- Initial possibility do define the topic of the story
- 10-20% are new words
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


### Additional ideas (notes)
Based on Anki text you have to write a diktat /text

Sidebar in browser to translate stuff and let it explain stuff for me.

isolated-vm - npm
https://www.npmjs.com/package/isolated-vm

GitHub - kantord/LibreLingo: 🐢 🌎 📚 a community-owned language-learning platform
https://github.com/kantord/LibreLingo

Plugin for SFI podd where it scraps the content and shows it as list where you can listen to every and then check it off. Ai sidebar to understand it better and right click to add it to flashcards

Add to dictionary
Right click explain
Right click find eselsbrücke
Right click translate are global plug-ins which plug-ins can configure to allow/forbid
Add decimated actions like prompt template for highlighted word
Based on service workers global actions can be added to context menu

Maybe backend api for general plugin data needed. Like when a plugin scraps als Sfi podcasts and adds them to the db.

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
