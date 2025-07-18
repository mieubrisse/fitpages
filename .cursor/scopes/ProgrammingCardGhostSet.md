# ProgrammingCardGhostSet Spec

## Purpose & User Problem

Currently, users must manually add new sets to a ProgrammingCard by clicking a plus button. This interrupts the user flow and makes rapid entry of multiple sets cumbersome. The goal is to streamline the experience so that set entry is automatic and intuitive, reducing friction and making the interface feel more responsive and modern.

## Success Criteria

- When a new ProgrammingCard is created, it always displays one empty (ghost) set row by default.
- There is always exactly one empty ghost set at the end of the set list.
- As soon as the user types in any field of the ghost set, a new ghost set row appears below it.
- The plus (add) button is removed entirely from the UI.
- Only filled sets (all except the last empty one) are stored in the dateToProgramming map and passed to onUpdateProgramming.
- If all sets are deleted, the card still displays a single empty ghost set.
- If the user clears out a filled row (making it empty in the middle), it remains as an empty row, and it’s up to the user to delete it if they wish.

## Scope & Constraints

- A set is considered empty if all three fields (weight, reps, comment) are empty.
- The ghost set is not included in the saved data or in the dateToProgramming map.
- The UI must update responsively as the user types, always ensuring a ghost set is present at the end.
- The trash/delete button remains available for all rows except the ghost set.
- No additional buttons for adding sets should be present.

## Technical Considerations

- The logic for determining which sets are saved should be handled in ProgrammingCard.jsx.
- The onUpdateProgramming callback should only be called with the filled sets (excluding the ghost set).
- The component should be robust to rapid user input and edge cases (e.g., clearing all sets, deleting/clearing in the middle).

## Out of Scope

- Changes to the underlying data model or storage format beyond filtering out the ghost set.
- UI changes outside of the ProgrammingCard set entry table.
- Validation of set values (e.g., ensuring weight/reps are numbers) beyond existing behavior.

## Clarification

- Any set that the user has ever entered data into (even if later cleared) is considered a “real” set and should persist unless explicitly deleted by the user.
- The “ghost set” is always just a single, always-empty row at the end, serving as a place for the user to start entering the next real set.
- If the user starts typing in the ghost set, it becomes a real set, and a new ghost set appears below.

---

Does this capture your intent? Any changes needed?
