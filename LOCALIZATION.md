# Localization architecture

English is the canonical compendium presentation. Spanish is maintained in the sibling module `translate-dnd5e-cleric-domains-2024-es` using Babele.

## Stable-ID contract

Translations must preserve every identifier from the base module:

- the 19 Item `_id` values and the three folder `_id` values;
- activity, effect, and advancement IDs nested in each Item;
- UUID references used by `ItemGrant` advancements;
- the pack identifier `dnd5e-2024-cleric-domains.classes24`.

IDs are API surface. Renaming visible labels is supported; changing an ID requires a migration in both modules and is not a translation operation.

## Translatable fields

The Spanish mapping translates Item and activity names, descriptions, activation conditions, special range and target text, effects, the custom source label, and the visible advancement title `Subclass Features`. Structured converters must merge translated leaves into the base object so that numeric range, target type, units, formulas, uses, damage, saves, effects, and UUID links remain canonical.

The dnd5e advancement sheet does not expose the ItemGrant title through the normal Babele mapping in every render path. The Spanish module therefore localizes that presentation at render time without modifying the stored Item or its advancement IDs.

## Validation requirements

A translation release must verify:

1. exact correspondence of Item and folder IDs with `data/`;
2. exact correspondence of nested activity, effect, and advancement IDs;
3. translations for all 19 Items;
4. valid structured `source`, `range`, and `target` values after conversion;
5. absence of unintended English presentation labels;
6. preservation of every untranslated mechanical field.

A new language should copy the Spanish module structure, register only its language, and translate visible values without altering IDs or mechanics.
