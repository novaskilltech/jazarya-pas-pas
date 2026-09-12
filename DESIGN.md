# Jazariyya redesign

Reference inspected on 2026-09-09: https://anti-coranisme.novaskill.tech/

Observed through Firecrawl HTML and branding extraction: Outfit headings, Plus Jakarta Sans body, compact 6px corners, dark structural outlines, strongly numbered manual sections, icon-led callouts, expandable learning cards, persistent table of contents and separate language views. No claim of pixel-matching or browser visual verification.

Adaptation: retain the reference's practical-manual hierarchy and confident outlined components. Replace saturated yellow with mint, sky blue and soft yellow used by meaning. Keep a dark ink masthead and crisp offset shadows. No Dummies logo, mascot, brand title, unrelated book promotion, invented engagement metrics or third-party counters.

Reader: direct chapter entry, grouped table of contents, short summary before the long text, separate reading and practice panels, all verses reachable without leaving the chapter, reversible checklists, explicit oral-learning warning, term cards. Arabic has its own interface with logical CSS and RTL. French retains the Arabic matn as source text, not bilingual explanatory columns.

Content scope: preserve the existing body, verses and glossary. Restore chapter summaries already present in the supplied manuscript. This is a UI redesign, not scientific validation of the manuscript.

Publication: save this revision without replacing the currently published version until publication is requested.

## Illustrated articulation fiches — 2026-09-11

23 French/Arabic fiches now accompany verses 9–19 at `#makharij` and `#makhraj/<id>`. A language switch retains the selected fiche. The illustrated pages use cream, sage and pale yellow, with an original diagram, observation prompt, full verse copy, explanation copy including sources, and links into the existing detailed commentaries. Original anatomy drawings retain their orientation in RTL; a native dialog enlarges them without changing their proportions.

Images are local, loaded lazily and credited individually. Their sources are recorded in `dist/makharij.json`; availability is not represented as an open license. The emphatic rāʾ is labeled explicitly, and the limits of the lateral ḍād profile are explained. All 23 image files and their letter labels have been inspected. The existing 109 bilingual articles are unchanged.

Verification: `node check-reader.mjs`, `node check-articles.mjs`, `node check-makharij.mjs`, JavaScript syntax checks and `git diff --check`. Both language flows were also exercised by importing the real reader module into a temporary DOM simulation: every fiche, language links, dialog controls and focus restoration, verse/explanation copy, clipboard refusal, commentary links and existing chapter navigation. Native browser behavior and visual layout were not verified in a browser. Production publication requires restored access to the existing Vercel team; project lookup returns HTTP 403 for `novaskilltechs-projects`.
