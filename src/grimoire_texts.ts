/**
 * FtHoF Planner v6b
 * grimoire_texts.ts
 *
 * functions about FtHoF Planner result texts
 */

import {
	EffectName, SpellName,
} from "./game_related_data.js";

import { settings } from "./settings.js";

import { translate } from "./translate.js";


/**
 * replace string to "----"
 *
 * @param replaceFrom string to replace with "-"
 * @returns replaced string
 */
const obscureString = (replaceFrom: string): string => {
	// asian languages have twice width characters
	const isFullWidthLang = ["JA", "ZH-CN", "KO"].includes(settings.lang);
	const replaceTo = isFullWidthLang ? "－" : "-";

	// obscure
	return replaceFrom.replace(/[^ ']/g, replaceTo);
};


/**
 * replace useless GC/WC effect name to "----"
 *
 * @param displayName effect name to display (maybe converted)
 * @param effectName effect name (not converted, EN effect name)
 * @returns effect name replaced by "----"
 */
const obscureUselessEffectName = (displayName: string, effectName: EffectName): string => {
	// do nothing if not active
	if (!settings.hideUseless) return displayName;

	// effect names without...
	//   GC: Click Frenzy, Building Special
	//   WC: Elder Frenzy
	//   both: Free Sugar Lump
	const uselessNames = [
		"Frenzy", "Lucky", "Cookie Storm", "Cookie Storm Drop",
		"Clot", "Ruin", "Cursed Finger",
		"Blab",
	];

	// replace to "----"
	if (uselessNames.includes(effectName)) return obscureString(displayName);

	// not useless, so return original
	return displayName;
};


/**
 * replace useless GFD spell name to "----"
 *
 * @param displayName spell name to display (maybe converted)
 * @param spellName spell name (not converted, EN effect name)
 * @returns effect name replaced by "----"
 */
const obscureUselessSpellName = (displayName: string, spellName: SpellName): string => {
	// do nothing if not active
	if (!settings.hideUseless) return displayName;

	// spell names without FtHoF, skippable spells, GFD, Diminish Ineptitude
	const uselessNames = ["Conjure Baked Goods", "Haggler's Charm", "Summon Crafty Pixies"];

	// replace to "----"
	if (uselessNames.includes(spellName)) return obscureString(displayName);

	// not useless, so return original
	return displayName;
};


/**
 * make string for displaying FtHoF effect name
 *
 * @param effectName name of FtHoF effect for display
 * @returns string for display
 */
export const makeFthofDisplayName = (effectName: EffectName): string => {
	let converting: string;

	// translate if result display language is not EN
	const lang = settings.lang;
	converting = translate(effectName, lang);

	// replace useless effect name to "----"
	converting = obscureUselessEffectName(converting, effectName);

	// replace Cookie Storm Drop to "Drop"
	if (settings.shortenCSDrop && effectName == "Cookie Storm Drop") {
		converting = translate("Drop", lang);
		if (settings.hideUseless) converting = obscureString(converting);
	}

	// return converted name
	return converting;
};


/**
 * make string for displaying GFD spell name
 *
 * @param spellName name of GFD spell for display
 * @returns string for display
 */
export const makeGfdDisplayName = (spellName: SpellName): string => {
	let converting: string;

	// translate if result display language is not EN
	const lang = settings.lang;
	converting = translate(spellName, lang);

	// replace useless spell name to "----"
	converting = obscureUselessSpellName(converting, spellName);

	// return converted name
	return converting;
};
