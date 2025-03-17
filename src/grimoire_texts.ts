/**
 * FtHoF Planner v6b
 * grimoire_texts.ts
 *
 * functions about FtHoF Planner result texts
 */

import {
	EffectName, SpellName,
} from "./game_related_data.js";

import { GfdResult } from "./grimoire.js";

import { settings } from "./settings.js";

import { langDict } from "./translate.js";


/**
 * cookie effect description dictionary
 */
export const cookieEffectNameToDescription: { [key in EffectName]: string } = {
	"Frenzy":
		"Gives x7 cookie production for 77 seconds. (max: 175sec)",
	"Lucky":
		"Gain 13 cookies plus the lesser of 15% of bank or 15 minutes of production.",
	"Click Frenzy":
		"Gives x777 cookies per click for 13 seconds. (max: 30sec)",
	"Cookie Storm":
		"A massive amount of Golden Cookies appears for 7 seconds (max: 15sec), each granting you 1–7 minutes worth of cookies.",
	"Cookie Storm Drop":
		"Gain cookies equal to 1-7 minutes production.",
	"Building Special":
		"Get a variable bonus to cookie production for 30 seconds. (max: 68sec)",

	"Clot":
		"Reduce production by 50% for 66 seconds. (max: 146sec)",
	"Ruin":
		"Lose 13 cookies plus the lesser of 5% of bank or 15 minutes of production.",
	"Cursed Finger":
		"Cookie production halted for 10 seconds (max: 22sec), but each click is worth 10 seconds (max: 22sec) of production.",
	"Elder Frenzy":
		"Gives x666 cookie production for 6 seconds. (max: 14sec)",

	"Blab":
		"Display a funny message.",
	"Free Sugar Lump":
		"Gain a free sugar lump.",
};


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
	//   GC: Frenzy, Click Frenzy, Building Special
	//   WC: Elder Frenzy
	//   both: Free Sugar Lump
	const uselessNames = [
		"Lucky", "Cookie Storm", "Cookie Storm Drop",
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

	// translate to local language
	const lang = settings.lang;
	converting = langDict[lang][effectName];

	// replace useless effect name to "----"
	converting = obscureUselessEffectName(converting, effectName);

	// replace Cookie Storm Drop to "Drop"
	if (settings.shortenCSDrop && effectName == "Cookie Storm Drop") {
		converting = langDict[lang]["Drop"];
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

	// translate to local language
	const lang = settings.lang;
	converting = langDict[lang][spellName];

	// replace useless spell name to "----"
	converting = obscureUselessSpellName(converting, spellName);

	// return converted name
	return converting;
};


/**
 * make a string for tooltip of GFD
 * (e.g. "#2: Lucky / Frenzy")
 *
 * @param gfdResult result object of GFD
 * @param offset distance of target child spell from base spellsCastTotal
 */
export const makeGfdTooltip = (gfdResult: GfdResult, offset: number): string | undefined => {
	// return undefined for AngularJS to show nothing
	if (gfdResult.name != "Force the Hand of Fate") {
		if (gfdResult.name != "Spontaneous Edifice") return undefined;

		// make tooltip for SE
		const seTooltipTemplate = "random number used to select the target building: %s";
		const seRandomNumberStr = gfdResult.spontaneousEdificeRandomNumber?.toFixed(4);
		const seTooltip = seTooltipTemplate.replace("%s", String(seRandomNumberStr));
		return seTooltip;
	}

	/**
	 * make translated effect name
	 *
	 * @param effectName effect name of FtHoF
	 * @returns translated effect name
	 */
	const makeLocalEffectName = (effectName: EffectName | ""): string => {
		if (!effectName) return effectName;
		const shortenCSDrop = (effectName == "Cookie Storm Drop" && settings.shortenCSDrop);
		const name = shortenCSDrop ? "Drop" : effectName;
		return langDict[settings.lang][name];
	};

	const numStr = "#" + (offset + 1);  // convert to natural number
	const cookie0Name = gfdResult.cookie0?.name || "";
	const cookie1Name = gfdResult.cookie1?.name || "";
	const cookie0LoaclName = makeLocalEffectName(cookie0Name);
	const cookie1LoaclName = makeLocalEffectName(cookie1Name);
	const halfTitle = numStr + ": " + cookie0LoaclName;
	if (settings.season == "noswitch") return halfTitle;

	const fullTitle = halfTitle + " / " + cookie1LoaclName;
	return fullTitle;
};
