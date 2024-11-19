import { Card, createEmptyCard, FSRS, fsrs, generatorParameters, Grade, RecordLogItem, State, StateType } from "ts-fsrs";

export interface Flashcard extends Omit<Card, "due" | "last_review" | "state"> {
    cid: string;
    front: string;
    back: string;
    state: StateType;
    due: Date | number;
    last_review: Date | null | number;
}

export interface FlashcardRemaining {
    new: number;
    learning: number;
    due: number;
}

export default class FlashcardController {
    private f: FSRS;
    private cards: Flashcard[] = [];

    constructor() {
        this.f = fsrs(generatorParameters({ enable_fuzz: true, enable_short_term: true }));
    }

    async init() {
        //fetch cards from db
        // create function to retrieve 20 new and all others scheduled for the day

    }

    add(front: string, back: string) {
        function cardAfterHandler(card: Card): Flashcard {
            return {
                ...card,
                cid: "id" + Math.random(),
                due: card.due.getTime(),
                state: State[card.state],
                last_review: card.last_review ?? null,
                front,
                back
            } as Flashcard;
        }

        const card = createEmptyCard(new Date(), cardAfterHandler);

        this.cards.push(card);
        this.sortCards();

        this.addToDB(card);
    }

    private addToDB(card: Flashcard) {
        // add to db


        const updatedID = "mock_db_updated_id" + card.cid;

        const { index } = this.getCard(card.cid);
        this.cards[index].cid = updatedID;
    }

    private getCard(id: string) {
        const index = this.cards.findIndex(card => card.cid === id);
        return { card: this.cards[index], index };
    }

    private sortCards() {
        this.cards = this.cards.sort((a, b) => a.due as number - (b.due as number));
    }

    validate(id: string, grade: Grade) {
        function nextAfterHandler({ card }: RecordLogItem) {
            return {
                ...(card as Card & { cid: string, front: string, back: string }),
                due: card.due.getTime(),
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
        // update in db
    }

    private getTodayCards() {
        // today starting from 23:59:59
        return this.cards.filter(card => card.due as number <= new Date().setHours(23, 59, 59, 0));
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