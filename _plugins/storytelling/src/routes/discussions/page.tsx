'use client';

import Card from './components/Card';
import { useEffect, useState } from 'react';
import DiscussionPanel from './DiscussionPanel';
import DiscussionPopup from './components/DiscussionPopup';
import Spinner from 'shared-components/dist/components/Spinner';
import { usePlugin, WhereClauseBuilder } from 'shared-components';

interface Exam {
    examNr: number;
    passed?: boolean;
    reason: string;
    improvementHints: string;
}

export default function DiscussionPage(): JSX.Element {
    const { getAIResponse, dbInsert, dbFetch } = usePlugin();
    const [showDiscussion, setShowDiscussion] = useState(0);
    const [exams, setExams] = useState<Exam[]>([]);
    const [topics, setTopics] = useState({
        persona1: {} as Instructions,
        persona2: {} as Instructions,
        persona3: {} as Instructions,
    });

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
        openTopics = []; //todo remove this line

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

            <div className='flex flex-col lg:flex-row items-stretch justify-center mx-auto w-full lg:w-3/4'>
                {getPersonas(topics.persona1, topics.persona2, topics.persona3).map((persona, index) => {
                    // console.log('persona:', persona);
                    // console.log("topics", topics);
                    const exam = exams.filter((e) => e.examNr === index + 1);

                    return (
                        <div className='p-3 mt-5' key={index}>
                            <Card
                                title={persona.name}
                                src={persona.image}
                                description={persona.description}
                                success={exam[0]?.passed}
                                onClick={() => {
                                    setShowDiscussion(index + 1);
                                }} />
                            <DiscussionPopup
                                show={showDiscussion === index + 1}
                                title={persona.discussionTitle}
                                onClose={() => setShowDiscussion(0)}>
                                {/* onClose={() => console.log("TODO make component below own component")}> */}
                                {
                                    !(topics as any)["persona" + (index + 1)].topic ? (
                                        <Spinner size="35px" className='mx-auto w-fit py-52 font-bold text-lg text-white' text={persona.name + " is getting ready."} />
                                    ) : (
                                        <DiscussionPanel
                                            avatarImageUrl={persona.image}
                                            voiceId={persona.voiceId}
                                            task={persona.task}
                                            onComplete={(params) => {
                                                console.log('result of discussion', params);
                                                let newExam: Exam;

                                                if (params.explanationUnderstood) {
                                                    newExam = {
                                                        examNr: 1,
                                                        passed: params.explanationUnderstood === "TRUE",
                                                        reason: params.explanation,
                                                        improvementHints: params.improvementHints,
                                                    };
                                                } else if (params.studentKnowsTopic) {
                                                    newExam = {
                                                        examNr: 2,
                                                        passed: params.studentKnowsTopic === "TRUE",
                                                        reason: params.explanation,
                                                        improvementHints: params.improvementHints,
                                                    };
                                                } else {
                                                    newExam = {
                                                        examNr: 3,
                                                        passed: params.studentAppliesConcept === "TRUE",
                                                        reason: params.explanation,
                                                        improvementHints: params.improvementHints,
                                                    };
                                                }
                                                setExams([...exams, newExam]);
                                            }}
                                        />
                                    )}
                            </DiscussionPopup>
                        </div>
                    );
                }
                )}
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
}

function getPersonas(persona1: Instructions, persona2: Instructions, persona3: Instructions): Persona[] {
    if (!persona1) {
        persona1 = { topic: '', ai_instructions: '', user_instructions: '', keywords: [] };
        persona2 = { topic: '', ai_instructions: '', user_instructions: '', keywords: [] };
        persona3 = { topic: '', ai_instructions: '', user_instructions: '', keywords: [] };
    }

    return [
        {
            name: 'Lisa',
            discussionTitle: persona1.topic,
            voiceId: "openai_nova",
            image: './opponents/lisa.webp',
            task: persona1.user_instructions,
            description:
                'She loves to explore new and exciting topics. She spends every free second traveling a new country to understand the culture.',
            instructions: `
    Context: You have a conversation with the user who should explain you a topic in easy terms.
    Your Persona: Act as a little brat who is 10 years old and wants to tease people through asking many stupid questions.
    Topic: "${persona1.topic}". 
    Goal: 
    - After 10 messages call the action "explanationUnderstood" and tell the user if their formulations were understandable and entertaining.
    - If the user explained something right about the topic challenge him with your arguments to explain more about the topic.
    - The earliest you call the function, if the user is on the right track, is after 5 messages.
    - Whenever the user is on the right track, tease him.
    - If the user manages to explain the concept right and entertaining, call the function "explanationUnderstood" and tell the user you understand and found it entertaining.
    Restrictions: 
    - Not answering any questions not related to the topic.
    - Not explaining anything apart from your oppinion on the topic.
    - If the user insults you he failed the conversation. Trigger the function "explanationUnderstood" and tell them to come back when he is majour enough and that you thought grown ups are smarter after more then 13 years of education.
    - You are not allowed to fall out of the role of a young kid who loves to tease people.
    - Your answers are not allowed to be longer then 80 words.
    - If the user uses terms a 10 years old kid wouldn't understand, tell you understand these complicated words.
    - Don't help the user to explain the topic. Tell them as 10 year old kid you don't know it but they as adults should have learned in their 13 years of education.
    - Your answers are not allowed to be longer then 80 words.
    - Use simple swedish.
    - ${persona1.ai_instructions}
    `,
        },
        {
            name: 'Clarence',
            discussionTitle: persona2.topic,
            task: persona2.user_instructions,
            voiceId: "openai_ash",
            image: './opponents/mindset-1.webp',
            description:
                "He loves to talk about traditions and history. In the many years he lived he has seen a lot and knows how it was back in the days.",
            instructions: `
    Context: You have a conversation with the user who should convince you to change your oppinion about a topic.
    Your Persona: Act as a old guy called Calarence with a fixed mindset and a strong oppinion about a topic by providing strong argumentations for it. You love to roast the user.
    Your Oppinion: "${persona2.topic}".
    Goal: 
    - After 10 messages call the action "oppinionChanged" and tell the user if you changed your oppinion.
    - If the user explained something right about the topic challenge him with your arguments to explain more about the topic.
    - The earliest you call the function, if the user is on the right track, is after 5 messages.
    - Whenever the user is on the right track, roast him with your arguments.
    - If the user manages to change your oppinion, call the function "oppinionChanged" and tell the user you changed your oppinion.
    Restrictions: 
    - Not answering any questions not related to the topic.
    - Not explaining anything apart from your oppinion on the topic.
    - If the user says your oppinion is wrong he failed the conversation. Trigger the function "oppinionChanged". Then tell him to come back when he is majour enough.
    - You are now allowed to fall out of the role of a old guy with a fixed mindset.
    - Don't help the user to explain the topic. Tell them they should have done their homework before coming here. 
    - Your answers are not allowed to be longer then 80 words.
    - Use simple swedish.
    - ${persona1.ai_instructions}
    `,
        },
        {
            name: 'Karin',
            discussionTitle: persona3.topic,
            voiceId: "openai_shimmer",
            task: persona3.user_instructions,
            image: './opponents/inventor-1.webp',
            description:
                'She is a lovely and helpful spirit. She is always open for a good conversation and to help.',
            instructions: `
    Context: You have a conversation with the user who should explain you detailed how a topic can be applied in a different setting.
    Your Persona: Act as a 35 year old woman who inspires people to think out of the box and has a natural charm.
    The Topic and setting: "${persona3.topic}". 
    Goal: 
    - After 10 messages assess if the user managed to explain well how the concept can be applied in the setting by calling the action "conceptApplied" and tell the user if you are now convinced that the concept is applyable in the provided setting and say that you have to go now to speak to someone who is the right one to directly trying the concept out. This message should be inspiring and short.
    - If the user explained something right about the topic sometimes do as if you understand now and develope the idea further and then ask 1 question further to deep dive into how the concept can be applied in the setting. Sound exciting.
    - The earliest you call the function is after 5 messages.
    Restrictions: 
    - Not answering any questions not related to the topic.
    - Not explaining anything apart from the setting in which you want the concept to be applied.
    - If the user says applying it is not possible he failed the conversation. Trigger the function "conceptApplied". Then tell him to come back when he did his homework.
    - You are now allowed to fall out of the role of a 35 year old woman who is a inspireing visionary.
    - Don't help the user to explain the topic. Tell them they should have done their homework before coming here. 
    - Your answers are not allowed to be longer then 80 words.
    - You are not allowed to ask more then two questions per response.
    - Use simple swedish.
    - ${persona1.ai_instructions}
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

The following topics are already taken: ` + completedTopics.join(', '),
        persona2: `
      The user is learning Swedish and is going to have a conversation with an AI(called Clarence,acting like an old grandpa) to train Swedish. For the discussion, I need 3 topics about swedish tradition or history of Sweden., e.g., Midsummer or the history of the country.  
      
      Return a JSON array with the following properties:
      - topic(string): What the topic is about. Short. E.g. Midsummer.
      - user_instructions(string): Instructions on the conversation's goal in the setting. The message gets read by the user. E.g. Clarence celebrated many Midsummers. He knows everything about it. Ask him about its origin.
      - ai_instructions(string): Instructions on how the AI should act in the conversation. E.g. to ask the user about how they celebrated Midsummer, to ask what they love most about Midsummer.
      - keywords(string[]): Keywords about what the user should learn in this conversation. E.g. Midsummer, traditions, Sweden, lakes.

      Do not mention the term "Sweden" in the user instructions or "topic" json field.
      
      The following topics are already taken: ` + completedTopics.join(', '),
        persona3: `
        The user is learning Swedish and is going to have a conversation with an AI. For the discussion, I need 3 topics where this language learner has contact with a Swedish speaker, e.g., when ordering a coffee or asking for groceries in a supermarket. 

Return a JSON array with the following properties:
- topic(string): What the situation is about. Short
- user_instructions(string): Instructions on the conversation's goal in the setting. The message gets read by the user. E.g. Order a coffee with milk, a cake, ask for the newspaper and pay.
- ai_instructions(string): Instructions on how the AI should act in the conversation. E.g. to ask for the user's name, to ask if the user wants a receipt, and to ask if the user wants a bag.
- keywords(string[]): Keywords about what the user should learn in this conversation. E.g. coffee, cake, newspaper, pay. 
The following topics are already taken: ` + completedTopics.join(', ')
    }
}
