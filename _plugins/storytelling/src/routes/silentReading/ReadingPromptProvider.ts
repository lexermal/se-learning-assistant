
export interface Instructions {
    topic: string
    length: 5 | 8 | 15
    difficulty: number //1-10
    perspective: string
}

export default function getSilentReadingPrompt(instructions: Instructions) {
    const { topic, length, difficulty, perspective } = instructions;

    const difficultyLabels = ["A1", "A2", "B1", "B2", "C1", "C2", "University"]

    if (difficulty === 1) {
        return `
    Write a short chapter of an story in Swedish using extremely simple vocabulary and present tense. 
    The text should be suitable for beginners learning Swedish. Avoid complex grammar or idiomatic expressions. 
    Keep sentences short and direct. The chapter should focus on basic verbs, nouns, and adjectives.
    The story should be told from the ${perspective}.
    The goal is to create engaging content that helps learners build vocabulary and understand basic sentence structure in Swedish.
    `+ getInstructions(topic, length);
    } else {
        return `
        Write a short chapter of an story in Swedish using the language level ${difficultyLabels[difficulty - 2]}. 
        The chapter should have between 200 and 250 words.
        The story should be told from the ${perspective}.
    `+ getInstructions(topic, length);
    }
}


function getInstructions(topic: string, length: number) {
    return `
    Include only the text of the chapter, without explanations or translations.
  
    The chapter should be written in Markdown format. Make use of italic for direct speech.
    Every chapter starts with a chapter number and title.
    The last chapter has the title: "Hur det slutar" and the final text of the story.
    Per message, only one chapter should be submitted.
    The story consists of ${length} chapers in total.
    After the last chapter, the story is considered finished.
  
    The story topic is: 
    ${topic}
    `;
}