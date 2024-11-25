CREATE OR REPLACE FUNCTION pl_flashcards_due_today_summary()
RETURNS TABLE (
  id BIGINT,
  name TEXT,
  total_new BIGINT,
  total_learning BIGINT,
  total_review BIGINT
) AS $$
BEGIN
  RETURN QUERY
  (
    -- Fetch counts grouped by deck_id and state
    SELECT 
      d.id AS id,
      d.name AS name,
      COUNT(CASE WHEN c.state = '0' THEN 1 END) AS total_new,       -- New cards
      COUNT(CASE WHEN c.state = '1' THEN 1 END) AS total_learning,  -- Learning cards
      COUNT(CASE WHEN c.state = '2' THEN 1 END) AS total_review     -- Review cards
    FROM pl_flashcards_deck d
    LEFT OUTER JOIN pl_flashcards_cards c ON d.id = c.deck_id       -- Include all decks
      AND c.due < CURRENT_DATE + INTERVAL '1 day'                  -- Consider due cards
    GROUP BY d.id, d.name, c.deck_id
    ORDER BY c.deck_id -- Optionally sort by deck_id
  );
END;
$$ LANGUAGE plpgsql;

-- Usage example:
-- SELECT * FROM pl_flashcards_due_today_summary();
