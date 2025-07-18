# ProgrammingCardDragReorder Spec

## Purpose & User Problem

Currently, users cannot reorder sets within a ProgrammingCard. This can be frustrating if they want to adjust the sequence of sets after entering them. Allowing users to drag and reorder sets will make the interface more flexible and user-friendly.

## Success Criteria

- Users can drag and drop to reorder real sets within a ProgrammingCard.
- Only the set number cell (leftmost cell) acts as the drag handle.
- The ghost set (the always-empty row at the end) is not draggable or droppable.
- After reordering, the new order is reflected in the UI and saved via onUpdateProgramming.
- Visual feedback is provided during drag (e.g., cursor change, highlight, drop indicator).
- Mouse and touch input are supported for drag-and-drop; keyboard accessibility is not required for now.

## Scope & Constraints

- Use react-beautiful-dnd for drag-and-drop functionality.
- Only real sets (not the ghost set) can be reordered.
- The drag handle is limited to the set number cell.
- The implementation should not interfere with other table interactions (editing, deleting, etc.).

## Technical Considerations

- Integrate react-beautiful-dnd with the MUI Table structure.
- Ensure that onUpdateProgramming is called with the new order of real sets after a drag-and-drop operation.
- The ghost set should always remain at the end and not be affected by reordering.
- The drag-and-drop experience should be smooth and visually clear.

## Out of Scope

- Keyboard accessibility for reordering.
- Drag-and-drop for the ghost set.
- Reordering across different ProgrammingCards.

---

Does this capture your intent? Any changes needed?
