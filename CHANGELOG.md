# 1.1.0
New Features
- added subsystem builder application as an alternative to manually editing journal pages
- added "New Page" button in subsystems window
- added edit button directly to subsystem window and to journal pages
- added setting to allow GMs to decide whether to open the builder or default journal editor when clicking the edit button
- addedd the ability to set influence checks, weaknesses, and resistances as "undiscovered|discovered|always known" with secret block formatting and a toggle button

Improvements
- Influence weaknesses and resistances can now apply to specific checks and lores
- Victory Point sliders can now be adjusted while hidden from players
- Notes sections (ie. any unformatted or grouped text) now display for all subsystems

Fixes
- Hacking - regex pattern further safeguarded from text editor corruption
- Hacking - unnamed countermeasures and vulnerabilities stay unnamed when edited
- Influence Points now correctly referred to as (IP) instead of (RP)
- Reputation - removed check groups from this subsystem as there's no RAW reason to have them there.
- general code cleanup

# 1.0.0
complete rewrite:
- reimplemented all previously implemented subsystems and added Hacking from SF2e (requires either the SF2e system or SF2e Anachronism)
- removed svelte and libwrapper dependencies, everything is now written in pure javascript, handlebars, and css

# 0.0.9
- removed hard dependency on libWrapper (implemented shim fallback)
- added missing influence field for NPCs in the influence subsystem
- added reputation level and points to the reputation group headers

# 0.0.8
- accidentally added an extra bracket in module.json, removed that

# 0.0.7
- added libwrapper dependency, as the non-libwrapper fallback wasn't working properly

# 0.0.6
- made submenus like check or source groups collapsable
- added Reputation and Infiltration subsystems
- added inline effect links to reputation level effects
- added field to edit NPC name that I missed on inital implementation
- added penalties to NPCs in the influence subsystem
- removed extraneous commented out code
- reworked delete code to delete entries recursively
- fixed remove library and remove chase 
- removed unused reloadData functions

# 0.0.5
- "fixed" inline checks on party sheet by replacing them with a button that posts an inline check to chat

# 0.0.4
- hooked the subsytem tab into the party sheet on init, fixing the tab switching issue (hopefully for good this time)

# 0.0.3
- added Chases subsystem
- hopefully fixed party sheet tab switching on refresh issue

# 0.0.2
- fixed issue with build script resulting in broken module, no code changes in this version

# 0.0.1
initial module setup
new subsystems included are:
- Influence
- Research
- Victory Points
