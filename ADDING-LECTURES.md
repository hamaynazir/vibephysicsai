# Adding subjects and interactive lectures

The library is the front door. Each lecture is a separate learning experience with its own PDF, diagrams, exercises and saved progress.

## Current subjects

| Subject | Catalog ID | Current chapters |
| --- | --- | --- |
| Materials Science | `materials-science` | Materials and Bonding (16 pages, 22 sections) |
| Laser Physics | `laser-physics` | Laser Radiation and Its Properties (14 pages, 19 sections) |
| Solid State Principles | `solid-state-principles` | Crystal Structures |
| Nuclear Models | `nuclear-models` | None yet |
| Electromagnetic Theory | `electromagnetic-theory` | None yet |

Do not mark a chapter available until its reader actually exists and works. Subjects with an empty `lessons` array display the built-in empty state.

## Recommended structure for future work

```text
index.html                        Shared library entry point
catalog.js                        Subjects + prepared chapters
reader.html                       Existing Crystal Structures reader
lessons/
  laser-physics/
    chapter-slug/
      index.html                  This lecture's reader
      assets/lecture.pdf          Its supplied lecture
      ...                         Its diagrams and teaching content
  electromagnetic-theory/
    chapter-slug/
      index.html
      ...
```

The existing crystal chapter remains at the root to preserve its imports and saved progress. It does not need to be moved to add future chapters.

## Add a prepared chapter to the catalog

1. Build the lesson for its actual PDF. Reuse the reader's white layout and learning patterns where useful, but adapt the content, calculations, diagrams and questions to that subject. The crystal models are not a generic renderer for other physics topics.
2. Give the lecture a stable ID and its own browser-storage keys. For example, `study:laser-physics:chapter-slug:page` and `study:laser-physics:chapter-slug:learning`. The future reader must actually use those keys; the catalog does not configure another page's storage automatically.
3. Add the following shape to the correct subject's `lessons` array in `catalog.js`, replacing all example values with the prepared lecture's real metadata:

```js
{
  id: 'unique-lecture-id',
  number: '01',
  title: 'The actual chapter title',
  description: 'What this prepared lesson teaches.',
  reader: 'lessons/laser-physics/chapter-slug/index.html',
  pages: 20, // Replace with the verified PDF page count.
  topics: 8, // Replace with the actual lesson topic count.
  storage: {
    page: 'study:laser-physics:chapter-slug:page',
    learning: 'study:laser-physics:chapter-slug:learning'
  }
}
```

4. Include a **Library** link in the new reader. For a page at `lessons/subject/chapter/index.html`, `../../../` returns to the root library, including when hosted under a GitHub repository prefix.
5. Run `npm test`. The catalog checks require an actual reader file and unique lesson storage keys. Verify opening the subject, entering the chapter, returning to the library, and resuming the correct chapter/page.
6. Upload the changed source to GitHub when ready. The deployment workflow copies `lessons/` when present, along with the shared library files.

## Preserve existing progress

Crystal Structures intentionally retains `crystal-page` and `crystal-learning-v1`. Do not reuse these keys for a new lecture. The library uses `study-library-last-lesson` only to remember which chapter to resume; it reads page positions from the separate keys declared in the catalog. Answer histories belong to their individual readers.

## Hosting

All catalog reader paths must be relative. This keeps the site portable between a local server, a GitHub Pages repository URL, and a custom domain. No account service or database is required for this browser-local progress model.
