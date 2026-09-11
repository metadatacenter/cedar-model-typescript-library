Template with a declared default value on every field type that takes one

One field per default shape the model allows, so both libraries are compared on
all of them at once:
  - A literal: text, paragraph, e-mail, phone, radio, checkbox, and the two lists
  - An IRI: link, ORCID, ROR, PFAS, RRID, PubMed, NIH grant identifier, DOI
  - A number: numeric
  - A temporal literal: date
  - A term and its label: controlled term

The two choice fields and the two lists also mark an option selected by default,
which is the second way CEDAR states a default and is kept alongside the first.

Authored with the Java artifact library's builders rather than by hand, so the
source is what CEDAR's canonical implementation writes.
