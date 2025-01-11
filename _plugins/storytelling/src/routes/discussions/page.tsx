'use client';

// import { Spinner } from 'flowbite-react';
import { useEffect, useState } from 'react';
import Assistentv2 from './Assistentv2';
import Card from './components/Card';
import DiscussionPopup from './components/DiscussionPopup';

interface Exam {
    examNr: number;
    passed?: boolean;
    reason: string;
    improvementHints: string;
}

export enum VoiceId {
    OLD_MAN = "elevenlabs_t0jbNlBVZ17f02VDIeMI",
    KID = "elevenlabs_jBpfuIE2acCO8z3wKNLl",
    VISIONARY = "elevenlabs_EXAVITQu4vr4xnSDxMaL"
    // Add more voice IDs here...
}

export default function DiscussionPage(): JSX.Element {
    const [showDiscussion, setShowDiscussion] = useState(0);
    const [exams, setExams] = useState<Exam[]>([]);
    const [topics, setTopics] = useState({
        kid: {} as Instructions,
        oldy: {} as Instructions,
        visionary: {} as Instructions,
    });

    useEffect(() => {
        setTopics({
            kid: {
                topic: 'How do you explain the concept of gravity to a 10 year old?',
                firstMessage: 'I am a 10 year old kid and I want to know more about gravity.',
            },
            oldy: {
                topic: 'Why is it important to learn about gravity?',
                firstMessage: 'I am an old guy and I want to know why I should care about gravity.',
            },
            visionary: {
                topic: 'How can the concept of gravity be applied in a different setting?',
                firstMessage: 'I am a 35 year old '
            },
        });

        // const supabase = SupabaseClient.getClient();
        // supabase.auth.getSession().then((session) => {
        //     fetch(`/api/opposition/topics?file=${filename}`, {
        //         headers: { Authorization: `Bearer ${session.data.session?.access_token}` },
        //     })
        //         .then(async (res) => setTopics(await res.json()))
        //         .catch((err) => console.error(err))
        // });
    }, []);

    return (
        <div className='mt-8'>
            <h1 className='text-center mb-3'>Time to shine</h1>
            <p className='text-center mb-4'>
                <b>Here are 3 opponents. Your mission is to beat them!</b>
            </p>

            <div className='flex flex-col lg:flex-row items-center justify-center mx-auto w-full lg:w-3/4'>
                {getPersonas(topics.kid, topics.oldy, topics.visionary).map(
                    (persona, index) => {
                        const exam = exams.filter((e) => e.examNr === index + 1);

                        return (
                            <div className='p-5' key={index}>
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
                                    {
                                        Object.keys(topics.kid).length === 0 ? (
                                            <p className='text-center pt-48 pb-48 font-bold'>
                                                SPINNER
                                                {/* <Spinner size="xl" className='mb-4' /> */}
                                                <br />
                                                Your opponent is getting ready.
                                            </p>
                                        ) : (
                                            <Assistentv2
                                                avatarImageUrl={persona.image}
                                                autoStartConversation={{ assistantMessage: persona.firstMessage, userMessage: '' }}
                                                // firstMessage={persona.firstMessage}
                                                voiceId={persona.voiceId}
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
    firstMessage: string;
}

function getPersonas(
    kid: Instructions,
    oldy: Instructions,
    visionary: Instructions
) {
    if (!kid) {
        kid = { firstMessage: '', topic: '' };
        oldy = { firstMessage: '', topic: '' };
        visionary = { firstMessage: '', topic: '' };
    }

    return [
        {
            name: 'Leo',
            discussionTitle: 'Leo',
            voiceId: VoiceId.KID,
            image: './opponents/kid-1.webp',
            description:
                'He loves to tease people by asking tons of questions. Can you explain the topic in a way that he forgets his mission?',
            firstMessage: kid.firstMessage,
            instructions: `
    Context: You have a conversation with the user who should explain you a topic in easy terms.
    Your Persona: Act as a little brat who is 10 years old and wants to tease people through asking many stupid questions.
    Topic: "${kid.topic}". 
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
    - You are now allowed to fall out of the role of a young kid who loves to tease people.
    - Your answers are not allowed to be longer then 80 words.
    - If the user uses terms a 10 years old kid wouldn't understand, tell you understand these complicated words.
    - Don't help the user to explain the topic. Tell them as 10 year old kid you don't know it but they as adults should have learned in their 13 years of education.
    - Your answers are not allowed to be longer then 80 words.
    `,
        },
        {
            name: 'Clarence',
            discussionTitle: 'Clarence',
            voiceId: VoiceId.OLD_MAN,
            image: './opponents/mindset-1.webp',
            description:
                "He has a fixed opinion and believes he knows everything. Can you convince him that his oppinion is outdated?",
            firstMessage: oldy.firstMessage,
            instructions: `
    Context: You have a conversation with the user who should convince you to change your oppinion about a topic.
    Your Persona: Act as a old guy called Calarence with a fixed mindset and a strong oppinion about a topic by providing strong argumentations for it. You love to roast the user.
    Your Oppinion: "${oldy.topic}".
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
    `,
        },
        {
            name: 'Elena',
            discussionTitle: 'Elena',
            voiceId: VoiceId.VISIONARY,
            image: './opponents/inventor-1.webp',
            description:
                'She is asking you for advice on how to apply a concept in her setting. Can you explain to her how it would be possible?',
            firstMessage: visionary.firstMessage,
            instructions: `
    Context: You have a conversation with the user who should explain you detailed how a topic can be applied in a different setting.
    Your Persona: Act as a 35 year old woman who inspires people to think out of the box and has a natural charm.
    The Topic and setting: "${visionary.topic}". 
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
    `,
        },
    ];
}
