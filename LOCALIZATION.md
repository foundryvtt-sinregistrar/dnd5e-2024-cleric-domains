# Localization architecture

English is the canonical compendium presentation. Stable Item, folder, activity, effect, advancement, and UUID identifiers are the translation contract and must never change for a translation.

Spanish is maintained in `translate-dnd5e-cleric-domains-2024-es` using Babele. A new language should copy that module, register only its language, and translate visible values in the compendium JSON without altering IDs or mechanical fields.
