A standalone element instance: an instance of element-001.json read and written on its own, outside a
template instance. It states a class, a name, a description and all four provenance keys, and holds a
literal, a repeated literal, a typed number, a link, a controlled term, a nested element, a repeated
element and an attribute-value field with two attributes.

An element schema declares no name, description or provenance for its instances, so the validator
refuses this document against element-001.json for those keys alone. The libraries read and write
them, and the case holds both libraries to the same reading and writing of them.
