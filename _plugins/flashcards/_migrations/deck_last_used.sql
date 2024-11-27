CREATE OR REPLACE FUNCTION update_deck_last_used () RETURNS TRIGGER AS $$
BEGIN
    -- Update the last_used timestamp to the current time
    UPDATE public.pl_flashcards_deck
    SET last_used = now()
    WHERE id = NEW.deck_id;  -- Use OLD.deck_id for DELETE trigger

    RETURN NEW;  -- For INSERT and UPDATE
END;
$$ LANGUAGE plpgsql;

-- Step 2: Create the trigger for INSERT, UPDATE, and DELETE
CREATE TRIGGER update_deck_last_used
BEFORE INSERT OR UPDATE OR DELETE 
ON public.pl_flashcards_cards FOR EACH ROW
EXECUTE FUNCTION update_deck_last_used();