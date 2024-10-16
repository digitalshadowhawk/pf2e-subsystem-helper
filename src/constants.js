const constants = {
    ID : "pf2e-subsystem-helper",
	FLAGS : {
		SUBSYSTEMS: 'subsystems',
		LIBRARIES: 'libraries',
		REPUTATIONS: 'reputations',
		SOURCES: 'sources',
		THRESHOLDS: 'thresholds',
		CHECKS: 'checks',
		CHASES: 'chases',
		CHASEOBSTACLES: 'chaseobstacles',
		NPCS: 'npcs',
		INFILTRATIONS: 'infiltrations',
		INFILTRATIONOBSTACLES: 'infiltrationobstacles',
		INFILTRATIONPOINTS: 'infiltrationpoints',
		COMPLICATIONS: 'complications',
		COUNTERS: 'counters',
		CONTAINERSTATE: 'containerstate'
	},

	DCS: {
		0:14,1:15,2:16,3:18,4:19,5:20,6:22,7:23,8:24,9:26,10:27,11:28,12:30,13:31,14:32,15:34,16:35,17:36,18:38,19:39,20:40,21:42,22:44,23:46,24:48,25:50
	},

	ADJUSTMENTS: {
		INCREDIBLYEASY: -10,
		VERYEASY: -5,
		EASY: -2,
		STANDARD: 0,
		HARD: 2,
		VERYHARD: 5,
		INCREDIBLYHARD: 10
	},

	REPUTATIONS: {
		LEVELS: {
			REVERED: {
				LABEL: "Revered",
				LOWER: 30,
				UPPER: 50,
				RAISED: "Major favor",
				LOWERED: "Moderate or major disservice",
				EFFECT: "The group reveres the PCs as heroes and celebrities. Every member has heard of the PCs, is helpful toward them, and would take major risks to assist them. Only major favors accrue Reputation Points, and only moderate or major disservices can reduce them."
			},
			ADMIRED: {
				LABEL: "Admired",
				LOWER: 15,
				UPPER: 29,
				RAISED: "Major favor",
				LOWERED: "Any disservice",
				EFFECT: "The PCs have earned this group's admiration. The majority of the group knows about the PCs and have an extremely favorable opinion toward them. Many members of the group are helpful toward the PCs, and those who aren't are friendly. Only major favors accrue Reputation Points."
			},
			LIKED: {
				LABEL: "Liked",
				LOWER: 5,
				UPPER: 14,
				RAISED: "Moderate or major favor",
				LOWERED: "Any disservice",
				EFFECT: "The PCs have gained this group's favor. Many members of the group know about the PCs, and those who do are usually friendly to them. At this reputation, only moderate and major favors accrue Reputation Points; it takes more to impress the group further."
			},
			IGNORED: {
				LABEL: "Ignored",
				LOWER: -4,
				UPPER: 4,
				RAISED: "Any favor",
				LOWERED: "Any disservice",
				EFFECT: "The PCs either aren't on this group's radar or the group knows about the PCs but is generally ambivalent toward them. This carries no special benefits or detriments."
			},
			DISLIKED: {
				LABEL: "Disliked",
				LOWER: -14,
				UPPER: -5,
				RAISED: "Any favor",
				LOWERED: "Moderate or major disservice",
				EFFECT: "The PCs have a poor reputation among members of this group. Many members of the group know about the PCs, and are usually unfriendly to them. At this reputation, only moderate and major disservices reduce Reputation Points."
			},
			HATED: {
				LABEL: "Hated",
				LOWER: -29,
				UPPER: -15,
				RAISED: "Any favor",
				LOWERED: "Major disservice",
				EFFECT: "The PCs have earned this group's ire. The vast majority of the group knows about the PCs and have an extremely unfavorable opinion toward them. Many members of the group are hostile toward the PCs, and those who aren't are unfriendly. When presented an easy opportunity to hurt the PCs, the group will jump at the chance. Only major disservices can still reduce Reputation Points."
			},
			HUNTED: {
				LABEL: "Hunted",
				LOWER: -30,
				UPPER: -30,
				RAISED: "Moderate or major favor",
				LOWERED: "Major disservice",
				EFFECT: "The group actively hunts the PCs as scapegoats or nemeses, even at significant cost to itself. Every member has heard of the PCs, is hostile toward them, and would take major risks to thwart or destroy them. Only major disservices can still reduce Reputation Points, and only moderate or major favors can increase them."
			}
		},
		SERVICES: {
			MINOR: "Minor favors are simple, basic tasks that don't take too much effort for a PC to perform or much time at the table. Minor favors grant 1 Reputation Point.",
			MODERATE: "Moderate favors require a significant amount of effort and often take up a session or a noticeable chunk of a single session to complete. Moderate favors grant 2 Reputation Points.",
			MAJOR: "Major favors are a sizable endeavor, typically an entire quest involving several sessions. Major favors grant 5 Reputation Points."
		},
		DISSERVICES: {
			MINOR: "Minor disservices could be small but significant missteps, or accumulated slights and inconveniences. Minor disservices take away 1 Reputation Point.",
			MODERATE: "Moderate disservices are more than just a nuisance or annoyance, generally significantly hindering the group's efforts or violating a fundamental tenet of the group's beliefs in a significant but not egregious way. Moderate disservices take away 2 Reputation Points.",
			MAJOR: "Major disservices are incredibly antagonistic to a group, usually a single brazen act, such as thwarting a cult's apocalyptic doomsday plan. Major disservices take away at least 5 Reputation Points, or more if they are particularly egregious. They might be so terrible that the PCs immediately lose all their Reputation Points and then lose 5 more Reputation Points."
		}
    }
}

export { constants };