/**
 * FtHoF Planner v6b
 * index.js
 *
 * FtHoF Planner main script file
 */


// import game related objects and functions
import {
	EffectName, SpellName,
	Math_seedrandom, choose, chooseWith, M_spells,
	cookieEffectNameToDescription,
} from "./game_related_data.js";

import {
	gcImageUrl, wcImageUrl,
	heartImageUrl, bunnyImageUrl,
	spellNameToIconUrl,
} from "./image_file_paths.js";

import {
	settingsModelNames,
	getSettings,
	saveSettings, loadSettings, initSettings,
} from "./settings.js";

import {
	loadSaveCodeFromLS,
	readSaveDataFromSaveCode,
} from "./save_code.js";

import {
	getSaveData,
	saveSaveData, loadSaveData, initSaveData,
} from "./save_data.js";


// type definition

/** result of FtHoF */
type FthofResult = {
	name: EffectName;
	isWin: boolean;
	image: string;

	description: string;
	noteworthy: boolean;
};

/** result of GFD */
type GfdResult = {
	name: SpellName;
	isWin: boolean;
	image: string;

	hasBs: boolean;
	hasEf: boolean;
	canCombo: boolean;
	canSkip: boolean;
	cookie0?: FthofResult;
	gc0?: FthofResult;
	wc0?: FthofResult;
	cookie1?: FthofResult;
	gc1?: FthofResult;
	wc1?: FthofResult;
	spontaneousEdificeRandomNumber?: number;
};

/**
 * set of grimoire spell cast result
 *
 * All values in this set are uniquely derived from seed and total spell cast count.
 */
type GrimoireResult = {
	num: number;
	firstRandomNum: number;
	wcThreshold: number;

	isFthofWin: boolean;
	cookie0: FthofResult;
	gc0: FthofResult;
	wc0: FthofResult;
	isOtherCookieNotable0: boolean;
	cookie1: FthofResult;
	gc1: FthofResult;
	wc1: FthofResult;
	isOtherCookieNotable1: boolean;

	gfd: GfdResult;

	isCombo: boolean;
	isSkip: boolean;
	isSugar: boolean;
};

/** one of findCombo() results */
type ComboResult = { idx: number, length: number };

/** findCombo() results to return */
type ComboResults = { shortest: ComboResult, first: ComboResult };


const app = window.angular.module("myApp", ["ngMaterial"]);
app.controller("myCtrl", ($scope): void => {
	// initialize Save Code
	$scope.saveCode = "";
	
	// initialize FtHoF save data
	initSaveData($scope);

	// initialize FtHoF Scope Variables
	$scope.baseBackfireChance = undefined;
	$scope.backfireChance = undefined;
	$scope.combos = [];
	$scope.sugarIndexes = [];
	$scope.grimoireResults = [];

	// initialize FtHoF settings
	initSettings($scope);


	// ready state flag
	$scope.ready = false;


	/**
	 * Select the save code input for easy pasting.
	 *
	 * @param event event fired with input left or right click
	 */
	const selectSaveCodeInput = (event: MouseEvent): void => {
		if (!(event.target instanceof HTMLInputElement)) return;
		event.target.select();
	};

	// add event listener for right click
	document.addEventListener("contextmenu", selectSaveCodeInput);


	/**
	 * log $scope (debug function)
	 */
	const printScope = (): void => {
		console.log($scope);
	};


	/**
	 * import save data from save code and update Grimoire result list
	 */
	const importSave = (): void => {
		readSaveDataFromSaveCode($scope);
		updateCookies();
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
	const getBaseFailChance = (): number => {
		let failChance = 0.15;
		if ($scope.buffDI) failChance *= 0.1;  // Diminish Ineptitude Buff
		if ($scope.debuffDI) failChance *= 5;  // Diminish Ineptitude Debuff
		failChance *= 1 + 0.1 * $scope.auraSI;  // TODO: Reality Bending x1.1
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
	const getFthofFailChance = (baseFailChance?: number): number => {
		const failChance = (
			(baseFailChance || getBaseFailChance())
			+ 0.15 * $scope.screenCookieCount  // (L295 > L46)
		);
		return failChance;
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
	 * @param isOneChange true if one change
	 * @param forceCookie "GC": force GC, "WC": force WC, default: roll with Math.random()
	 * @returns FtHoF cast result
	 */
	const castFtHoF = (
		seed: string,
		spellsCastTotal: number,
		isOneChange: boolean,
		forceCookie?: "GC" | "WC",
	): FthofResult => {
		// set seed (L312)
		Math_seedrandom(seed + "/" + spellsCastTotal);

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
			const season = $scope.season;
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
			if (!$scope.buffDF) choices.push("Click Frenzy");
			if (random1 < 0.1) choices.push("Cookie Storm", "Cookie Storm", "Blab");
			if (random2 < 0.25) choices.push("Building Special");  // Game.BuildingsOwned>=10 is ignored
			if (random3 < 0.15) choices = ["Cookie Storm Drop"];
			if (random4 < 0.0001) choices.push("Free Sugar Lump");
			effectName = choose(choices);

			// do something if there is a chance to win Free Sugar Lump
			if (random3 < 0.0001 && random4 >= 0.5) {
				let choicesIf: EffectName[] = [];
				choicesIf.push("Frenzy", "Lucky");
				if (!$scope.buffDF) choicesIf.push("Click Frenzy");
				if (random1 < 0.1) choicesIf.push("Cookie Storm", "Cookie Storm", "Blab");
				//if (random2 < 0.25) choicesIf.push("Building Special");  // can omit with few buildings
				if (random2 < 0.15) choicesIf = ["Cookie Storm Drop"];
				if (random3 < 0.0001) choicesIf.push("Free Sugar Lump");
				const chosen = chooseWith(choicesIf, random4);
				if (chosen == "Free Sugar Lump") {
					// only logging for now
					console.log("Free Sugar Lump with few building!!");
					console.log("seedrandom: " + (seed + "/" + spellsCastTotal));
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

		// return FtHoF cast result
		const fthofResult: FthofResult = {
			name: effectName,
			isWin,
			image: imageUrl,

			description: description,
			noteworthy: noteworthy,
		};
		return fthofResult;
	};


	/**
	 * find comboes from indexes
	 *
	 * @param comboLength target length of combo
	 * @param maxSpread number of max spread (padding; neither BS nor skip)
	 * @param comboIndexes indexes of buff (Building Special etc.)
	 * @param skipIndexes indexes of skippable GFD (Resurrect Abomination etc.)
	 * @returns found result
	 */
	const findCombos = (
		comboLength: number,
		maxSpread: number,
		comboIndexes: number[],
		skipIndexes: number[],
	): ComboResults => {
		// whether to output combos exceeding maxSpread
		const outputOverflowedCombo = false;

		// combo with the shortest length
		let shortestLength = 10000000;
		let shortestStartIndex = -1;

		// combo that appears first
		let firstLength = 10000000;
		let firstStartIndex = -1;

		// find combos that can cast in comboIndexes
		for (let i = 0; i + comboLength - 1 < comboIndexes.length; i++) {
			const seqStart = comboIndexes[i];
			const seqEnd = comboIndexes[i + comboLength - 1];
			const baseDistance = seqEnd - seqStart + 1;

			const skips = skipIndexes.filter(
				(index) => index > seqStart && index < seqEnd && !comboIndexes.includes(index)
			);

			const distance = baseDistance - skips.length;
			const isOverflowed = (distance > comboLength + maxSpread);
			if (firstStartIndex == -1 && !isOverflowed) {
				firstStartIndex = seqStart;
				firstLength = distance;
			}

			if (distance < shortestLength && (!isOverflowed || outputOverflowedCombo)) {
				shortestStartIndex = seqStart;
				shortestLength = distance;
			}
		}

		return {
			shortest: {idx: shortestStartIndex, length: shortestLength},
			first: {idx: firstStartIndex, length: firstLength}
		};
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
	 * @returns GFD cast result
	 */
	const castGFD = (seed: string, spellsCastTotal: number): GfdResult => {
		// single season option
		const isSingleSeason = ($scope.season == "noswitch");

		// set seed for GFD spell selection (L312)
		Math_seedrandom(seed + "/" + spellsCastTotal);

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
		Math_seedrandom(seed + "/" + (spellsCastTotal + 1));

		// roll for casting result (L313)
		const isChildSpellWin = Math.random() < (1 - gfdBackfire);

		// return object
		const gfdResult: GfdResult = {
			name: castSpellName,
			isWin: isChildSpellWin,
			image: spellNameToIconUrl[castSpellName],

			hasBs: false,
			hasEf: false,
			canCombo: false,
			canSkip: false,
		};

		// set the result of child spells called by GFD
		if (castSpellName == "Force the Hand of Fate") {
			// cast FtHoF, set to return object
			const gc0 = castFtHoF(seed, spellsCastTotal + 1, false, "GC");
			const gc1 = castFtHoF(seed, spellsCastTotal + 1, true, "GC");
			const wc0 = castFtHoF(seed, spellsCastTotal + 1, false, "WC");
			const wc1 = castFtHoF(seed, spellsCastTotal + 1, true, "WC");
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
					gfdResult.canCombo = true;
				}
			} else {
				const hasEf = hasCookieEffect(availableCookies, "Elder Frenzy");
				if (hasEf) {
					gfdResult.hasEf = true;
					gfdResult.canCombo = true;
				}
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

		// return GFD result object
		return gfdResult;
	};


	/**
	 * determine whether passed FtHoF results have one of passed effects
	 *
	 * @param cookies array of FthofResults to see
	 * @param effect effect name or names
	 * @returns true if have
	 */
	const hasCookieEffect = (cookies: FthofResult[], effect: string | string[]): boolean => {
		const effectNames = (typeof effect == "string" ? [effect] : effect);
		for (const cookie of cookies) {
			for (const effectName of effectNames) {
				if (cookie.name == effectName) return true;
			}
		}
		return false;
	};


	/**
	 * calculate future FtHoF que and display result
	 */
	const updateCookies = (): void => {
		// read $scope variables
		const {
			seed, spellsCastTotal,
		} = getSaveData($scope);
		const {
			lookahead,
			minComboLength, maxComboLength, maxSpread,
			includeEF, skipRA, skipSE, skipST,
			season,
		} = getSettings($scope);

		// variables to set $scope.*
		const baseBackfireChance = getBaseFailChance();
		const fthofBackfireChance = getFthofFailChance(baseBackfireChance);
		const combos: { [key: number]: ComboResults } = {};
		const sugarIndexes: number[] = [];

		// object that contain FtHoF and GFD result, combo / skip indexes, etc.
		const grimoireResults: GrimoireResult[] = [];

		// do nothing if seed is empty
		if (seed === "") return;

		// srart timer
		console.time("updateCookies");

		const comboIndexes: number[] = [];
		const skipIndexes: number[] = [];
		for (let i = 0; i < lookahead; i++) {
			// total spell cast count before this cast
			const currentTotalSpell = spellsCastTotal + i;

			// get first random number and push to array
			Math_seedrandom(seed + "/" + currentTotalSpell);
			const randomNumber = Math.random();

			// minimum count of GC/WC on screen that GC changes to WC
			const wcThreshold = (
				randomNumber < 1 - baseBackfireChance  // if false, 100% WC with no GC/WC on screen
				? Math.ceil((1 - randomNumber - baseBackfireChance) / 0.15)
				: 0
			);

			// FtHoF success or backfire (L313)
			const isFthofWin = randomNumber < 1 - fthofBackfireChance;

			// get FtHoF results (both success and backfire)
			const gc0 = castFtHoF(seed, currentTotalSpell, false, "GC");
			const gc1 = castFtHoF(seed, currentTotalSpell, true, "GC");
			const wc0 = castFtHoF(seed, currentTotalSpell, false, "WC");
			const wc1 = castFtHoF(seed, currentTotalSpell, true, "WC");
			const gfd = castGFD(seed, currentTotalSpell);

			// cookies that user can cast (reduce cookie1 for single season option)
			const availableCookies = [gc0, wc0, ...(season == "noswitch" ? [] : [gc1, wc1])];

			// determine whether current cookies can be part of a combo
			const isCombo = (
				availableCookies.some((cookie) => (
					cookie.name == "Building Special"
					|| (includeEF && cookie.name == "Elder Frenzy")
				))
				|| gfd.hasBs
				|| (includeEF && gfd.hasEf)
			);
			if (isCombo) comboIndexes.push(i);

			// determine whether GFD can be skipped
			const isSkip = (
				(skipRA && gfd.name == "Resurrect Abomination")
				|| (skipSE && gfd.name == "Spontaneous Edifice" && gfd.isWin)
				|| (skipST && gfd.name == "Stretch Time")
			);
			if (isSkip) skipIndexes.push(i);

			// determine whether Sugar Lump can be get
			const isSugar = hasCookieEffect(availableCookies, "Free Sugar Lump");
			if (isSugar) sugarIndexes.push(i);

			// No Change, One Change cookie to display
			const cookie0 = isFthofWin ? gc0 : wc0;
			const cookie1 = isFthofWin ? gc1 : wc1;

			// add good effect information about hidden GC/WC
			let isOtherCookieNotable0 = false;
			let isOtherCookieNotable1 = false;
			if (isFthofWin) {
				if (wc0.name == "Elder Frenzy") {
					gc0.name += " (EF)";
					gc0.noteworthy = true;
					isOtherCookieNotable0 = true;
				}
				if (wc1.name == "Elder Frenzy") {
					gc1.name += " (EF)";
					gc1.noteworthy = true;
					isOtherCookieNotable1 = true;
				}
				if (wc0.name == "Free Sugar Lump") gc0.name += " (Sugar)";
				if (wc1.name == "Free Sugar Lump") gc1.name += " (Sugar)";
			} else {
				if (gc0.name == "Building Special") {
					wc0.name += " (BS)";
					wc0.noteworthy = true;
					isOtherCookieNotable0 = true;
				}
				if (gc1.name == "Building Special") {
					wc1.name += " (BS)";
					wc1.noteworthy = true;
					isOtherCookieNotable1 = true;
				}
				if (gc0.name == "Free Sugar Lump") wc0.name += " (Sugar)";
				if (gc1.name == "Free Sugar Lump") wc1.name += " (Sugar)";
			}

			// set to object and push to array
			const grimoireResult: GrimoireResult = {
				num: i + 1,
				firstRandomNum: randomNumber,
				wcThreshold,

				isFthofWin,
				cookie0, gc0, wc0, isOtherCookieNotable0,
				cookie1, gc1, wc1, isOtherCookieNotable1,

				gfd,
				isCombo, isSkip, isSugar,
			};
			grimoireResults.push(grimoireResult);
		}

		// log
		console.log("grimoireResults:", grimoireResults);
		console.log("comboIndexes:", comboIndexes);
		console.log("skipIndexes:", skipIndexes);
		console.timeLog("updateCookies");

		// find combos
		for (let comboLength = minComboLength; comboLength <= maxComboLength; comboLength++) {
			combos[comboLength] = findCombos(comboLength, maxSpread, comboIndexes, skipIndexes);
		}

		console.log("Combos:", combos);
		console.timeEnd("updateCookies");

		// set to $scope
		$scope.baseBackfireChance  = baseBackfireChance;
		$scope.backfireChance      = fthofBackfireChance;
		$scope.combos              = combos;
		$scope.sugarIndexes        = sugarIndexes;
		$scope.grimoireResults     = grimoireResults;
	};


	/**
	 * pop and push items to FtHoF list
	 *
	 * @param count cast count (default: 1)
	 */
	const castSpell = (count = 1): void => {
		const callCount = count;
		$scope.spellsCast += callCount;
		$scope.spellsCastTotal += callCount;
		updateCookies();

		// save $scope.spellsCast, $scope.spellsCastTotal
		saveSaveData($scope);
	};


	/**
	 * push more items to FtHoF list
	 *
	 * @param count load row count (default: 50)
	 */
	const loadMore = (count = 50): void => {
		$scope.lookahead += count;
		updateCookies();
	};


	// set functions to $scope that called from index.html
	$scope.selectSaveCodeInput = selectSaveCodeInput;
	$scope.printScope        = printScope;
	$scope.importSave        = importSave;
	$scope.updateCookies     = updateCookies;
	$scope.castSpell         = castSpell;
	$scope.loadMore          = loadMore;


	// fill the save code input if previous save code exists in LocalStorage
	const previousSaveCode = loadSaveCodeFromLS();
	if (previousSaveCode) {
		$scope.saveCode = previousSaveCode;
		readSaveDataFromSaveCode($scope, previousSaveCode);
	}

	// load previous state if saved in LocalStorage
	loadSaveData($scope);
	loadSettings($scope);

	// call $scope.updateCookies() for first time
	if ($scope.saveCode && !$scope.grimoireResults?.length) updateCookies();


	/**
	 * function that is called when something is dropped to window

	 * @param event drag event object
	 * @returns Promise<void>
	 */
	const whenItemDropped = async (event: DragEvent): Promise<void> => {
		// cancel default dropping
		event.preventDefault();

		// get DataTransfer object
		const { dataTransfer } = event;
		if (!dataTransfer) return;

		// get dropped text
		const droppedText: string = await (async (): Promise<string> => {
			// dropped simple text
			const simpleText = dataTransfer.getData("text");
			if (simpleText) return simpleText;

			// search save file from dropped items (max: 100 files)
			for (let i = 0; i < 100; i++) {
				const item = dataTransfer.items[i];
				if (item.kind != "file" || item.type != "text/plain") continue;
				const fileText = await item.getAsFile()?.text()
				if (fileText?.includes("END")) return fileText;
			}
			return "";
		})();

		// save code text or file is not dropped
		if (!droppedText) return;

		// try loading save data with dropped save code
		const isLoadSuccess = readSaveDataFromSaveCode($scope, droppedText, true);

		// if valid, set save code to Save Code input area, and update list
		if (isLoadSuccess) {
			$scope.saveCode = droppedText;
			updateCookies();
		}

		// manually trigger AngularJS digest cycle because this event is not tracked by AngularJS
		$scope.$apply();
	};

	// support drag & drop save code input
	document.addEventListener("drop", whenItemDropped);


	/**
	 * function that is called when specified $scope value changes
	 *
	 * @param after value after change
	 * @param before value before change
	 */
	const whenSettingsChanged = <T>(after: T, before: T): void => {
		// do nothing if no change
		if (after === before) return;

		// call $scope.updateCookies()
		$scope.updateCookies();

		// save settings to LocalStorage
		saveSettings($scope);
	};

	// start monitoring $scope changes
	settingsModelNames.forEach(modelName => $scope.$watch(modelName, whenSettingsChanged));


	// remove loading text
	$scope.ready = true;
});


// to allow drag & drop save codes, disable browser to receive dropped objects
document.addEventListener("dragover", (event) => event.preventDefault());
