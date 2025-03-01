/// <reference path="../lib/seedrandom.js" />
// @ts-check
/**
 * objects or functions that related to the Cookie Clicker game JavaScript file
 */


// type definition
/**
 * @typedef {object} M_Spell
 * @property {string} name
 * @property {string} desc
 * @property {string=} failDesc
 * @property {[number, number]} icon
 * @property {number} costMin
 * @property {number} costPercent
 * @property {Function=} failFunc
 * @property {Function} win
 * @property {Function=} fail
 */


/**
 * wrapper of Math.seedrandom(seed)
 *
 * @param {string} seed seed string
 * @returns {string} Math.seedrandom(seed)
 */
export const Math_seedrandom = (seed) => Math["seedrandom"](seed);


/**
 * function choose() from Cookie Clicker main.js (L17)
 * choose one randomly from arr
 *
 * @template T
 * @param {T[]} arr
 * @returns {T} chosen item
 */
export const choose = (arr) => arr[Math.floor(Math.random() * arr.length)];


/**
 * function choose() that can specify Math.random() result manually
 *
 * @template T
 * @param {T[]} arr
 * @param {number} Math_random random number of Math.random()
 * @returns {T} chosen item
 */
export const chooseWith = (arr, Math_random) => arr[Math.floor(Math_random * arr.length)];


/**
 * M.spells from minigameGrimoire.js
 * (not same as v2.052)
 *
 * @type { {[key: string]: M_Spell} }
 */
export const M_spells = {
	'conjure baked goods': {
		name: 'Conjure Baked Goods',
		desc: 'Summon half an hour worth of your CpS, capped at 15% of your cookies owned.',
		failDesc: 'Trigger a 15-minute clot and lose 15 minutes of CpS.',
		icon: [21, 11],
		costMin: 2,
		costPercent: 0.4,
		win: function () {
			// removed (not used in this file)
		},
		fail: function () {
			// removed (not used in this file)
		},
	},
	'hand of fate': {
		name: 'Force the Hand of Fate',
		desc: 'Summon a random golden cookie. Each existing golden cookie makes this spell +15% more likely to backfire.',
		failDesc: 'Summon an unlucky wrath cookie.',
		icon: [22, 11],
		costMin: 10,
		costPercent: 0.6,
		failFunc: function (fail) {
			// removed (not used in this file)
		},
		win: function () {
			// removed (not used in this file)
		},
		fail: function () {
			// removed (not used in this file)
		},
	},
	'stretch time': {
		name: 'Stretch Time',
		desc: 'All active buffs gain 10% more time (up to 5 more minutes).',
		failDesc: 'All active buffs are shortened by 20% (up to 10 minutes shorter).',
		icon: [23, 11],
		costMin: 8,
		costPercent: 0.2,
		win: function () {
			// removed (not used in this file)
		},
		fail: function () {
			// removed (not used in this file)
		},
	},
	'spontaneous edifice': {
		name: 'Spontaneous Edifice',
		desc: 'The spell picks a random building you could afford if you had twice your current cookies, and gives it to you for free. The building selected must be under 400, and cannot be your most-built one (unless it is your only one).',
		failDesc: 'Lose a random building.',
		icon: [24, 11],
		costMin: 20,
		costPercent: 0.75,
		win: function () {
			// removed (not used in this file)
		},
		fail: function () {
			// removed (not used in this file)
		},
	},
	'haggler\'s charm': {
		name: 'Haggler\'s Charm',
		desc: 'Upgrades are 2% cheaper for 1 minute.',
		failDesc: 'Upgrades are 2% more expensive for an hour.<q>What\'s that spell? Loadsamoney!</q>',
		icon: [25, 11],
		costMin: 10,
		costPercent: 0.1,
		win: function () {
			// removed (not used in this file)
		},
		fail: function () {
			// removed (not used in this file)
		},
	},
	'summon crafty pixies': {
		name: 'Summon Crafty Pixies',
		desc: 'Buildings are 2% cheaper for 1 minute.',
		failDesc: 'Buildings are 2% more expensive for an hour.',
		icon: [26, 11],
		costMin: 10,
		costPercent: 0.2,
		win: function () {
			// removed (not used in this file)
		},
		fail: function () {
			// removed (not used in this file)
		},
	},
	'gambler\'s fever dream': {
		name: 'Gambler\'s Fever Dream',
		desc: 'Cast a random spell at half the magic cost, with twice the chance of backfiring.',
		icon: [27, 11],
		costMin: 3,
		costPercent: 0.05,
		win: function () {
			// removed (not used in this file)
		},
	},
	'resurrect abomination': {
		name: 'Resurrect Abomination',
		desc: 'Instantly summon a wrinkler if conditions are fulfilled.',
		failDesc: 'Pop one of your wrinklers.',
		icon: [28, 11],
		costMin: 20,
		costPercent: 0.1,
		win: function () {
			// removed (not used in this file)
		},
		fail: function () {
			// removed (not used in this file)
		},
	},
	'diminish ineptitude': {
		name: 'Diminish Ineptitude',
		desc: 'Spells backfire 10 times less for the next 5 minutes.',
		failDesc: 'Spells backfire 5 times more for the next 10 minutes.',
		icon: [29, 11],
		costMin: 5,
		costPercent: 0.2,
		win: function () {
			// removed (not used in this file)
		},
		fail: function () {
			// removed (not used in this file)
		},
	},
};


/**
 * Spell names that can be cast in the minigame.
 *
 * @type {string[]}
 */
export const spellNames = Object.values(M_spells).map(spell => spell.name);


/**
 * Spell names that can be cast with GFD.
 * (omitted GFD itself)
 *
 * @type {string[]}
 */
export const gfdSpellNames = spellNames.filter(name => name != "Gambler's Fever Dream");


/**
 * cookie effect description dictionary
 *
 * @type { { [key: string]: string } }
 */
export const cookieEffectNameToDescription = {
	"Frenzy":
		"Gives x7 cookie production for 77 seconds.",
	"Lucky":
		"Gain 13 cookies plus the lesser of 15% of bank or 15 minutes of production.",
	"Click Frenzy":
		"Gives x777 cookies per click for 13 seconds.",
	"Cookie Storm":
		"A massive amount of Golden Cookies appears for 7 seconds, each granting you 1–7 minutes worth of cookies.",
	"Cookie Storm Drop":
		"Gain cookies equal to 1-7 minutes production",
	"Building Special":
		"Get a variable bonus to cookie production for 30 seconds.",

	"Clot":
		"Reduce production by 50% for 66 seconds.",
	"Ruin":
		"Lose 13 cookies plus the lesser of 5% of bank or 15 minutes of production",
	"Cursed Finger":
		"Cookie production halted for 10 seconds, but each click is worth 10 seconds of production.",
	"Elder Frenzy":
		"Gives x666 cookie production for 6 seconds",

	"Blab":
		"Does nothing but has a funny message.",
	"Free Sugar Lump":
		"Add a free sugar lump to the pool",
};
