import { Link } from "react-router-dom";
import { MdDelete, MdModeEdit } from 'react-icons/md';
import React, { ReactElement, useEffect } from 'react';
import { usePlugin, CRUDModal } from '@rimori/client';

export interface Deck {
  id: string;
  name: string;
}

type DeckSummary = Deck & {
  total_new: number;
  total_learning: number;
  total_review: number;
}

function App() {
  const [decks, setDecks] = React.useState([] as DeckSummary[]);
  const { from, rpc } = usePlugin();

  const fetchDecks = async () => {
    rpc<any, any>("due_today_summary").then(({ data }) => setDecks(data));
  }

  useEffect(() => {
    fetchDecks();
  }, []);

  return (
    <div className="mx-auto bg-yellow-300 dark:bg-gray-800 sm:w-96 p-4 rounded-2xl mt-24 shadow-custom">
      <h1 className='text-4xl mb-3 text-center'>Decks</h1>
      {
        decks.map((deck, index) => (
          <DeckRow key={index} deck={deck} onEdit={(id, name) => {
            from("decks").update({ name }).eq("id", id).then(fetchDecks);
          }} onDelete={id => {
            from("decks").delete().eq("id", id).then(fetchDecks);
          }} />
        ))
      }
      <DeckCrudModal className='mt-6 block' buttonText='Add deck' onComplete={name => {
        from("decks").insert({ name }).then(fetchDecks);
      }} />
    </div>
  );
}

function DeckRow(props: { deck: DeckSummary, onEdit: (id: string, name: string) => void, onDelete: (id: string) => void }) {
  return (
    <div className='group flex flex-row flex-wrap hover:bg-gray-400 dark:hover:bg-gray-600 hover:font-bold justify-between text-left p-1 rounded'>
      <Link to={`/deck/${props.deck.id}`} className='flex-1'>
        <div className='cursor-pointer min-w-3'>{props.deck.name}</div>
      </Link>
      <div className='flex-2 flex-row flex text-right'>
        <div className='mr-1 w-5 text-blue-600'>{props.deck.total_new}</div>
        <div className='mr-1 w-5 text-red-700'>{props.deck.total_learning}</div>
        <div className='mr-1 w-5 text-green-600'>{props.deck.total_review}</div>
      </div>
      <div className='flex-3 flex-row opacity-0 group-hover:opacity-100'>
        <DeckCrudModal buttonText={<MdModeEdit />} deckName={props.deck.name} onComplete={newName => {
          props.onEdit(props.deck.id, newName);
        }} />
        <button className='ml-2' onClick={() => props.onDelete(props.deck.id)}><MdDelete /></button>
      </div>
    </div>
  );
}

function DeckCrudModal(props: { onComplete: (deck: string) => void, deckName?: string, buttonText: string | ReactElement, className?: string }) {
  const [deck, setDeck] = React.useState(props.deckName || "");

  useEffect(() => {
    setDeck(props.deckName || "");
  }, [props.deckName]);

  const handleClose = () => setDeck("");

  return <CRUDModal
    className={props.className}
    buttonText={props.buttonText}
    title={props.deckName ? "Edit deck" : "Add deck"}
    onClose={handleClose}
    actionbuttons={[
      {
        text: "Save", onClick: () => {
          props.onComplete(deck);
          handleClose();
        }
      },
      { text: "Cancel", onClick: handleClose },
    ]}>
    <div className="flex flex-col gap-4">
      <input
        className="bg-gray-300 dark:bg-gray-500 rounded p-2 dark:text-white focus:outline-none"
        placeholder="Deck name" value={deck} onChange={e => setDeck(e.target.value)} />
    </div>
  </CRUDModal>
}


export default App;