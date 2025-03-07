/**
 * FtHoF Planner v6b
 * grimoire.ts
 *
 * types, functions about simulating FtHoF, GFD
 */

import {
	EffectName, SpellName,
	choose, chooseWith, M_spells,
	cookieEffectNameToDescription,
	Math_seedrandom,
} from "./game_related_data.js";

import {
	gcImageUrl, wcImageUrl,
	heartImageUrl, bunnyImageUrl,
	spellNameToIconUrl,
} from "./image_file_paths.js";

import { Settings } from "./settings";


// type definition

/** result of spell cast */
type SpellCastResult = {
	// name of FtHoF effect, GFD spell
	name: EffectName | SpellName;

	/** name to display */
	displayName: string;

	/** whether this cast will be success */
	isWin: boolean;

	/** image URL to display */
	image: string;

	/** tooltip string to show */
	tooltip: string | undefined;

	/** whether this cast results noteworthy FtHoF effect */
	noteworthy: boolean;

	/** whether this cast results can be part of a combo */
	isCombo: boolean;
};

/** result of FtHoF */
export type FthofResult = SpellCastResult & {
	/** name of FtHoF effect */
	name: EffectName;
};

/** result of GFD */
export type GfdResult = SpellCastResult & {
	/** name of GFD spell */
	name: SpellName;


	/** whether this GFD has BS */
	hasBs: boolean;

	/** whether this GFD has EF */
	hasEf: boolean;

	/** whether this GFD can be skipped */
	canSkip: boolean;


	/** FtHoF result with No Change */
	cookie0?: FthofResult;

	/** GC with No Change */
	gc0?: FthofResult;

	/** WC with No Change */
	wc0?: FthofResult;

	/** FtHoF result with One Change */
	cookie1?: FthofResult;

	/** GC with One Change */
	gc1?: FthofResult;

	/** WC with One Change */
	wc1?: FthofResult;


	/** random number of Spontaneous Edifice */
	spontaneousEdificeRandomNumber?: number;
};

/**
 * set of grimoire spell cast result
 *
 * All values in this set are uniquely derived from seed and total spell cast count.
 */
export type GrimoireResult = {
	/** number of list that shown as "#1" */
	num: number;

	/** first result of Math.random() after seedrandom */
	firstRandomNum: number;

	/** minimum count of GC/WC on screen that changes GC to WC */
	wcThreshold: number;


	/** whether FtHoF result is success */
	isFthofWin: boolean;

	/** FtHoF result with No Change */
	cookie0: FthofResult;

	/** GC with No Change */
	gc0: FthofResult;

	/** WC with No Change */
	wc0: FthofResult;

	/** whether hidden GC/WC with No Change has good effect */
	isOtherCookieNotable0: boolean;

	/** FtHoF result with One Change */
	cookie1: FthofResult;

	/** GC with One Change */
	gc1: FthofResult;

	/** WC with One Change */
	wc1: FthofResult;

	/** whether hidden GC/WC with One Change has good effect */
	isOtherCookieNotable1: boolean;


	/** GFD result */
	gfd: GfdResult;


	/** whether FtHoF / GFD can be part of a combo */
	isCombo: boolean;

	/** whether GFD can be skipped */
	isSkip: boolean;

	/** whether Sugar Lump can be get */
	isSugar: boolean;
};


/** Settings used in FtHoF, GFD */
let settings: Settings;


/**
 * update settings data used in grimoire
 *
 * @param $grimoireSettings Settings data used in grimoire
 */
export const updateGrimoreSettings = (grimoireSettings: Settings) => {
	settings = grimoireSettings;
};


/**
 * calculate base fail chance of FtHoF
 * (without considering count of GCs on screen)
 *
 * simulating: minigameGrimoire.js v2.052
 *             > M.getFailChance (L289)
 *
 * @returns fail chance of FtHoF
 */
export const getBaseFailChance = (): number => {
	// calc auraSI effect in advance
	// Game.auraMult('Supreme Intellect') (L294 > main.js L14877)
	let auraSIMult = 0;
	if (settings.auraSI) auraSIMult = 1;
	if (settings.auraRB) auraSIMult += 0.1;

	// calc fail chance with zero screen GC
	let failChance = 0.15;
	if (settings.buffDI) failChance *= 0.1;  // Diminish Ineptitude Buff
	if (settings.debuffDI) failChance *= 5;  // Diminish Ineptitude Debuff
	failChance *= 1 + 0.1 * auraSIMult;      // Supreme Intellect Aura
	return failChance;
};


/**
 * calculate fail chance of FtHoF
 *
 * simulating: minigameGrimoire.js v2.052
 *             > M.getFailChance (L289)
 *             > M.spells['hand of fate'].failFunc() (L295 > L46)
 *
 * @param baseFailChance
 * @returns fail chance of FtHoF
 */
export const getFthofFailChance = (baseFailChance?: number): number => {
	const failChance = (
		(baseFailChance || getBaseFailChance())
		+ 0.15 * settings.screenCookieCount  // (L295 > L46)
	);
	return failChance;
};


/**
 * determine whether effect can be part of a combo
 *
 * @param effect effect name or names
 */
const canCombo = (effect: EffectName | EffectName[]): boolean => {
	const effectNames = Array.isArray(effect) ? effect : [effect];
	const can = effectNames.some((effectName) => (
		effectName == "Building Special"
		|| (settings.includeEF && effectName == "Elder Frenzy")
	));
	return can;
};


/**
 * get cast result object of FtHoF
 *
 * simulating: minigameGrimoire.js v2.052
 *             > M.castSpell (L299)
 *             > spell.win(), spell.fail() (L313 > L48, 66)
 *
 * @param seed five-letter string like "abcde" used as a seed in game
 * @param spellsCastTotal total spell cast count before this cast
 * @param offset additional spell count from base spellsCastTotal
 * @param isOneChange true if one change
 * @param forceCookie "GC": force GC, "WC": force WC, default: roll with Math.random()
 * @returns FtHoF cast result
 */
export const castFtHoF = (
	seed: string,
	spellsCastTotal: number,
	offset: number,
	isOneChange: boolean,
	forceCookie?: "GC" | "WC",
): FthofResult => {
	// set seed (L312)
	Math_seedrandom(seed + "/" + (spellsCastTotal + offset));

	// get fail chance (L307 > L289)
	const failChance = (() => {
		// return 0.0 or 1.0 if forced
		if (forceCookie == "GC") return 0.0;
		if (forceCookie == "WC") return 1.0;

		// calculate failChance (same as L289)
		return getFthofFailChance();
	})();

	// roll for casting result (L313)
	const isWin = (!true || Math.random() < (1 - failChance));

	// spell.win() or spell.fail() is called at this point
	//   M.spells > 'hand of fate' > win (L48), fail (L66)
	//   > new Game.shimmer('golden',{*:true}) (L50, L68)
	// and Math.random() is called in main.js
	//   Game.shimmer > this.init(); (main.js L5215)
	//   > Game.shimmerTypes[this.type].initFunc(this); (main.js L5223)
	//   > Game.shimmerTypes > 'golden' > initFunc (main.js L5320)

	// call Math.random() for chime (main.js L5322 > main.js L917)
	// this call is no longer active: L885
	//if (chime && $scope.ascensionMode != 1) Math.random();

	// determine cookie image (L5329)
	// if season is valentines or easter, Math.random() is called (main.js L5343, main.js L5353)
	let imageUrl = isWin ? gcImageUrl : wcImageUrl;
	if (isOneChange) {
		const random = Math.random();

		// determine cookie image
		const season = settings.season;
		if (season == "valentines") {
			const imageIndex = Math.floor(random * 8);
			imageUrl = heartImageUrl(imageIndex);
		} else if (season == "easter") {
			const imageIndex = Math.floor(random * 4);
			imageUrl = bunnyImageUrl(!isWin, imageIndex);
		}
	}

	// determine X and Y position to spawn (main.js L5358, main.js L5359)
	Math.random();
	Math.random();

	// initializing GC/WC finished, back to spell.win() or spell.fail()

	// results of Math.random()
	const random1 = Math.random();
	const random2 = Math.random();
	const random3 = Math.random();
	const random4 = Math.random();

	// choices of GC/WC effect name
	let choices: EffectName[] = [];

	// choose cookie effect
	let effectName: EffectName;
	if (isWin) {
		// choices of golden cookie (L52)
		choices.push("Frenzy", "Lucky");
		if (!settings.buffDF) choices.push("Click Frenzy");
		if (random1 < 0.1) choices.push("Cookie Storm", "Cookie Storm", "Blab");
		if (random2 < 0.25) choices.push("Building Special");  // Game.BuildingsOwned>=10 is ignored
		if (random3 < 0.15) choices = ["Cookie Storm Drop"];
		if (random4 < 0.0001) choices.push("Free Sugar Lump");
		effectName = choose(choices);

		// do something if there is a chance to win Free Sugar Lump
		if (random3 < 0.0001 && random4 >= 0.5) {
			let choicesIf: EffectName[] = [];
			choicesIf.push("Frenzy", "Lucky");
			if (!settings.buffDF) choicesIf.push("Click Frenzy");
			if (random1 < 0.1) choicesIf.push("Cookie Storm", "Cookie Storm", "Blab");
			//if (random2 < 0.25) choicesIf.push("Building Special");  // can omit with few buildings
			if (random2 < 0.15) choicesIf = ["Cookie Storm Drop"];
			if (random3 < 0.0001) choicesIf.push("Free Sugar Lump");
			const chosen = chooseWith(choicesIf, random4);
			if (chosen == "Free Sugar Lump") {
				// only logging for now
				console.log("Free Sugar Lump with few building!!");
				console.log("seedrandom: " + (seed + "/" + (spellsCastTotal + offset)));
			}
		}

		// There is an additional Math.random() in L62,
		// but this doesn't affect the result because choice is done.
		//if (effectName == "Cookie Storm Drop") Math.random();

	} else {
		// choices of red cookie (L70)
		choices.push("Clot", "Ruin");
		if (random1 < 0.1) choices.push("Cursed Finger", "Elder Frenzy");
		if (random2 < 0.003) choices.push("Free Sugar Lump");
		if (random3 < 0.1) choices = ["Blab"];
		effectName = chooseWith(choices, random4);
	}

	// set description
	const description = cookieEffectNameToDescription[effectName];
	if (!description) console.error("No description in dictionary: " + effectName);

	// add noteworthy info
	let noteworthy = false;
	if (effectName == "Building Special") noteworthy = true;
	if (effectName == "Elder Frenzy") noteworthy = true;

	// determine whether can be part of combo
	const isCombo = canCombo(effectName);

	// return FtHoF cast result
	const fthofResult: FthofResult = {
		name: effectName,
		displayName: effectName,
		isWin,
		image: imageUrl,
		tooltip: description,
		noteworthy,
		isCombo,
	};
	return fthofResult;
};


/**
 * determine whether passed FtHoF results have one of passed effects
 *
 * @param cookies array of FthofResults to see
 * @param effect effect name or names
 * @returns true if have
 */
export const hasCookieEffect = (
	cookies: FthofResult[],
	effect: EffectName | EffectName[],
): boolean => {
	const effectNames = (typeof effect == "string" ? [effect] : effect);
	for (const cookie of cookies) {
		for (const effectName of effectNames) {
			if (cookie.name == effectName) return true;
		}
	}
	return false;
};


/**
 * make a string for tooltip of GFD
 * (e.g. "#2: Lucky / Ruin")
 *
 * @param gfdResult result object of GFD
 * @param offset distance of target child spell from base spellsCastTotal
 */
const makeGfdTooltip = (gfdResult: GfdResult, offset: number): string | undefined => {
	// return undefined for AngularJS to show nothing
	if (gfdResult.name != "Force the Hand of Fate") {
		if (gfdResult.name != "Spontaneous Edifice") return undefined;

		// make tooltip for SE
		const seTooltip = (
			"random number for SE is "
			+ gfdResult.spontaneousEdificeRandomNumber?.toFixed(4)
		);
		return seTooltip;
	}

	const numStr = "#" + (offset + 1);  // convert to natural number
	const cookie0Str = gfdResult.cookie0?.name || "";
	const cookie1Str = gfdResult.cookie1?.name || "";
	const halfTitle = numStr + ": " + cookie0Str;
	if (settings.season == "noswitch") return halfTitle;

	const fullTitle = halfTitle + " / " + cookie1Str;
	return fullTitle;
};


/**
 * get cast result object of Gambler's Fever Dream
 *
 * simulating: minigameGrimoire.js v2.052
 *             > M.castSpell (L299)
 *             > spell.win() (L313 > L195)  note: GFD itself always win
 *             > setTimeout(... M.castSpell ...) (L206 > L299)
 *
 * @param seed five-letter string like "abcde" used as a seed in game
 * @param spellsCastTotal total spell cast count before this cast
 * @param offset additional spell count from base spellsCastTotal
 * @returns GFD cast result
 */
export const castGFD = (
	seed: string,
	spellsCastTotal: number,
	offset: number,
): GfdResult => {
	// single season option
	const isSingleSeason = (settings.season == "noswitch");

	// set seed for GFD spell selection (L312)
	Math_seedrandom(seed + "/" + (spellsCastTotal + offset));

	// make spells list that GFD can cast with max MP (L199)
	const spells = [];
	for (const spellKey in M_spells) {
		if (spellKey != "gambler's fever dream") spells.push(M_spells[spellKey]);
	}

	// choose a spell to be cast (L202)
	const castSpell = choose(spells);
	const castSpellName = castSpell.name;

	// chance of GFD backfire (L206 > L299 > L311)
	// note1: **code behavior differs from description!!**
	// note2: increases above 0.5 only if DI debuff is active
	const gfdBackfire = Math.max(getBaseFailChance(), 0.5);

	// set seed for child spell that is cast by GFD (L312)
	// note: this seed may change with continuous GFD casts (spellsCastTotal increases)
	Math_seedrandom(seed + "/" + (spellsCastTotal + offset + 1));

	// roll for casting result (L313)
	const isChildSpellWin = Math.random() < (1 - gfdBackfire);

	// return object
	const gfdResult: GfdResult = {
		name: castSpellName,
		displayName: castSpellName,
		isWin: isChildSpellWin,
		image: spellNameToIconUrl[castSpellName],
		tooltip: undefined,
		noteworthy: false,
		isCombo: false,

		hasBs: false,
		hasEf: false,
		canSkip: false,
	};

	// set the result of child spells called by GFD
	if (castSpellName == "Force the Hand of Fate") {
		// cast FtHoF, set to return object
		const gc0 = castFtHoF(seed, spellsCastTotal, offset + 1, false, "GC");
		const gc1 = castFtHoF(seed, spellsCastTotal, offset + 1, true, "GC");
		const wc0 = castFtHoF(seed, spellsCastTotal, offset + 1, false, "WC");
		const wc1 = castFtHoF(seed, spellsCastTotal, offset + 1, true, "WC");
		const cookie0 = isChildSpellWin ? gc0 : wc0;
		const cookie1 = isChildSpellWin ? gc1 : wc1;

		// set to return object
		gfdResult.cookie0 = cookie0;
		gfdResult.cookie1 = cookie1;
		gfdResult.gc0 = gc0;
		gfdResult.wc0 = wc0;
		gfdResult.gc1 = gc1;
		gfdResult.wc1 = wc1;

		// determine child FtHoF result can be a part of combo
		const availableCookies = [cookie0, ...(isSingleSeason ? [] : [cookie1])];
		if (isChildSpellWin) {
			const hasBs = hasCookieEffect(availableCookies, "Building Special");
			if (hasBs) {
				gfdResult.hasBs = true;
				gfdResult.noteworthy = true;
			}
			const isCombo = canCombo(availableCookies.map(fthof => fthof.name));
			gfdResult.isCombo = isCombo;
		} else {
			const hasEf = hasCookieEffect(availableCookies, "Elder Frenzy");
			if (hasEf) {
				gfdResult.hasEf = true;
				gfdResult.noteworthy = true;
			}
			const isCombo = canCombo(availableCookies.map(fthof => fthof.name));
			gfdResult.isCombo = isCombo;
		}

	} else if (castSpellName == "Spontaneous Edifice") {
		// add result of SE

		// get random number when choosing building (L134, L144)
		const secondRandomNumber = Math.random();

		// set to GFD result object
		gfdResult.spontaneousEdificeRandomNumber = secondRandomNumber;
	}

	// determine child FtHoF result can be a part of combo
	if (
		castSpellName == "Resurrect Abomination"
		|| (castSpellName == "Spontaneous Edifice" && isChildSpellWin)
		|| (castSpellName == "Stretch Time")
	) {
		gfdResult.canSkip = true;
	}

	// make a tooltip string
	const tooltip = makeGfdTooltip(gfdResult, offset + 1);
	gfdResult.tooltip = tooltip;

	// return GFD result object
	return gfdResult;
};
