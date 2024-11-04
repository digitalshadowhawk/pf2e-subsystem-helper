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
