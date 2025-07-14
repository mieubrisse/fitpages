# WorkoutCommentCard Spec

## Purpose & User Problem

Display a daily workout comment (if it exists) at the top of the workout log, providing users with a way to see or recall general notes, context, or feedback for a given workout day. This helps users and coaches track qualitative aspects of training alongside quantitative data.

## Success Criteria

- If a workout comment exists for the selected date, a card appears at the top of the day’s log, above all exercise cards.
- The card header is i18n-aware: shows "Workout Comment" (EN) or "Comentário do Treino" (PT).
- The card body displays the plain text of the comment.
- The card visually matches the style of TrainingCard (Paper, padding, etc.).
- No edit/delete actions are present; display only.
- If no comment exists for the date, the card does not render.

## Scope & Constraints

- Data is fetched in WorkoutLogPage.jsx from the WorkoutComment table in the database.
- Data is stored in a `dateToWorkoutComment` object mapping date strings (YYYY-MM-DD) to comment text.
- The relevant comment is passed as a `workoutComment` prop to DailyLog.
- DailyLog renders the card as the first card if the prop is non-empty.
- i18n for header only (EN/PT, as described).
- Card matches TrainingCard styling (Paper, borderRadius, padding, etc.).

## Technical Considerations

- Query WorkoutComment table for all comments, mapping each to its date.
- Ensure date format matches that used elsewhere (YYYY-MM-DD).
- Card should be a new component (WorkoutCommentCard.jsx) for clarity/reuse.
- No interactivity required (no edit/delete, no click handlers).
- Card should be responsive and visually consistent with other cards.

## Out of Scope

- Editing, adding, or deleting workout comments.
- Displaying author, timestamp, or metadata beyond the comment text.
- Comments for exercises (handled elsewhere).
- Any UI for entering comments (display only).
