CREATE OR REPLACE FUNCTION pl_flashcards_due_today()
RETURNS TABLE (
  id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  due TIMESTAMP WITHOUT TIME ZONE,
  front TEXT,
  back TEXT,
  flexible_flip_preference BOOLEAN,
  deck_id BIGINT,
  difficulty NUMERIC,
  elapsed_days BIGINT,
  lapses BIGINT,
  last_review TIMESTAMP WITHOUT TIME ZONE,
  reps BIGINT,
  scheduled_days BIGINT,
  stability NUMERIC,
  state TEXT,
  user_id UUID
) AS $$
BEGIN
  RETURN QUERY
  (
    -- Using a CTE to separate the "Review" and "Learning" states and the "New" state
    WITH review_learning AS (
      -- Fetch all rows for "Review" and "Learning" states due today
      SELECT 
        c1.id,
        c1.created_at,
        c1.due,
        c1.front,
        c1.back,
        c1.flexible_flip_preference,
        c1.deck_id,
        c1.difficulty,
        c1.elapsed_days,
        c1.lapses,
        c1.last_review,
        c1.reps,
        c1.scheduled_days,
        c1.stability,
        c1.state,
        c1.user_id
      FROM pl_flashcards_cards c1
      WHERE c1.state IN ('2', '1')
        AND c1.due < CURRENT_DATE + INTERVAL '1 day'
    ),
    new_cards AS (
      -- Fetch up to 20 rows for the "New" state due today
      SELECT 
        c2.id,
        c2.created_at,
        c2.due,
        c2.front,
        c2.back,
        c2.flexible_flip_preference,
        c2.deck_id,
        c2.difficulty,
        c2.elapsed_days,
        c2.lapses,
        c2.last_review,
        c2.reps,
        c2.scheduled_days,
        c2.stability,
        c2.state,
        c2.user_id
      FROM pl_flashcards_cards c2
      WHERE c2.state = '0'
        AND c2.due < CURRENT_DATE + INTERVAL '1 day'
      LIMIT 20
    )
    -- Combine the results from both CTEs
    SELECT * FROM review_learning
    UNION ALL
    SELECT * FROM new_cards
  );
END;
$$ LANGUAGE plpgsql;


-- Select * from pl_flashcards_due_today();

