/// <reference path="./lib/base64.js" />
// @ts-check
/**
 * FtHoF Planner v6
 * index.js
 */


// import game related objects and functions
import {
	Math_seedrandom, choose, M_spells,
	cookieEffectNameToDescription,
	spellNameToIconUrl,
} from "./game_related_data.js";


// type definition
/**
 * @typedef {object} GameSaveData
 * @property {string} seed
 * @property {number} ascensionMode
 * @property {number} spellsCast
 * @property {number} spellsCastTotal
 */
/**
 * @typedef {object} FthofResult
 * @property {string} name
 * @property {boolean} wrath
 * @property {string} description
 * @property {boolean} noteworthy
 */
/**
 * @typedef {object} GfdResult
 * @property {string} name
 * @property {string} imageUrl
 * @property {boolean} hasBs
 * @property {boolean} hasEf
 * @property {boolean} canCombo
 * @property {boolean} canSkip
 * @property {boolean} isWin
 * @property {FthofResult=} cookie0
 * @property {FthofResult=} cookie0GC
 * @property {FthofResult=} cookie0WC
 * @property {FthofResult=} cookie1
 * @property {FthofResult=} cookie1GC
 * @property {FthofResult=} cookie1WC
 * @property {number=} spontaneousEdificeRandomNumber
 */


/**
 * Extract save data about Magic tower minigame from exported save code.
 *
 * @param {string} saveCode exported save code
 * @returns {GameSaveData} extracted save data
 */
const extractSaveData = (saveCode) => {
	// return object
	const saveData = {};

	// load save data
	// detail: console.log(Game.WriteSave(3))
	const decoded = Base64.decode(saveCode.split("!END!")[0]);
	const pipeSplited = decoded.split("|");

	const runDetails = pipeSplited[2].split(";");
	const miscGameData = pipeSplited[4].split(";");
	const buildings = pipeSplited[5].split(";");

	const seed = runDetails[4];
	saveData.seed = seed;
	console.log(seed);

	const ascensionMode = parseInt(miscGameData[29]);
	saveData.ascensionMode = ascensionMode;
	console.log(ascensionMode);

	const wizardTower = buildings[7];
	console.log(wizardTower);

	// load Wizard tower minigame data
	// detail: v2.052 minigameGrimoire.js L463
	const wizMinigameData = wizardTower.split(",")[4].split(" ");
	const [strMagic, strSpellsCast, strSpellsCastTotal, strOn] = wizMinigameData;

	const spellsCast = parseInt(strSpellsCast) || 0;
	saveData.spellsCast = spellsCast;
	console.log("Spells cast this ascension: " + spellsCast);

	const spellsCastTotal = parseInt(strSpellsCastTotal) || 0;
	saveData.spellsCastTotal = spellsCastTotal;
	console.log("Total spells cast: " + spellsCastTotal);

	// return
	return saveData;
};


const app = window.angular.module("myApp", ["ngMaterial"]);
app.controller("myCtrl", function ($scope) {
	$scope.seed = ""
	$scope.ascensionMode = 0
	$scope.spellsCastTotal = 0
	$scope.spellsCast = 0
	$scope.dragonflight = false
	$scope.auraSI = false
	$scope.buffDI = false
	$scope.debuffDI = false
	$scope.screenCookieCount = 0
	$scope.minComboLength = 2
	$scope.maxComboLength = 4
	$scope.maxSpread = 2
	$scope.saveString = ""
	$scope.lookahead = 200

	// fill the save code input if previous save code exists in LocalStorage
	const previousSaveCode = window.localStorage.getItem("fthof_save_code");
	if (previousSaveCode) $scope.saveString = previousSaveCode;


	/**
	 * toggle interface button
	 *
	 * @param {number} contentId number of "content-*"
	 */
	const collapseInterface = (contentId) => {
		console.log("content-" + contentId);
		if (contentId) {
			const content = document.getElementById("content-" + contentId);
			if (content === null) throw Error("not found: #content-" + contentId);
			if (content.style.display === "block") {
				content.style.display = "none";
			} else {
				content.style.display = "block";
			}
		}
	};


	/**
	 * log $scope (debug function)
	 */
	const printScope = () => {
		console.log($scope);
	};


	/**
	 * load save code
	 *
	 * @param {string=} saveCode save code (if omitted, read from html)
	 */
	const loadSaveCode = (saveCode) => {
		// read from html
		const saveStr = saveCode ? saveCode : String($scope.saveString);

		// if blank, reset LocalStorage and quit
		if (saveStr === "") {
			window.localStorage.setItem("fthof_save_code", saveStr);
			return;
		}

		// extract save data
		const saveData = (() => {
			try {
				return extractSaveData(saveStr);
			} catch {
				return undefined;
			}
		})();

		// save code was invalid
		if (!saveData) {
			console.error("invalid save code");
			$scope.saveString = "invalid save code";
			return;
		}

		// save valid save code to LocalStorage
		window.localStorage.setItem("fthof_save_code", saveStr);

		// set to $scope
		$scope.seed            = saveData.seed;
		$scope.ascensionMode   = saveData.ascensionMode;
		$scope.spellsCast      = saveData.spellsCast;
		$scope.spellsCastTotal = saveData.spellsCastTotal;
	};


	/**
	 * calculate base fail chance of FtHoF
	 * (without considering count of GCs on screen)
	 *
	 * simulating: minigameGrimoire.js v2.052
	 *             > M.getFailChance (L289)
	 *
	 * @returns {number} fail chance of FtHoF
	 */
	const getBaseFailChance = () => {
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
	 * @param {number=} baseFailChance
	 * @returns {number} fail chance of FtHoF
	 */
	const getFthofFailChance = (baseFailChance) => {
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
	 * @param {string} seed five-letter string like "abcde" used as a seed in game
	 * @param {number} spellsCastTotal total spell cast count before this cast
	 * @param {boolean} isOneChange true if one change
	 * @param {("GC" | "WC")=} forceCookie "GC": force GC, "WC": force WC, default: roll with Math.random()
	 * @returns {FthofResult} FtHoF cast result
	 */
	const castFtHoF = (seed, spellsCastTotal, isOneChange, forceCookie) => {
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

		// season is valentines or easter (main.js L5343, main.js L5353)
		if (isOneChange) Math.random();

		// determine X and Y position to spawn (main.js L5358, main.js L5359)
		Math.random();
		Math.random();

		// initializing GC/WC finished, back to spell.win() or spell.fail()

		/**
		 * choices of GC/WC effect name
		 * @type {string[]}
		 */
		let choices = [];

		/** FtHoF cast result  @type {FthofResult} */
		const fthofResult = {};

		// choose cookie effect
		if (isWin) {
			// choices of golden cookie (L52)
			choices.push("Frenzy", "Lucky");
			if (!$scope.dragonflight) choices.push("Click Frenzy");
			if (Math.random() < 0.1) choices.push("Cookie Storm", "Cookie Storm", "Blab");
			if (Math.random() < 0.25) choices.push("Building Special");  // Game.BuildingsOwned>=10 is ignored
			if (Math.random() < 0.15) choices = ["Cookie Storm Drop"];
			if (Math.random() < 0.0001) choices.push("Free Sugar Lump");
			fthofResult.name = choose(choices);

			// There is an additional Math.random() in L62,
			// but this doesn't affect the result because choice is done.
			//if (fthofResult.name == "Cookie Storm Drop") Math.random();

		} else {
			// choices of red cookie (L70)
			choices.push("Clot", "Ruin");
			if (Math.random() < 0.1) choices.push("Cursed Finger", "Elder Frenzy");
			if (Math.random() < 0.003) choices.push("Free Sugar Lump");
			if (Math.random() < 0.1) choices = ["Blab"];
			fthofResult.name = choose(choices);
		}

		// set whether cookie is WC
		fthofResult.wrath = !isWin;

		// set description
		const description = cookieEffectNameToDescription[fthofResult.name];
		if (!description) console.error("No description in dictionary: " + fthofResult.name);
		fthofResult.description = description;

		// add noteworthy info
		fthofResult.noteworthy = false;
		if (fthofResult.name == "Building Special") fthofResult.noteworthy = true;
		if (fthofResult.name == "Elder Frenzy") fthofResult.noteworthy = true;

		// return FtHoF cast result
		return fthofResult;
	};


	//want to return shortest, and first sequence for a given combo_length
	//if nothing that satisfies maxSpread, shortest will still be filled but first will be empty
	/**
	 * find comboes from indexes
	 *
	 * @param {number} comboLength target length of combo
	 * @param {number} maxSpread number of max spread (padding; neither BS nor skip)
	 * @param {number[]} comboIndexes indexes of buff (Building Special etc.)
	 * @param {number[]} skipIndexes indexes of skippable GFD (Resurrect Abomination etc.)
	 * @returns {object} found result
	 */
	const findCombos = (comboLength, maxSpread, comboIndexes, skipIndexes) => {
		// whether to output combos exceeding maxSpread
		const outputOverflowedCombo = false;

		// combo with the shortest length
		let shortestLength = 10000000;
		let shortestStartIndex = -1;

		// combo that appears first
		let firstLength = 10000000;
		let firstStartIndex = -1

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
	 * @param {string} seed five-letter string like "abcde" used as a seed in game
	 * @param {number} spellsCastTotal total spell cast count before this cast
	 * @returns {GfdResult} GFD cast result
	 */
	const castGFD = (seed, spellsCastTotal) => {
		// set seed for GFD spell selection (L312)
		Math_seedrandom(seed + "/" + spellsCastTotal);

		// make spells list that GFD can cast with max MP (L199)
		const spells = [];
		for (const spellKey in M_spells) {
			if (spellKey != "gambler's fever dream") spells.push(M_spells[spellKey]);
		}

		// choose a spell to be cast (L202)
		const castSpell = choose(spells);

		// chance of GFD backfire (L206 > L299 > L311)
		// note1: **code behavior differs from description!!**
		// note2: increases above 0.5 only if DI debuff is active
		const gfdBackfire = Math.max(getBaseFailChance(), 0.5);

		/** return object  @type {GfdResult} */
		const gfdResult = {};
		gfdResult.name = castSpell.name;
		gfdResult.imageUrl = spellNameToIconUrl[castSpell.name];
		gfdResult.hasBs = false;
		gfdResult.hasEf = false;
		gfdResult.canCombo = false;
		gfdResult.canSkip = false;

		// set seed for child spell that is cast by GFD (L312)
		// note: this seed may change with continuous GFD casts (spellsCastTotal increases)
		Math_seedrandom(seed + "/" + (spellsCastTotal + 1));

		// roll for casting result (L313)
		const isChildSpellWin = Math.random() < (1 - gfdBackfire);

		// set success / backfire result
		gfdResult.isWin = isChildSpellWin;

		// set the result of child spells called by GFD
		if (castSpell.name == "Force the Hand of Fate") {
			// cast FtHoF, set to return object
			const cookie0GC = castFtHoF(seed, spellsCastTotal + 1, false, "GC");
			const cookie1GC = castFtHoF(seed, spellsCastTotal + 1, true, "GC");
			const cookie0WC = castFtHoF(seed, spellsCastTotal + 1, false, "WC");
			const cookie1WC = castFtHoF(seed, spellsCastTotal + 1, true, "WC");
			const cookie0 = isChildSpellWin ? cookie0GC : cookie0WC;
			const cookie1 = isChildSpellWin ? cookie1GC : cookie1WC;

			// set to return object
			gfdResult.cookie0 = cookie0;
			gfdResult.cookie1 = cookie1;
			gfdResult.cookie0GC = cookie0GC;
			gfdResult.cookie0WC = cookie0WC;
			gfdResult.cookie1GC = cookie1GC;
			gfdResult.cookie1WC = cookie1WC;

			// determine child FtHoF result can be a part of combo
			if (isChildSpellWin) {
				const hasBs = hasCookieEffect([cookie0, cookie1], "Building Special");
				if (hasBs) {
					gfdResult.hasBs = true;
					gfdResult.canCombo = true;
				}
			} else {
				const hasEf = hasCookieEffect([cookie0, cookie1], "Elder Frenzy");
				if (hasEf) {
					gfdResult.hasEf = true;
					gfdResult.canCombo = true;
				}
			}

		} else if (castSpell.name == "Spontaneous Edifice") {
			// add result of SE

			// get random number when choosing building (L134, L144)
			const secondRandomNumber = Math.random();

			// set to GFD result object
			gfdResult.spontaneousEdificeRandomNumber = secondRandomNumber;
		}

		// determine child FtHoF result can be a part of combo
		if (
			castSpell.name == "Resurrect Abomination"
			|| (castSpell.name == "Spontaneous Edifice" && gfdResult.isWin)
			|| (castSpell.name == "Stretch Time")
		) {
			gfdResult.canSkip = true;
		}

		// return GFD result object
		return gfdResult;
	};


	/**
	 * determine whether passed FtHoF results have one of passed effects
	 *
	 * @param {FthofResult[]} cookies array of FthofResults to see
	 * @param {string | string[]} effect effect name or names
	 * @returns {boolean} true if have
	 */
	const hasCookieEffect = (cookies, effect) => {
		const effectNames = (typeof effect == "string" ? [effect] : effect);
		for (const cookie of cookies) {
			for (const effectName of effectNames) {
				if (cookie.name == effectName) return true;
			}
		}
		return false;
	};


	/**
	 * determine whether passed cookies may trigger any buffs
	 *
	 * @param {boolean} include_ef whether include Elder Fever
	 * @param  {...object} cookies cookie objects that may trigger buff
	 * @returns {boolean} true if triggers buff
	 */
	const hasCookieBuff = (include_ef, ...cookies) => {
		return cookies.some((cookie) => {
			return cookie.name == "Building Special" || (include_ef && cookie.name == "Elder Frenzy");
		});
	};


	/**
	 * calculate future FtHoF que and display result
	 */
	const updateCookies = () => {
		// read $scope variables
		const {
			lookahead,
			minComboLength, maxComboLength, maxSpread,
			includeEF, skipRA, skipSE, skipST,
			seed,
			spellsCastTotal,
		} = $scope;

		// variables to set $scope.*
		const cookies = []
		const firstRandomNumbers = [];
		const baseBackfireChance = getBaseFailChance();
		const fthofBackfireChance = getFthofFailChance(baseBackfireChance);
		const displayCookies = [];
		const combos = {};
		const sugarIndexes = [];

		// object that contain FtHoF and GFD result, combo / skip indexes, etc.
		const grimoireResults = [];

		// srart timer
		console.time("updateCookies");

		const comboIndexes = [];
		const skipIndexes = [];
		for (let i = 0; i < lookahead; i++) {
			// total spell cast count before this cast
			const currentTotalSpell = spellsCastTotal + i;

			// get first random number and push to array
			Math_seedrandom(seed + "/" + currentTotalSpell);
			const randomNumber = Math.random();
			firstRandomNumbers.push(randomNumber);

			// FtHoF success or backfire (L313)
			const isFthofWin = randomNumber < 1 - fthofBackfireChance;

			// get FtHoF results (both success and backfire)
			const cookie0GC = castFtHoF(seed, currentTotalSpell, false, "GC");
			const cookie1GC = castFtHoF(seed, currentTotalSpell, true, "GC");
			const cookie0WC = castFtHoF(seed, currentTotalSpell, false, "WC");
			const cookie1WC = castFtHoF(seed, currentTotalSpell, true, "WC");
			const gambler = castGFD(seed, currentTotalSpell);
			const cookie = [cookie0GC, cookie1GC, cookie0WC, cookie1WC, gambler];
			const displayCookie = [];

			// determine whether current cookies can be part of a combo
			const isCombo = (
				hasCookieBuff(includeEF, cookie0GC, cookie1GC, cookie0WC, cookie1WC)
				|| gambler.hasBs
				|| (includeEF && gambler.hasEf)
			);
			if (isCombo) comboIndexes.push(i);

			// determine whether GFD can be skipped
			const isSkip = (
				(skipRA && gambler.name == "Resurrect Abomination")
				|| (skipSE && gambler.name == "Spontaneous Edifice" && gambler.isWin)
				|| (skipST && gambler.name == "Stretch Time")
			);
			if (isSkip) skipIndexes.push(i);

			// determine whether Sugar Lump can be get
			const isSugar = hasCookieEffect([cookie0GC, cookie1GC, cookie0WC, cookie1WC], "Free Sugar Lump");
			if (isSugar) sugarIndexes.push(i);

			// No Change, One Change cookie to display
			const cookie0 = isFthofWin ? cookie0GC : cookie0WC;
			const cookie1 = isFthofWin ? cookie1GC : cookie1WC;

			// add good effect information about hidden GC/WC
			let isOtherCookieNotable0 = false;
			let isOtherCookieNotable1 = false;
			if (isFthofWin) {
				displayCookie.push(cookie0GC);
				displayCookie.push(cookie1GC);
				if (cookie0WC.name == "Elder Frenzy") {
					cookie0GC.name += " (EF)";
					cookie0GC.noteworthy = true;
					isOtherCookieNotable0 = true;
				}
				if (cookie1WC.name == "Elder Frenzy") {
					cookie1GC.name += " (EF)";
					cookie1GC.noteworthy = true;
					isOtherCookieNotable1 = true;
				}
				if (cookie0WC.name == "Free Sugar Lump") cookie0GC.name += " (Lump)";
				if (cookie1WC.name == "Free Sugar Lump") cookie1GC.name += " (Lump)";
			} else {
				displayCookie.push(cookie0WC);
				displayCookie.push(cookie1WC);
				if (cookie0GC.name == "Building Special") {
					cookie0WC.name += " (BS)";
					cookie0WC.noteworthy = true;
					isOtherCookieNotable0 = true;
				}
				if (cookie1GC.name == "Building Special") {
					cookie1WC.name += " (BS)";
					cookie1WC.noteworthy = true;
					isOtherCookieNotable1 = true;
				}
				if (cookie0GC.name == "Free Sugar Lump") cookie0WC.name += " (Lump)";
				if (cookie1GC.name == "Free Sugar Lump") cookie1WC.name += " (Lump)";
			}

			// push GFD result to displayCookie
			displayCookie.push(gambler);

			// push to array
			cookies.push(cookie);
			displayCookies.push(displayCookie);

			// set to object and push to array
			const grimoireResult = {
				num: i + 1,
				firstRandomNumber: randomNumber,

				isFthofWin,
				cookie0, cookie0GC, cookie0WC, isOtherCookieNotable0,
				cookie1, cookie1GC, cookie1WC, isOtherCookieNotable1,

				gambler,
				displayCookie,
				isCombo, isSkip, isSugar,
			};
			grimoireResults.push(grimoireResult);
		}

		// log
		console.log("cookies:", cookies);
		console.log("comboIndexes:", comboIndexes);
		console.log("skipIndexes:", skipIndexes);
		console.timeLog("updateCookies");

		// find combos
		for (let combo_length = minComboLength; combo_length <= maxComboLength; combo_length++) {
			combos[combo_length] = findCombos(combo_length, maxSpread, comboIndexes, skipIndexes);
		}

		console.log("Combos:", combos);
		console.timeEnd("updateCookies");

		// set to $scope
		$scope.cookies             = cookies;
		$scope.firstRandomNumbers  = firstRandomNumbers;
		$scope.baseBackfireChance  = baseBackfireChance;
		$scope.backfireChance      = fthofBackfireChance;
		$scope.displayCookies      = displayCookies;
		$scope.combos              = combos;
		$scope.sugarIndexes        = sugarIndexes;
		$scope.grimoireResults     = grimoireResults;
	};


	/**
	 * pop and push items to FtHoF list
	 *
	 * @param {number=} count cast count (default: 1)
	 */
	const castSpell = (count = 1) => {
		const callCount = count;
		$scope.spellsCast += callCount;
		$scope.spellsCastTotal += callCount;
		updateCookies();
	};


	/**
	 * push more items to FtHoF list
	 *
	 * @param {number=} count load row count (default: 50)
	 */
	const loadMore = (count = 50) => {
		$scope.lookahead += count;
		updateCookies();
	};


	// set functions to $scope that called from index.html
	$scope.collapseInterface = collapseInterface;
	$scope.printScope        = printScope;
	$scope.loadSaveCode      = loadSaveCode;
	$scope.updateCookies     = updateCookies;
	$scope.castSpell         = castSpell;
	$scope.loadMore          = loadMore;
});


/**
 * Select the save code input for easy pasting.
 *
 * @param {MouseEvent} event event fired with input left or right click
 */
const selectSaveCodeInput = (event) => {
	if (!(event.target instanceof HTMLInputElement)) return;
    event.target.select();
};

// add event listener for left and right clicks
document.addEventListener("click", selectSaveCodeInput);
document.addEventListener("contextmenu", selectSaveCodeInput);
