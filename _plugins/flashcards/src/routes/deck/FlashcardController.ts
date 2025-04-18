import { Card, createEmptyCard, FSRS, fsrs, generatorParameters, Grade, State } from "ts-fsrs";
import { RimoriClient } from "@rimori/client";
import { PostgrestQueryBuilder } from "@supabase/postgrest-js";

export interface Flashcard extends Omit<Card, "due" | "last_review" | "state"> {
    id: string;
    front: string;
    back: string;
    deck_id: string;
    state: State;
    due: Date;
    last_review: Date | null | number;
    front_tags: string[];
    back_tags: string[];
}

export interface FlashcardRemaining {
    new: number;
    learning: number;
    review: number;
}

interface CrudCard {
    front: string;
    back: string;
    deckId?: string;
    frontTags: string[];
    backTags: string[];
}

export default class FlashcardController {
    private f: FSRS;
    private client: RimoriClient;
    private cardDB: PostgrestQueryBuilder<any, any, "cards">;
    private cards: Flashcard[] = [];
    private deck_id: string | undefined;
    private deckName: string | undefined;

    constructor(client: RimoriClient) {
        this.client = client;
        this.cardDB = client.from("cards");
        this.f = fsrs(generatorParameters({ enable_fuzz: true, enable_short_term: true }));
    }

    async init(deck_id: string) {
        this.deck_id = deck_id;
        const response = await this.client.rpc("due_today", { use_deck: deck_id });

        if (response.error) {
            throw new Error(response.error.message);
        }

        this.cards = (response.data as any[]).map((card: Flashcard) => {
            return {
                ...card,
                due: new Date(card.due),
                state: Number(card.state) as State,
                last_review: card.last_review ? new Date(card.last_review) : null,
            }
        });
        this.sortCards();
    }

    add(newCard: CrudCard) {
        const deck_id = newCard.deckId || this.deck_id;
        function cardAfterHandler(card: Card): Flashcard {
            return {
                ...card,
                id: "id" + Math.random(),
                last_review: card.last_review ?? null,
                front: newCard.front,
                back: newCard.back,
                front_tags: newCard.frontTags || {},
                back_tags: newCard.backTags || {},
                deck_id,
            } as Flashcard;
        }

        const card = createEmptyCard(new Date(), cardAfterHandler);

        this.cards.push(card);
        this.sortCards();

        this.addToDB({ ...card });
    }

    async edit(editCard: CrudCard) {
        this.cards[0].front = editCard.front;
        this.cards[0].back = editCard.back;
        this.cards[0].front_tags = editCard.frontTags;
        this.cards[0].back_tags = editCard.backTags;

        // this.client.dbUpdate("cards", { id: this.cards[0].id }, this.cards[0]);
        await this.cardDB.update(this.cards[0].id as any).eq("id", this.cards[0].id);
        this.sortCards();
    }

    async delete() {
        await this.cardDB.delete().eq("id", this.cards[0].id);
        this.cards.shift();
    }

    async getDeckName(): Promise<string> {
        if (!this.deckName) {
            const response = await this.client.from("decks").select("name").eq("id", this.deck_id!).limit(1);
            if (response.error) {
                throw new Error(response.error.message);
            }
            this.deckName = response.data[0].name as string;
        }
        return this.deckName!;
    }

    private async addToDB(card: Partial<Flashcard>) {
        const id = card.id!;
        delete card.id;

        const { data: response, error } = await this.cardDB.insert(card).select("id").single();
        if (error) {
            throw new Error(error.message);
        }

        const { index } = this.getCard(id);
        this.cards[index].id = response.id as string;
    }

    private getCard(id: string) {
        const index = this.cards.findIndex(card => card.id === id);
        return { card: this.cards[index], index };
    }

    private sortCards() {
        this.cards = this.cards.sort((a, b) => a.due.getTime() - b.due.getTime());
    }

    async validate(id: string, grade: Grade) {
        const result = this.getCard(id);

        if (!result.card) {
            console.log("card not found", id, this.cards);
            return;
        }

        this.cards[result.index] = this.f.next(result.card, new Date(), grade, ({ card }) => card as unknown as Flashcard);
        await this.cardDB.update(this.cards[result.index] as any).eq("id", result.card.id);
        this.sortCards();
    }

    private getTodayCards() {
        return this.cards.filter(card => card.due.getTime() <= new Date().setHours(23, 59, 59, 0));
    }

    private remaining(state: State) {
        return this.getTodayCards().filter(card => card.state === state);
    }

    getNext(): { card: Flashcard, remaining: FlashcardRemaining } {
        this.sortCards();
        return {
            card: this.getTodayCards()[0],
            remaining: {
                new: this.remaining(State.New).length,
                learning: this.remaining(State.Learning).length + this.remaining(State.Relearning).length,
                review: this.remaining(State.Review).length,
            }
        }

    }
}