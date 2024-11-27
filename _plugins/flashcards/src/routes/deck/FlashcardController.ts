import { Card, createEmptyCard, FSRS, fsrs, generatorParameters, Grade, RecordLogItem, State, StateType } from "ts-fsrs";
import { PluginController } from "../../utils/PluginController";
import WhereClauseBuilder from "../../utils/WhereClauseBuilder";
import { Deck } from "../App";

export interface Flashcard extends Omit<Card, "due" | "last_review" | "state"> {
    id: string;
    front: string;
    back: string;
    deck_id: string;
    state: State;
    due: Date;
    last_review: Date | null | number;
}

export interface FlashcardRemaining {
    new: number;
    learning: number;
    review: number;
}

export default class FlashcardController {
    private f: FSRS;
    private db: PluginController;
    private cards: Flashcard[] = [];
    private deck_id: string | undefined;
    private deckName: string | undefined;

    constructor(pluginController: PluginController) {
        this.db = pluginController;
        this.f = fsrs(generatorParameters({ enable_fuzz: true, enable_short_term: true }));
    }

    async init(deck_id: string) {
        this.deck_id = deck_id;

        this.cards = (await this.db.dbFunctionCall("due_today", { use_deck: deck_id })).map((card: Flashcard) => {
            return {
                ...card,
                due: new Date(card.due),
                state: Number(card.state) as State,
                last_review: card.last_review ? new Date(card.last_review) : null,
            }
        });
        this.sortCards();
    }

    add(front: string, back: string, deckId?: string) {
        const deck_id = deckId || this.deck_id;
        function cardAfterHandler(card: Card): Flashcard {
            return {
                ...card,
                id: "id" + Math.random(),
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

    edit(front: string, back: string) {
        this.cards[0].front = front;
        this.cards[0].back = back;

        this.db.dbUpdate("cards", { id: this.cards[0].id }, this.cards[0]);
        this.sortCards();
    }

    delete() {
        this.db.dbDelete("cards", { id: this.cards[0].id });
        this.cards.shift();
    }

    async getDeckName(): Promise<string> {
        if (!this.deckName) {
            await this.db.dbFetch("deck", "name", new WhereClauseBuilder().eq("id", this.deck_id))
                .then((result: Deck[]) => { this.deckName = result[0].name });
        }
        return this.deckName!;
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
        const result = this.getCard(id);

        this.cards[result.index] = this.f.next(result.card, new Date(), grade, ({ card }) => card as unknown as Flashcard);

        this.db.dbUpdate("cards", { id: result.card.id }, this.cards[result.index]);
        this.sortCards();
    }

    private getTodayCards() {
        return this.cards.filter(card => card.due.getTime() <= new Date().setHours(23, 59, 59, 0));
    }

    private remaining(state: State) {
        return this.getTodayCards().filter(card => card.state === state);
    }

    getNext(): { card: Flashcard, remaining: FlashcardRemaining } {
        return {
            card: this.getTodayCards()[0],
            remaining: {
                new: this.remaining(State.New).length,
                learning: this.remaining(State.Learning).length,
                review: this.remaining(State.Review).length,
            }
        }

    }
}