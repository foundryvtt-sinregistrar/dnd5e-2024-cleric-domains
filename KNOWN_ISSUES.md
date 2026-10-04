# Known external issues

## `ravanno-dnd5e-es` and Babele 2.9.1

Verified on 2026-10-04 with Foundry VTT 14.368 and dnd5e 6.0.3.

The browser console can show a deprecated `Babele.get` warning and missing `range` converter warnings while `ravanno-dnd5e-es` translations are loaded. These messages do not originate in `dnd5e-2024-cleric-domains` or `translate-dnd5e-cleric-domains-2024-es`:

- `ravanno-dnd5e-es/babele-register.js` calls the deprecated `Babele.get` API;
- `ravanno-dnd5e-es/compendium/dnd5e.spells.json` requests a `range` converter that is not registered during that module's load.

This does not block version 0.0.2. The Cleric Domains compendium and its 19 translated entries load correctly, and its own structured converters preserve the mechanical `range` and `target` fields.

The fix belongs in `ravanno-dnd5e-es`: migrate away from `Babele.get` and register or remove its `range` converter. This project intentionally does not register a global compatibility converter that could mask or interfere with another translation module.
