"use client";

import { useState } from "react";

export function ReaderActions({ sectionId }: { sectionId: string }) {
  const [bookmarked, setBookmarked] = useState(false);
  const [note, setNote] = useState("");

  return (
    <div className="reader-actions" aria-label={`Actions for ${sectionId}`}>
      <button type="button" aria-pressed={bookmarked} onClick={() => setBookmarked((value) => !value)}>
        {bookmarked ? "Bookmarked" : "Bookmark"}
      </button>
      <label>
        <span className="sr-only">Section note</span>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Add note"
          rows={2}
        />
      </label>
      <button type="button" disabled={!note.trim()}>
        Save note
      </button>
    </div>
  );
}
