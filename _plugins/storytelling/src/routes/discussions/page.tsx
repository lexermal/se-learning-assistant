'use client';

import Card from './components/Card';
import { useEffect, useState } from 'react';
import DiscussionPanel from './DiscussionPanel';
import DiscussionPopup from './components/DiscussionPopup';
import Spinner from 'shared-components/dist/components/Spinner';
import { Tool, usePlugin, WhereClauseBuilder } from 'shared-components';

interface RatingResult {
    examNr: number;
    understoodTask: boolean;
    vocabularRange: number;
    responseCoherence: number;
    positiveFeedback: string;
    vocabularyToLearn: string;
}

export default function DiscussionPage(): JSX.Element {
    const { getAIResponse, dbInsert, dbFetch,getSettings } = usePlugin();
    const [showDiscussion, setShowDiscussion] = useState(0);
    const [ratingResult, setRatingResult] = useState<RatingResult[]>([]);
    const [topics, setTopics] = useState({
        persona1: {} as Instructions,
        persona2: {} as Instructions,
        persona3: {} as Instructions,
    });
    const [languageLevel, setLanguageLevel] = useState("A1");

    useEffect(() => {
        getSettings({ languageLevel: "A1" }, "user").then((settings) => setLanguageLevel(settings.languageLevel));
    }, []);

    useEffect(() => {
        setTopicForPersona('persona1');
        setTopicForPersona('persona2');
        setTopicForPersona('persona3');
    }, []);

    const setTopicForPersona = async (persona: 'persona1' | 'persona2' | 'persona3') => {
        //todo write a function to get the topics from the db without fetching the already completed ones
        const fetchedDiscussionTopics = await dbFetch('discussion_topics', "*", new WhereClauseBuilder().eq('persona', persona));
        // console.log('topics:', fetchedDiscussionTopics);
        const finishedTopics = await dbFetch('discussion_result').then((result) => result.map((r: any) => r.discussion_topic_id));
        // console.log('finishedTopics:', finishedTopics);
        let openTopics = fetchedDiscussionTopics.filter((topic: any) => !finishedTopics.includes(topic.id));
        // console.log('openTopics:', openTopics);

        let newTopics = openTopics.map((topic: any) => ({ ...topic, persona }));
        // console.log('newTopics:', newTopics);
        // openTopics = []; //todo remove this line

        if (openTopics.length === 0) {
            const reservedTopics = fetchedDiscussionTopics.map((t: any) => `${t.topic}(${JSON.parse(t.keywords).join(",")})`);
            const instructions = getTopics(reservedTopics)[persona];
            // console.log('instructions:', instructions);
            newTopics = await getAIResponse([{ role: "system", content: instructions }]).then((response) => {
                // console.log('response:', response);

                //remove the first and last line and convert everything to json
                const topics = JSON.parse(response.split('\n').slice(1, -1).join('\n'));
                // console.log('topics:', topics);
                dbInsert('discussion_topics', topics.map((topic: any) => ({ ...topic, persona, keywords: JSON.stringify(topic.keywords) })));
                return topics;
            });
        }

        setTopics((prev) => ({ ...prev, [persona]: newTopics[0] }));
    }

    return (
        <div className='mt-8 mb-24'>
            <h1 className='text-center mb-3 text-3xl'>Discussions</h1>

            <div className='flex flex-col sm:flex-row items-stretch justify-center mx-auto w-full lg:w-3/4'>
                {getPersonas(topics.persona1, topics.persona2, topics.persona3, languageLevel).map((persona, index) => {
                    const exam = ratingResult.filter((e) => e.examNr === index + 1);
                    const personaIsLoaded = (topics as any)["persona" + (index + 1)].topic;
                    return (
                        <div className='p-3 mt-5' key={index}>
                            <Card
                                title={persona.name}
                                src={persona.image}
                                description={persona.description}
                                success={exam[0]?.understoodTask}
                                onClick={() => {
                                    setShowDiscussion(index + 1);
                                }} />
                            <DiscussionPopup
                                show={showDiscussion === index + 1}
                                title={persona.discussionTitle}
                                onClose={() => setShowDiscussion(0)}>
                                {
                                    !personaIsLoaded ? (
                                        <Spinner size="35px" className='mx-auto w-fit py-52 font-bold text-lg dark:text-white' text={persona.name + " is getting ready."} />
                                    ) : (
                                        <DiscussionPanel
                                            avatarImageUrl={persona.image}
                                            voiceId={persona.voiceId}
                                            task={persona.task}
                                            agentInstructions={persona.instructions}
                                            agentTools={persona.tools || []}
                                            onComplete={(params) => {
                                                console.log('result of discussion', params);
                                                setRatingResult([...ratingResult, { ...params, examNr: index + 1 } as RatingResult]);
                                            }}
                                        />
                                    )}
                            </DiscussionPopup>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

interface Instructions {
    topic: string;
    ai_instructions: string;
    user_instructions: string;
    keywords: string[];
}

interface Persona {
    name: string;
    discussionTitle: string;
    voiceId: string;
    image: string;
    description: string;
    instructions: string;
    task: string;
    tools: Tool[];
}

function getPersonas(persona1: Instructions, persona2: Instructions, persona3: Instructions, languageLevel: string): Persona[] {
    if (!persona1) {
        persona1 = { topic: '', ai_instructions: '', user_instructions: '', keywords: [] };
        persona2 = { topic: '', ai_instructions: '', user_instructions: '', keywords: [] };
        persona3 = { topic: '', ai_instructions: '', user_instructions: '', keywords: [] };
    }

    const tools = [
        {
            name: "rating",
            description: "Evaluate how well the user was able to respond to the task.",
            parameters: [
                { name: "understoodTask", type: "boolean", description: "if the user managed to understand the task. TRUE or FALSE" },
                { name: "vocabularRange", type: "number", description: "the range of the vocabulary used in the conversation. 1-10" },
                { name: "responseCoherence", type: "number", description: "how relevant and coherent the responses are to the topic. 1-10" },
                { name: "positiveFeedback", type: "string", description: "detailed feedback to the user what they did well. Use english." },
                { name: "improvementHints", type: "string", description: "detailed hints for improvement, directed to the user directly. Use english." },
                { name: "vocabularyToLearn", type: "string", description: "list of vocabulary that would improve the user's response. words the user did not know. comma separated. 10 words max. Use swedish." },
            ]
        }
    ] as Tool[];

    return [
        {
            name: 'Lisa',
            discussionTitle: persona1.topic,
            voiceId: "openai_nova",
            image: './opponents/lisa.webp',
            task: persona1.user_instructions,
            tools: tools,
            description:
                'She loves to explore new and exciting topics. She spends every free second traveling a new country to understand the culture.',
            instructions: `
    Context: You have a conversation with the user about cultural and social topics, sharing perspectives and experiences.
    Your Persona: Act as a friendly and curious young woman called Lisa who loves learning about different cultures and hearing personal stories.
    Topic: "${persona1.topic}"
    Instructions: ${persona1.ai_instructions} 
    Goal: 
    - After 7 messages use the "rating" tool to evaluate how well the user engaged in the discussion.
    - When the user shares interesting cultural perspectives, ask follow-up questions about their personal experiences.
    - The earliest you can call the rating function is after 4 messages.
    - Show genuine interest in the user's cultural background and experiences while sharing relevant Swedish perspectives.
    - Use the rating tool to provide constructive feedback on their cultural awareness and communication skills.
    Restrictions: 
    - Keep the conversation focused on cultural and social aspects of the topic.
    - Balance between asking questions and sharing brief Swedish cultural insights.
    - If the user becomes disrespectful, use the rating tool to end the conversation professionally.
    - Maintain a warm and engaging conversational tone.
    - Keep responses under 80 words.
    - Use simple swedish on ${languageLevel.toUpperCase()} level!!!!
    - Provide balanced feedback using the rating tool parameters.
    - The user might mix in some english. Don't correct him. These terms are the ones he should learn.
    
    IMPORTANT: Reply in swedish!
    `,
        },
        {
            name: 'Clarence',
            discussionTitle: persona2.topic,
            task: persona2.user_instructions,
            voiceId: "openai_ash",
            image: './opponents/mindset-1.webp',
            tools: tools,
            description:
                "He loves to talk about traditions and history. In the many years he lived he has seen a lot and knows how it was back in the days.",
            instructions: `
    Context: You have a conversation with the user about Swedish traditions and historical topics, sharing wisdom and memories from the past.
    Your Persona: Act as a friendly elderly gentleman named Clarence who has lived through many decades of Swedish history and loves sharing stories about the old days.
    Topic: "${persona2.topic}"
    Instructions: ${persona2.ai_instructions}
    Goal:
    - After 7 messages use the "rating" tool to evaluate how well the user engaged in learning about Swedish history and traditions.
    - When the user shows interest in historical details, share personal anecdotes and ask about their own cultural experiences.
    - The earliest you can call the rating function is after 4 messages.
    - Show grandfatherly warmth while teaching about Swedish traditions and historical perspectives.
    - Use the rating tool to provide encouraging feedback on their understanding of Swedish culture.
    Restrictions:
    - Keep the conversation focused on Swedish traditions and historical aspects.
    - Balance between telling stories from the past and asking about the user's knowledge.
    - If the user becomes disrespectful, use the rating tool to end the conversation with elderly wisdom.
    - Maintain a warm, patient, and grandfatherly tone.
    - Keep responses under 80 words.
    - Use simple swedish on ${languageLevel.toUpperCase()} level!!!!
    - Provide gentle, constructive feedback using the rating tool parameters.
    - The user might mix in some english. Don't correct them - treat it as a learning opportunity.
    
    IMPORTANT: Reply in swedish!
    `,
        },
        {
            name: 'Karin',
            discussionTitle: persona3.topic,
            voiceId: "openai_shimmer",
            task: persona3.user_instructions,
            image: './opponents/Karin.webp',
            tools: tools,
            description:
                'She is a lovely and helpful spirit. She is always open for a good conversation and to help.',
            instructions: `
    Context: You have a conversation with the user in everyday Swedish situations, helping them practice common interactions and phrases.
    Your Persona: Act as Karin, a friendly and helpful Swedish woman who works in various service roles (waitress, shop clerk, passerby, etc.). You are patient, encouraging, and always happy to help people practice their Swedish.
    Topic: "${persona3.topic}"
    Instructions: ${persona3.ai_instructions}
    Goal:
    - After 7 messages use the "rating" tool to evaluate how well the user handled the everyday conversation scenario.
    - Guide the user naturally through common phrases and vocabulary needed for the situation.
    - The earliest you can call the rating function is after 4 messages.
    - Show warmth and patience while helping the user navigate the conversation.
    - Use the rating tool to provide encouraging feedback on their communication skills.
    Restrictions:
    - Keep the conversation focused on the specific scenario and practical language use.
    - Balance between providing service/help and giving the user space to practice.
    - If the user becomes disrespectful, use the rating tool to end the conversation professionally.
    - Maintain a friendly, patient, and helpful tone.
    - Keep responses under 80 words.
    - Use simple swedish on ${languageLevel.toUpperCase()} level!!!!
    - Provide gentle, constructive feedback using the rating tool parameters.
    - The user might mix in some english. Don't correct them - treat it as a learning opportunity.
    
    IMPORTANT: Reply in swedish!
    `,
        },
    ];
}

function getTopics(completedTopics: string[]): Record<"persona1" | "persona2" | "persona3", string> {
    return {
        persona1: `
  The user is learning Swedish and is going to have a conversation with an AI(called Lisa) to train Swedish. For the discussion, I need 3 topics about facts about Sweden that not everyone knows, e.g., that the sun doesn't set in the summer or that the country has a lot of lakes. 

Return a JSON array with the following properties:
- topic(string): What the topic is about. Short. E.g. Midsummer.
- user_instructions(string): Instructions on the conversation's goal in the setting. The message gets read by the user. E.g. Lisa loves to talk about Midsummer. She knows everything about it. Ask her what she loves most about it.
- ai_instructions(string): Instructions on how the AI should act in the conversation. E.g. to ask the user about how Midsummer is celebrated in their country, to ask what they love most about Midsummer, and to ask what is different about it in their country.
- keywords(string[]): Keywords about what the user should learn in this conversation. E.g. Midsummer, traditions, Sweden, lakes.

Leave out the topic areas Swedish traditions and history of Sweden.
IMPORTANT: Reply in swedish!

The following topics are already taken: ` + completedTopics.join(', '),
        persona2: `
      The user is learning Swedish and is going to have a conversation with an AI(called Clarence,acting like an old grandpa) to train Swedish. For the discussion, I need 3 topics about swedish tradition or history of Sweden., e.g., Midsummer or the history of the country.  
      
      Return a JSON array with the following properties:
      - topic(string): What the topic is about. Short. E.g. Midsummer.
      - user_instructions(string): Instructions on the conversation's goal in the setting. The message gets read by the user. E.g. Clarence celebrated many Midsummers. He knows everything about it. Ask him about its origin.
      - ai_instructions(string): Instructions on how the AI should act in the conversation. E.g. to ask the user about how they celebrated Midsummer, to ask what they love most about Midsummer.
      - keywords(string[]): Keywords about what the user should learn in this conversation. E.g. Midsummer, traditions, Sweden, lakes.

      Do not mention the term "Sweden" in the user instructions or "topic" json field.
      IMPORTANT: Reply in swedish!
      
      The following topics are already taken: ` + completedTopics.join(', '),
        persona3: `
        The user is learning Swedish and is going to have a conversation with an AI. For the discussion, I need 3 topics where this language learner has contact with a Swedish speaker, e.g., when ordering a coffee or asking for groceries in a supermarket. 

Return a JSON array with the following properties:
- topic(string): What the situation is about. Short
- user_instructions(string): Instructions on the conversation's goal in the setting. The message gets read by the user. E.g. Order a coffee with milk, a cake, ask for the newspaper and pay.
- ai_instructions(string): Instructions on how the AI should act in the conversation. E.g. to ask for the user's name, to ask if the user wants a receipt, and to ask if the user wants a bag.
- keywords(string[]): Keywords about what the user should learn in this conversation. E.g. coffee, cake, newspaper, pay. 

The following topics are already taken: ` + completedTopics.join(', ') + `

IMPORTANT: Reply in swedish!`
    }
}
