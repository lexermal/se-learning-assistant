export function getStoryInspiration(): string {
    const genres = [
        'A horror',
        'An adventure',
        'A mystery',
        'A romance',
        'A science fiction',
        'A fantasy',
        'A thriller',
        'A comedy',
        'A historical fiction',
        'A memoir',
        'A crime',
        'A drama',
        'A biography',
        'A historical',
        'A true'
    ];
    const actors = [
        'an old man with gray hair and a hat',
        'a young woman with a secret',
        'a fearless explorer',
        'a cunning detective',
        'a brave warrior',
        'a time-traveling scientist',
        'a magical creature',
        'an AI robot',
        'a rebel leader',
        'a pirate captain',
        'a renowned scientist',
        'a famous athlete',
        'a dedicated teacher',
        'a courageous firefighter',
        'a skilled musician'
    ];
    const subordinates = [
        'explores with a ghost',
        'teams up with a mysterious stranger',
        'investigates a hidden realm',
        'uncovers ancient secrets',
        'battles unseen forces',
        'searches for a lost artifact',
        'leads a revolution',
        'solves an ancient mystery',
        'survives a natural disaster',
        'discovers a new dimension',
        'overcomes personal challenges',
        'solves a complex problem',
        'leads a community project',
        'uncovers hidden truths',
        'achieves a lifelong dream'
    ];
    const places = [
        'in a mansion in America',
        'in an abandoned castle',
        'on a remote island',
        'in a futuristic city',
        'in a small village',
        'in a parallel universe',
        'on a distant planet',
        'in the heart of a jungle',
        'beneath the ocean',
        'within a virtual reality',
        'in a bustling city',
        'in a small rural town',
        'at a prestigious university',
        'in a war-torn country',
        'on an international space station'
    ];
    const centuries = [
        'in the 1800 century',
        'in the 2500 century',
        'in the Middle Ages',
        'in the 21st century',
        'in a distant future',
        'during the Stone Age',
        'in the Renaissance period',
        'in the 1960s',
        'in the 22nd century',
        'in the future',
        'in the 19th century',
        'in the present day',
        'during a war',
        'in the early 2000s',
        'in the near future',
    ];

    const genre = getRandomElement(genres);
    const actor = getRandomElement(actors);
    const subordinate = getRandomElement(subordinates);
    const place = getRandomElement(places);
    const century = getRandomElement(centuries, 0.1, true);
    return `${genre} story about ${actor} who ${subordinate} ${place}${century}.`;
}

function getRandomElement(array: string[], nothingChance: number = 0, addSpace: boolean = false) {
    if (Math.random() < nothingChance) {
        return '';
    }
    const space = addSpace ? ' ' : '';
    return space + array[Math.floor(Math.random() * array.length)];
}

export function getRandomStoryPerspective(): string {
    const perspectives = [
        'first-person perspective (told through their own eyes)',
        'second-person perspective (narrated directly to the reader)',
        'third-person perspective (observed by an outside narrator)',
        'multiple perspectives (from multiple characters\' viewpoints)',
        'epistolary perspective (through diary entries and letters)',
        'third-person omniscient (as an omniscient observer who knows all)',
        'third-person limited (focusing closely on one character\'s thoughts)',
    ];
    return getRandomElement(perspectives);
}