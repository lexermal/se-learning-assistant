import { Card, createEmptyCard, FSRS, fsrs, generatorParameters, Grade, RecordLogItem, State, StateType } from "ts-fsrs";
import { PluginController } from "../../utils/PluginController";

export interface Flashcard extends Omit<Card, "due" | "last_review" | "state"> {
    id: string;
    front: string;
    back: string;
    deck_id: string;
    state: StateType;
    due: Date;
    last_review: Date | null | number;
}

export interface FlashcardRemaining {
    new: number;
    learning: number;
    due: number;
}

export default class FlashcardController {
    private f: FSRS;
    private db: PluginController;
    private cards: Flashcard[] = [];
    private deck_id: string | undefined;

    constructor(pluginController: PluginController) {
        this.db = pluginController;
        this.f = fsrs(generatorParameters({ enable_fuzz: true, enable_short_term: true }));
    }

    async init(deck_id: string) {
        this.deck_id = deck_id;
        // const cards = await this.db.dbFunctionCall("today_cards");
        // console.log("fetched cards: ", cards);
        //fetch cards from db
        // create function to retrieve 20 new and all others scheduled for the day

    }

    add(front: string, back: string) {
        const deck_id = this.deck_id;
        function cardAfterHandler(card: Card): Flashcard {
            return {
                ...card,
                id: "id" + Math.random(),
                due: card.due,
                state: State[card.state],
                last_review: card.last_review ?? null,
                front,
                back,
                deck_id,
            } as Flashcard;
        }

        const card = createEmptyCard(new Date(), cardAfterHandler);

        this.cards.push(card);
        this.sortCards();

        this.addToDB({ ...card });
    }

    private async addToDB(card: Partial<Flashcard>) {
        const id = card.id!;
        delete card.id;

        const [response] = await this.db.dbInsert("cards", card, "id");

        const { index } = this.getCard(id);
        this.cards[index].id = response.id;
    }

    private getCard(id: string) {
        const index = this.cards.findIndex(card => card.id === id);
        return { card: this.cards[index], index };
    }

    private sortCards() {
        this.cards = this.cards.sort((a, b) => a.due.getTime() - b.due.getTime());
    }

    validate(id: string, grade: Grade) {
        function nextAfterHandler({ card }: RecordLogItem) {
            return {
                ...(card as Card & { id: string, front: string, back: string, deck_id: string }),
                state: State[card.state] as StateType,
                last_review: card.last_review ? card.last_review!.getTime() : null,
            };
        }

        const result = this.getCard(id);

        this.cards[result.index] = this.f.next(result.card, new Date(), grade, nextAfterHandler);
        this.sortCards();

        this.updateInDB(result.card);
    }

    private updateInDB(card: Flashcard) {
        this.db.dbUpdate("cards", { id: card.id }, card);
    }

    private getTodayCards() {
        return this.cards.filter(card => card.due.getTime() <= new Date().setHours(23, 59, 59, 0));
    }

    private remaining(state: StateType) {
        return this.getTodayCards().filter(card => card.state === state);
    }

    getNext(): { card: Flashcard, remaining: FlashcardRemaining } {
        return {
            card: this.getTodayCards()[0],
            remaining: {
                new: this.remaining("New").length,
                learning: this.remaining("Learning").length,
                due: this.remaining("Review").length,
            }
        }

    }
}