A module dedicated to implementing various subsystems that aren't part of the pf2e system or popular modules such as pf2e toolbelt or pf2e workbench.

# Completed Subsystems
- Reputation
- Influence
- Infiltration
- Research
- Chases
- Victory Points
- Hacking

To access the subsystems application, there's a button for it under the Journal Notes category

<img width="205" height="246" alt="image" src="https://github.com/user-attachments/assets/e3b8cf64-37bc-4978-8246-637eb3bebb0e" />

## Page Builder
 
You don't have to write subsystem pages by hand. Every subsystem has a **Page Builder**, a form that writes the page in the format described under [Journal Formats](#journal-formats).
 
- **New page:** in the Subsystems window, the **New Page** button under a tab's journal picker opens a blank form for that subsystem. Saving creates the page in the selected journal with the right page sheet already assigned.
- **Edit a page:** use the edit button on any row in the Subsystems window, or **Edit with form** on the page sheet. The form opens with the page's current content filled in.
- **What it covers:** check groups and their skills (including named Lores), DCs and labels; thresholds; Influence weaknesses and resistances, with a preview of which checks each one affects; Reputation tiers and locations; chase obstacles; infiltration objectives, obstacles, complications, opportunities and awareness; and hacking access points, vulnerabilities and countermeasures. Rich-text fields such as notes and descriptions use the normal editor.
> **Note:** saving from the form rewrites the whole page in the standard format. Anything the module recognizes is kept, and any other text is kept as notes, but custom layout or formatting outside the notes may be normalized. If you prefer to hand-format a page, edit it in the journal instead.

### Settings

**Edit Pages in the Journal Editor:** When enabled, the edit button in the Subsystems window opens the page in the standard journal editor instead of the Page Builder. The page sheet's Edit with form button still opens the builder.

## Journal Formats

Each subsystem reads its content from a journal you pick in its tab of the **Subsystems** window. Every **text page** in that journal is one topic: one research subject, one NPC, one chase, and so on. When you select the journal, its pages switch to that subsystem's page sheet. The sheet shows the content laid out with progress; edit mode is still the normal text editor. Disable the module and the pages read as ordinary journal text.

A few rules apply everywhere:

- **The first heading on a page is its title.** If there's no heading, the page name is used.
- **Bold lead-ins mark structure.** A bold phrase at the start of a paragraph (`**Success** You find...`) tells the module what that paragraph is. Lead-ins can end in a colon or not.
- **Checks are inline checks.** Write them as `@Check[diplomacy|dc:20]`. Text right after a check becomes its label: `@Check[society|dc:18] Recall the family's history`.
- **Anything the module doesn't recognize is kept as notes.** Notes show on the page sheet as written, and in the Subsystems window when the GM expands a row.
- **Secret blocks stay secret.** Foundry secret blocks are GM-only notes, unless they hold Influence checks or weaknesses/resistances (see [Influence](#influence)).

---

### Research

```
## The Sihedron Ritual                       <-- title

Background text...                            <-- notes

**Gather Information (max 5)**               <-- check category, optional cap
@Check[diplomacy|dc:20] Ask around town
@Check[society|dc:18] Check the archives

**Investigate the Ruins**
@Check[arcana|dc:22] Study the glyphs

**5 Research Points** What the PCs learn...    <-- threshold
**10 Research Points** Deeper findings...
**15 Research Points** The full truth...
```

- **Thresholds:** `**X Research Points**` (or `**X Research Point**`). The highest one is the topic's maximum.
- **Check categories:** a fully bold line labels the checks under it. Add `(max X)` to the label to cap how many points that category can contribute; capped categories get their own sliders and add up to the topic total.

<img width="3100" height="720" alt="image" src="https://github.com/user-attachments/assets/38f41fea-2779-4322-b477-17f041a3d041" />

---

### Influence

```
## Lady Ameiko Kaijitsu                      <-- title (one NPC per page)

**Discovery**                                <-- never adjusted by weaknesses/resistances
@Check[perception|dc:18] @Check[society|dc:20]

**Influence Skills**
@Check[diplomacy|dc:20] Talk business
@Check[performance|dc:18] Impress her at the Rusty Dragon
[secret] @Check[mercantile-lore|dc:26]       <-- in a secret block using the editor's formatting dropdown: undiscovered

**Weaknesses**
Flattery about her cooking lowers the DC of Diplomacy checks by 2.

**Resistances**
Mentioning her father increases the DC of all checks by 3.

**4 Influence** She shares a rumor...          <-- threshold
**8 Influence** She offers her help...
```

- **Thresholds:** `**X Influence**`. The highest one is the default maximum; the GM can override it per NPC in the window.
- **Weaknesses and resistances:** list them under a `**Weaknesses**` / `**Resistances**` label, or give each one its own lead-in (`**Weakness** ...`). The amount comes from "by X" in the text (default 2). Toggle them on in the window to lower (weakness) or raise (resistance) the check DCs.
- **Which checks they affect:** if the text names skills as checks ("Diplomacy checks", "Deception or Intimidation checks", "Society and Lore checks", "her Diplomacy DC"), only those checks change. Otherwise every check changes. Checks under a **Discovery** label are never adjusted.
- **Lores:** a named Lore (“Sailing Lore checks”) only changes that Lore. Plain “Lore” (“all Lore checks”) changes every Lore check.
- **Discovery:** wrap a check, or a weakness or resistance, in a Foundry secret block to mark it **undiscovered**. Revealing the secret marks it **discovered**. Either way it stays in its group. The GM can switch it with the eye button on that line in the Subsystems window, with the Discovery dropdown in the Page Builder, or by revealing the secret in the journal editor. The state lives in the page text, so there's no hidden flag to lose.

<img width="3075" height="1353" alt="image" src="https://github.com/user-attachments/assets/16f328bb-e7d3-4e84-aef1-59a1629ee964" />

---

### Reputation

```
## The Sandpoint Garrison                    <-- title (one faction per page)

**Revered** The garrison treats you as heroes...    <-- tier thresholds
**Liked** Guards wave you through...
**Disliked** You're watched closely...
**Hunted** There's a warrant out...

**Locations**
Helped at the Sandpoint Cathedral fire        <-- each line is +1 reputation when completed
Cleared the smuggler's tunnel
```

- **Thresholds:** lead-ins named after the reputation tiers: `Revered` (30+), `Admired` (15+), `Liked` (5+), `Ignored` (-4 to 4), `Disliked` (-5 or less), `Hated` (-15 or less), `Hunted` (-30 or less). Use whichever tiers matter; the page sheet lists them top-down.
- **Locations:** lines under a `**Locations**` label (or a heading with "Location" in it). The GM ticks them off in the window, and each one adds +1 on top of the slider value. The slider will account for these when you drag it, so if you uncheck a location, the total will decrease from where you last moved the slider.
- **No checks:** in the rules, Reputation changes only through favors and disservices, so reputation pages don't use check groups. Any checks on the page are kept as notes.

<img width="3103" height="678" alt="image" src="https://github.com/user-attachments/assets/37a1c036-3e8c-4fa3-9d1e-97927f6b2c43" />

---

### Victory Points

```
## Rallying the Militia                      <-- title (one track per page)

Background text...

**Drilling**                                 <-- optional check groups
@Check[athletics|dc:18] Lead the drills personally

**3 Victory Points** Farmhands join the watch...   <-- threshold
**6 Victory Points** The militia holds the bridge...
**10 Victory Points** Sandpoint is ready...
```

- **Thresholds:** `**X Victory Points**` or `**X VP**`. The highest one is the track's maximum.
- **Hidden tracks:** the GM can move the slider while a track is hidden from players, so it works for tracks players never see.

<img width="3043" height="573" alt="image" src="https://github.com/user-attachments/assets/b672ec86-58f5-4b94-90b7-49f6757931e3" />

---

### Chases

```
## Escape from Thistletop                    <-- title (one chase per page)

Setup text...                                  <-- notes, shown above the obstacles

### Collapsing Tunnel (3)                    <-- each heading is an obstacle; (X) is its level
**Chase Points** 4                           <-- optional
The ceiling is coming down...
@Check[athletics|dc:20] Shove through the rubble
@Check[acrobatics|dc:18] Dive between falling stones
**Options** Spend a spell slot to shore up the ceiling.

### Bramble Maze (4)
...
```

- **Obstacles:** every heading after the title starts one, in order. A trailing `(X)` on the heading sets its level.
- **Chase Points:** `**Chase Points** X` or `X Chase Points`. If you leave it out, each obstacle needs one point fewer than the party size.
- **Checks:** any paragraph or bullet with an inline check.
- **Options:** `**Options**` lead-in, for non-check ways past the obstacle, such as using the fly spell to bypass a crowd. Normal inline links work, so you can link any spell or ability you want.
- The chase type (run away, chase down, beat the clock, competitive), the opponent's pace and the round limit are set in the subsystems window, not on the journal page.

<img width="3097" height="1125" alt="image" src="https://github.com/user-attachments/assets/9d6d1c0b-3d5b-43f0-aa1d-3b987a76427e" />

---

### Infiltration

```
## The Gilded Ledger                         <-- title (one infiltration per page)

Setup text...

## Objective 1: Get Inside                   <-- H2 containing "Objective" starts an objective
**Required** 2                               <-- optional: obstacles needed to clear it

### Front Door Guards                        <-- H3 under an objective is an obstacle
**Infiltration Points** 2 (individual)       <-- points and individual/group (default 1, group)
@Check[deception|dc:20] Pose as a courier
@Check[stealth|dc:22] Slip past
**Critical Failure** The guards raise the alarm (+2 AP).

## Complications                             <-- H3s under this are complications
### Patrol Doubles Back
**Trigger** The first time the PCs reach 5 AP     <-- "X AP" ties it to that threshold
@Check[deception|dc:20]
**Success** The patrol moves on.
**Failure** They get suspicious (+1 AP).
**Critical Failure** They sound the alarm (+2 AP).

## Opportunities                             <-- H3s under this are opportunities
### Bribed Porter
**Requirements** The PCs paid off the porter earlier.
@Check[diplomacy|dc:16]

## Awareness                                 <-- optional; default is 5/10/15/20, and a general rule of thumb is to make the max awareness double the Infiltration Points required to succeed.
**5 AP** Obstacle DCs increase by 1.
**10 AP** Computers and Deception DCs increase by 2.
**15 AP** Obstacle DCs increase by a total of 2.
**20 AP** The infiltration fails.
```

- **Objectives:** H2 headings with "Objective" in them, in order. `**Required** X` sets how many of its obstacles a PC must clear to move on (default 1).
- **Obstacles:** H3 headings under an objective. `**Infiltration Points** X (individual|group)` sets the points needed and whether each PC clears it separately. The published one-line form `**Infiltration Points** 1 (individual); **Overcome** <checks>` also works.
- **Complications:** H3s under a `## Complications` heading, with a `**Trigger**`, checks, and `**Critical Success**` / `**Success**` / `**Failure**` / `**Critical Failure**` outcomes. A trigger that mentions "X AP" raises an alert when awareness reaches that value.
- **Opportunities:** H3s under a `## Opportunities` heading, with optional `**Requirements**` and checks.
- **Awareness:** `**X AP**` (or `X Awareness Points`) lines under `## Awareness`. Text like "DCs increase by 1" or "by a total of 2" raises check DCs, and naming skills ("Computers and Deception DCs") limits the increase to them. The threshold that mentions failing, or the last one, ends the infiltration. Leave the section out to use the default 5/10/15/20 values.
- Starting Edge Points and Awareness Points are set by the GM in the window.
- Because each character can be at a different point in the infiltration, each party member can be selected to see what stage they're at and list the relevant obstacles for them.

<img width="3010" height="1900" alt="image" src="https://github.com/user-attachments/assets/7ef4d4a1-023e-4344-a849-57a9ed235ff4" />

---

### Hacking (Starfinder 2e)

Only available when the system has the Computers skill (SF2e or PF2e + SF2e Anachronism).

```
## Corvane Logistics Terminal                <-- title (one computer per page)

Description...

### Office Console                           <-- each later heading is an access point
**Access** physical; 2 Successes; @Check[computers|dc:22] (trained) Minimum DC 18
**Vulnerability** Sticky note under the keyboard @Check[perception|dc:16]; -2
**Vulnerability** Chat up the night clerk @Check[diplomacy|dc:20]; -1
**Countermeasure: Lockout (2 Failures)** The terminal locks for 1 minute.
**Notice** @Check[perception|dc:18]
**Disable** @Check[computers|dc:22] @Check[thievery|dc:24]

### Remote Freight Portal
**Access** remote; 3 Successes; @Check[computers|dc:24] (expert)
**Countermeasure: Trace Program (2 Failures; persistent)** A trace closes in...
**Notice** @Check[computers|dc:20]
**Disable** @Check[computers|dc:26]

**Critical Success** As success, and the PCs reroute the crate.
**Success** The PCs find the manifest.
```

- **Access points:** every heading after the title starts one. `**Access** physical|remote; N Successes; <checks>` sets its type, the successes needed, and the Hack checks. Add `Minimum DC N` to stop vulnerabilities lowering the DC past that point. The published form `**Name** (remote; 2 Successes) <checks>` also works.
- **Vulnerabilities:** `**Vulnerability** Name <checks>; -X`, one per line (or as a list under a `**Vulnerabilities**` label). When marked exploited, the access point's Hack DCs drop by X.
- **Countermeasures:** `**Countermeasure (X Failures)**`, optionally named (`**Countermeasure: Trace (2 Failures; persistent)**`). It triggers when the access point reaches X failures. `persistent` ones trigger again each round until disabled. Follow it with `**Notice**` and `**Disable**` lines. The published inline form (`effect. **Notice** ...; **Disable** ...`) also works.
- **Outcomes:** `**Critical Success**` and `**Success**` anywhere on the page. A critical success is twice the required successes on one access point, or hacking more than one.

<img width="3061" height="1873" alt="image" src="https://github.com/user-attachments/assets/16a90683-16d6-49ad-b3bc-bcab8954380a" />
