# DailyLog Training Programming Spec

## Purpose & User Problem

Enable trainers to input and manage training programming (planned workouts) for students, directly from the DailyLog interface. This allows trainers to pre-plan workouts for today or future dates, improving communication and planning.

## Success Criteria

- Trainers can add programming cards for any day that is today or in the future.
- Programming cards can only be added if there is no actual training data for that day.
- Programming cards are visually distinct (theme primary color) and can be removed with confirmation.
- Programming data is stored in local storage under a consistent key.
- Only one programming card per exercise per day.
- Programming is hidden if actual data exists for the day.

## Scope & Constraints

- Programming cards are added via a floating plus button in the bottom-right of the workout cards pane.
- Clicking the plus button opens a modal with an exercise search bar (autocomplete, same as TopBannerBar).
- Selecting an exercise adds a programming card for that exercise to the current day.
- Only one card per exercise per day; duplicates are prevented.
- Multiple exercises can be added per day (one at a time).
- Programming cards can be removed via a trash icon (top-right of card), with a confirmation dialog.
- Modal closes on click-away or ESC.
- Programming is hidden if actual data exists for the day (future: will show both for comparison).
- Data structure for programming (`dateToProgramming`) mirrors `dateToExercise`:
  - `{ [date: string]: { exerciseOrdering: string[], exerciseDetails: { [exerciseId: string]: Array<{ reps, weight, comment }> } } }`
- Programming is global (not per-user).
- Feature is available to all users (no role checks yet).
- Highlight color for programming cards is the theme's primary color.

## Technical Considerations

- Use local storage for persistence. Key name should be consistent with other local storage keys (e.g., `fitpages_dateToProgramming`).
- Modal and plus button should be accessible and responsive.
- Exercise search bar should use the same logic as TopBannerBar for i18n and autocomplete.
- Programming cards should be visually distinct from actual data cards.
- All logic for adding/removing programming should be encapsulated in DailyLog (or subcomponents as needed).

## Out of Scope

- Editing sets/reps/weight/comments for programming (to be added later).
- Per-user programming (future feature).
- Role-based access (future feature).
- Displaying both programming and actual data for the same day (future feature).
