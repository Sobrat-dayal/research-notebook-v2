# Step 8: Presentations and exports

Completed September 11, 2026 in version 2 GPT.

Open a notebook, select its sources, then choose Slide deck in Studio. Choose a theme, audience and 3–15 slides. You can edit slide titles, points, diagrams and speaker notes; present with arrow keys; generate a new version; or restore the previous version. Decks save automatically with the notebook.

PowerPoint downloads contain editable text and diagram shapes, speaker notes and source context. Print / PDF opens the browser print dialog. The Export menu also offers Word (with or without discussion), BibTeX references, and a JSON notebook backup. Word includes saved explanations, measurements, notes and cited excerpts. JSON is a download only; importing a backup is not implemented.

Validation: live Gemini generation at two slide counts, editing, persistence, previous-version restoration and invalid-count handling passed. DOCX/PPTX content tests passed. Microsoft Word and PowerPoint opened and rendered the generated samples; all three presentation themes were visually reviewed. Type checking and production build passed. The regular test suite passed 11 tests; three optional live tests were skipped in that run. The deck live test passed separately.

Full browser/mobile checks, including print-dialog behavior, remain in step 9. Hosting remains in step 10. AI image generation is disabled; diagrams and exports require no paid API.
