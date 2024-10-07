* Add Subsystem Types as extending SubsystemTracker data type
* Add Settings to enable each subsystem individually
* add section on Party Sheet to store SubsystemTrackers

# Reputation SubsystemTracker implements VictoryPoints
* add reputation levels and coresponding point levels as constants
* add ReputationGroup class with two variables, name (String) and points (int) bounded by -50 to 50
* add an array of groups that the party has reputation with (this can also include individual NPCs, however I recommend using Influence instead)

# Influence SubsystemTracker
* add influence levels as constants
* add InfluenceActor class
* add an array of actors that the party has influence with

# Infiltration SubsystemTracker
* add objectives (String)
* add obstacles (infiltration points needed, checks and/or actions required to overcome, infiltration points earned)
* add counters for awareness points and edge points, with edge point notes
* add awareness threshholds and increase awareness button
* add complications (checks and/or actions to overcome)

# Research SubsystemTracker
* add libraries (ResearchCheck, ResearchThresholds, level, and totalRPEarned)
* add ResearchEntry (name, description, max RP, list of ResearchChecks, RP earned)
* add ResearchCheck? maybe use Foundry default @Check
* add ResearchThreshold (checks totalRPEarned)

# Chases SubsystemTracker
* add chase (array of obstacles, chase level)
* add obstacles (name, description, chase points required, obstacle level (relative or absolute))

# Generic Victory Points SubsystemTracker
* generalized point system, renameable, basis for all the others listed above
