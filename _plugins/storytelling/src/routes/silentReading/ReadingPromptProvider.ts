
export interface Instructions {
    topic: string
    length: 5 | 8 | 15
    difficulty: number //1-10
}

export default function getSilentReadingPrompt(instructions: Instructions) {
    const { topic, length, difficulty } = instructions;

    if (difficulty === 1) {
        return `
    Write a short chapter of an adventure story in Swedish using extremely simple vocabulary and present tense. 
    The text should be suitable for beginners learning Swedish. Avoid complex grammar or idiomatic expressions. 
    Keep sentences short and direct. The chapter should focus on basic verbs, nouns, and adjectives. 
    The goal is to create engaging content that helps learners build vocabulary and understand basic sentence structure in Swedish.
    `+ getInstructions(topic, length);
    } else if (difficulty === 2 || true) { //TODO: add more difficulty levels
        return `
        Write a short chapter of an adventure story in Swedish using simple vocabulary. 
  The text should be suitable for beginners learning Swedish. Avoid idiomatic expressions. 
  The chapter should focus on basic verbs, nouns, and adjectives. 
  The goal is to create engaging content that helps learners build vocabulary and understand sentence structure in Swedish.
    `+ getInstructions(topic, length);
    }

    throw new Error("Invalid difficulty level");
}


function getInstructions(topic: string, length: number) {
    return `
    Include only the text of the chapter, without explanations or translations.
  
    Example of a chapter:
    \`\`\`
    # Chapter 1: The Forest
    The text of this chapter.
    \`\`\`
  
    The chapter should be written in Markdown format. Make use of italic for direct speech.
    The last chapter has the title: "Hur det slutar" and the final text of the story.
    Per message, only one chapter should be submitted.
    The story consists of ${length} chapers in total.
    After the last chapter, the story is considered finished.
  
    The story topic is: 
    ${topic}
    `;
}