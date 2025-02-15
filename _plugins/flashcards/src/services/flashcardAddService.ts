import { RimoriClient } from "shared-components";
import FlashcardController from "../routes/deck/FlashcardController";
import { Translation } from "../types/translation";

export function addFlashcard(plugin: RimoriClient, t: Translation, id: string, language: string) {
    const controller = new FlashcardController(plugin);

    controller.add({
        deckId: id,
        front: getFrontPage(t),
        back: getBackPage(t),
        frontTags: ["lang", "lang:" + language],
        backTags: ["lang", "lang:swedish"],
    })
}

export function getFrontPage(t: Partial<Translation>) {
    const isEtt = t.en_ett_word === "ett";
    const targetTranslation = t.translation_noun_singular || t.translation || [];

    return (isEtt ? "a/an " : "") + targetTranslation.join(", ") + getAlternativeMeaning(t);
}


export function getBackPage(t: Partial<Translation>) :string {
    let backPage = t.infinitive || t.swedish_word;
    const isEtt = t.en_ett_word === "ett";

    if (t.type === "noun") {
        backPage = `${isEtt ? "ett " : ""}${t.swedish_word} (${t.plural})`;
    } else if (t.type === "verb") {
        const { presens: present, past, perfekt: supine } = t.tenses!;
        if (t.irregular) {
            backPage += `  \n(${present}, ${past}, ${supine})`;
        }
        return backPage || "";
    } else if (t.type === "adjective") {
        backPage = `${t.swedish_word}  \n(${t.adjective!.comparative}, ${t.adjective!.superlative})`;
    }
    return backPage || "";
}

export function getAlternativeMeaning(t: Partial<Translation>) {
    let alt = (t.alternative_meaning || "");

    if (t.translation?.includes(alt) || alt.toLowerCase() === "n/a"
        || t.translation?.some((x: string) => x.toLowerCase().includes(alt.substring(0, alt.indexOf("(")).toLowerCase().trim()))) {
        alt = "";
    }

    return alt ? ` or ${alt}` : "";
}