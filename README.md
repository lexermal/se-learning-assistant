# se-learning-assistant

## Building

Run the following commands

```bash
cd _plugins
bash build.sh
docker compose up --build
```

The application is accessible via port 3000.

## Big features of below summarized and prioritized

- Light theme
- User setting db&api
- Language adjustment in Translator
- Public Deployment

- Pronounciation plugin
- Reading articles in Swedish
- Flexible storytelling
- Read whole ebook
- Discussions
- Text writing support

## Todo

- Project cleanup (title, pages, files) in main application
- Put plugins in own docker image to isolate them better (subdomain for plugins)
- apis should ckeck the cookies to ensure a logged in user accesses them

- light theme
- Translator: Keyboard shortcut for new search and add to flashcard
- Training: Show 4th category of words or add them to one of the other categories (cuttently the count is wrong)

## Roadmap ideas
- Setting: allow plugins to save and fetch settings (get cached in main application and automatically send to plugins on their load)
- Home screen: Widgets or statistics
- Todo app/strikes plugin: Setting one selves a goal and achiving it by ticking it off which gives strikes. Like 3 times reading per week. If not ticket off before midnight it resets strikes to 0, no excelption
- Support plugin: And asking questions about how world tree works. Bugs can also be reported
- Flashcards: Import card from Anki

### Swedish story translation

- Live discussion with AI to translate a text together.
- Using live api
- Person translates it sentence to sentence and AI supports by giving tips
- When user asks what fjällen is the ai explains it in English without mentioning the direct translation (umschreiben)

#### Reading articles in Swedish

- Scrap the web content by browsing page(copying all text, tab title and page name)
- Let chatgpt extract article by it telling which lines(from-till) belong to the article
- The copying converts it to markdown
- Let ai convert it to easy Swedish
- For now let it be working on pages where all text is wisible
- Alternatively the user can simply past in the whole page (primary usage for an mvp)
- Upload image and take that as topic, like the SFI sheets

#### Sidebar for notes

- At the right of the screen are all sidebars with icons visible
- When clicking on it notes can be added (markdown)
- Files can be selecteda and in them stuff gets written down

### Storytelling plugin - pronounciation

- AI prints chapter
- user reads out chapter aloud and corrects him (use api i mentioned below)
- It could be practical to listen to the words(own vs how it should sound) word splitup api from openai https://platform.openai.com/docs/api-reference/audio/createTranscription?lang=curl

### Storytelling plugin - Flexible story development

- Based on stories in rimori (user defines how story continues)
- user writes or tells how story should continue (using swedish)
- Can just be orally or just be written or switches, one-by-one like in Rimori

# Resources

- User can add links to other pages for useful tools to learn swedish
- Up/down voting system (-5 and its out)
- Have categories and descriptions and comments
- Having a wiki for useful info about learning swedish maybe librelingo

### Text writing support

- You have an assignment to write a text about a topic
- Then AI helps you with different things (word order, times, better words,....)
- Improvement rounds are happening after each other and people need to look up the word to find the right one (right time,...)
- How the UI looks like when the text is writtten I dont know
- Feedback ideas: https://moodle.folkuniversitetet.se/mod/page/view.php?id=611649&forceview=1

### Storytelling plugin - small enhancements

- Using words already learned in the flashcards
- Have config parameter for AI backend(model,provider,triggerable frontend tools)
- Read whole books(ebook or pdf) with this plugin and continue whenever (AI can read out page and shows text in swedish, user simply continues)
- AI explains a topic based on a topic (eg swedish history or christmas traditions)


--------------------OLD IDEAS-------------------------------

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


## Interesting links & packages

https://www.npmjs.com/package/anki-reader

isolated-vm - npm
https://www.npmjs.com/package/isolated-vm

GitHub - kantord/LibreLingo: 🐢 🌎 📚 a community-owned language-learning platform
https://github.com/kantord/LibreLingo

Maybe integrate Lingq https://www.lingq.com/apidocs/

Maybe implement a plugin similar to https://github.com/LuteOrg/lute-v3


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

## Attributions

- Thanks to [modularsamples](https://freesound.org/s/310601/) for the Pomodoro sound!
- Thanks to [Flaticon](https://flaticon.com) for the plugin icons!
