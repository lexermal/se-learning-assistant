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
- main application sends the api urls to the plugins (currently hardcoded in flahcards translation page, silent-reading audioplayer)
- Put plugins in own docker image to isolate them better (subdomain for plugins)
- apis should ckeck the cookies to ensure a logged in user accesses them

#### SilentReading
- Loader before first chapter starts (is loading)
- Let the first chapter disappear when the next one is generated/displayed
- option to include most difficult words from flashcard from a deck (it is not the topic, rather just words being used somehow in ther)

#### Translator !!!!!
- chat does not work WTF
- Add tts to lookup
- make translator fixed (it is a toolbar that is needed to work in main plugin better
- make sure same card can not be added twice to same deck
- !!!!Verbs should be displayed in infinitive form (base form) in UI and when getting added as flashcard
- setting where it can be specified what info should be included in "add to flashcard" action (just verb or also additional info,...)

### Additional todo
- Saving preferences of user(db)
- maybe i really need a webworker plugin system too for headless actions like adding info to flashcards or reading info from db and providing it (eg storytelling wants to use most difficult flashcards of the newest deck)
- Attribute flaticons for their icons

#### Training !!!!!!
- Pomodoro 10-5-10-5-10
- !!!!!When deleting card it should hide the answer again
- after edit remove the focus of the edit button
- displaying info in next line in flashcards does not work (its still in same line)
- After fullscreen got triggered and left you need to press twice to enter fullscreen again
- underline flashcard numbers top left which type of card gets displayed

#### Reading articles in Swedish
- Scrap the web content by browsing page(copying all text, tab title and page name)
- Let chatgpt extract article by it telling which lines(from-till) belong to the article
- The copying converts it to markdown
- Let ai convert it to easy Swedish
- For now let it be working on pages where all text is wisible
- Alternatively the user can simply past in the whole page (primary usage for an mvp)

#### Sidebar for notes
- At the right of the screen are all sidebars with icons visible
- When clicking on it notes can be added (markdown)
- Files can be selecteda and in them stuff gets written down

#### chatgpt sidebar
- blank chat assistant with frontend action of adding something to flashcards/maybe notes
- one sidebar can trigger another sidebar. Every sidebar is own iframe
- icon showing which iframes are open
- or should i close them to save memory and power, i dont know yet


### Storytelling plugin - pronounciation
- AI prints chapter
- user reads out chapter aloud and corrects him (use api i mentioned below)
- It could be practical to listen to the words(own vs how it should sound) word splitup api from openai https://platform.openai.com/docs/api-reference/audio/createTranscription?lang=curl

### Storytelling plugin - Flexible story development
- Based on stories in rimori (user defines how story continues)
- user writes or tells how story should continue (using swedish)
- Can just be orally or just be written or switches, one-by-one like in Rimori

### Storytelling plugin - small enhancements
- Adjustment of difficulty
- Using words already learned in the flashcards
- Read articles by pasting url (or copied in text)
- Have config parameter for AI backend(model,provider,triggerable frontend tools)
- Read whole books(ebook or pdf) with this plugin and continue whenever (AI can read out page and shows text in swedish, user simply continues)
- AI explains a topic based on a topic (eg swedish history or christmas traditions)
- SilentReading: Story length is adjustable
- Flashcard training: Think about something that keyboard navigation is possible from the beginning for showing cards (setting focus on iframe does not work. Maybe via postmessage or button saying activate keyboard which does nothing but setting the focus on the iframe)

### Other enhancements
- Proper editor for flashcards (add page and toolbar) Drill.js
- Listing of cards in a deck
- Import card from Anki


--------------------OLD IDEAS-------------------------------
### Stage 2 - AI story generator based on flahcards

- 10-20% are new words

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

## Notes

Maybe integrate Lingq https://www.lingq.com/apidocs/

Maybe implement a plugin similar to https://github.com/LuteOrg/lute-v3

A translation can be made with https://readloud.net/

Getting the swedish phunetics: https://github.com/open-dict-data/ipa-dict/blob/master/data/sv.txt

Phunetics cheat sheet: https://upload.wikimedia.org/wikipedia/commons/8/8e/IPA_chart_2018.pdf

Another straight SV to something else translation db https://github.com/open-dict-data/wikidict-sv/blob/master/README.md

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
