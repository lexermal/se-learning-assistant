export function getStoryInspiration(): string {
    const genres = [
        'Horror',
        'Adventure',
        'Mystery',
        'Romance',
        'Science Fiction',
        'Fantasy',
        'Thriller',
        'Comedy',
        'Historical Fiction',
        'Memoir',
        'Crime',
        'Drama',
        'Biography',
        'Historical',
        'True'
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
        'a mansion in America',
        'an abandoned castle',
        'a remote island',
        'a futuristic city',
        'a small village',
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
        'in the near future'
    ];

    const genre = genres[Math.floor(Math.random() * genres.length)];
    const actor = actors[Math.floor(Math.random() * actors.length)];
    const subordinate = subordinates[Math.floor(Math.random() * subordinates.length)];
    const place = places[Math.floor(Math.random() * places.length)];
    const century = centuries[Math.floor(Math.random() * centuries.length)];

    return `${genre} story about ${actor} who ${subordinate} at ${place} ${century}.`;
}
