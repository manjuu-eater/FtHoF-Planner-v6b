/// <reference path="./lib/base64.js" />
// @ts-check
/**
 * FtHoF Planner v6
 * index.js
 */


// import game related objects and functions
import { Math_seedrandom, choose, M_spells } from "./game_related_data.js";


// type definition
/**
 * @typedef {object} FthofResult
 * @property {string} type
 * @property {boolean} wrath
 * @property {string} description
 * @property {boolean} noteworthy
 */


/**
 * cookie effect description dictionary
 * @type { { [key: string]: string } }
 */
const cookieEffectNameToDescription = {
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


/**
 * Extract save data about Magic tower minigame from exported save code.
 *
 * @param {string} saveCode exported save code
 * @returns extracted save data
 */
const extractSaveData = (saveCode) => {
	// return object
	const saveData = {};

	// load save data
	// detail: console.log(Game.WriteSave(3))
	const decoded = Base64.decode(saveCode.split('!END!')[0]);
	const pipeSplited = decoded.split('|');

	const runDetails = pipeSplited[2].split(';');
	const miscGameData = pipeSplited[4].split(';');
	const buildings = pipeSplited[5].split(';');

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
	console.log('Spells cast this ascension: ' + spellsCast);

	const spellsCastTotal = parseInt(strSpellsCastTotal) || 0;
	saveData.spellsCastTotal = spellsCastTotal;
	console.log('Total spells cast: ' + spellsCastTotal);

	// return
	return saveData;
};


const app = window.angular.module('myApp', ['ngMaterial']);
app.controller('myCtrl', function ($scope) {
	$scope.seed = ""
	$scope.ascensionMode = 0
	$scope.spellsCastTotal = 0
	$scope.spellsCast = 0
	$scope.dragonflight = false
	$scope.buffSI = false
	$scope.buffDI = false
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
	 * push more items to FtHoF list
	 *
	 * @param {number=} count load row count (default: 50)
	 */
	const loadMore = (count = 50) => {
		$scope.lookahead += count;
		updateCookies();
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
	const loadGame = (saveCode) => {
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
		$scope.seed = saveData.seed;
		$scope.ascensionMode = saveData.ascensionMode;
		$scope.spellsCast = saveData.spellsCast;
		$scope.spellsCastTotal = saveData.spellsCastTotal;
	};

	/**
	 * calculate future FtHoF que and display result
	 */
	const updateCookies = () => {
		// read $scope variables
		const {
			lookahead,
			minComboLength, maxComboLength, maxSpread,
			includeEF, skipRA, skipSE,
			screenCookieCount, buffSI, buffDI,
			seed,
			spellsCastTotal,
		} = $scope;

		// variables to set $scope.*
		const cookies = []
		const randomSeeds = [];
		const baseBackfireChance = 0.15*(buffSI?1.1:1)*(buffDI?0.1:1);
		const backfireChance = baseBackfireChance+0.15*screenCookieCount;
		const displayCookies = [];
		const combos = {};

		const bsIndices = [];
		const skipIndices = [];
		const currentTime = Date.now();
		for (let i = 0; i < lookahead; i++) {
			const currentSpell = i+spellsCastTotal;
			Math_seedrandom(seed + '/' + currentSpell);
			const roll = Math.random();
			randomSeeds.push(roll);

			const cookie = [];
			const displayCookie = [];
			const cookie1Success = castFtHoF(spellsCastTotal + i, false, "GC")
			const cookie2Success = castFtHoF(spellsCastTotal + i, true, "GC")
			//cookie3 = check_cookies(spellsCastTotal + i, true)
			const cookie1Backfire = castFtHoF(spellsCastTotal + i, false, "RC")
			const cookie2Backfire = castFtHoF(spellsCastTotal + i, true, "RC")
			const gambler = check_gambler(spellsCastTotal + i)
			cookie.push(cookie1Success)
			cookie.push(cookie2Success)
			cookie.push(cookie1Backfire)
			cookie.push(cookie2Backfire)
			cookie.push(gambler)

			if (cookiesContainBuffs(includeEF, cookie1Success, cookie2Success, cookie1Backfire, cookie2Backfire) || gambler.hasBs || (includeEF && gambler.hasEf)) {
				bsIndices.push(i);
			}

			if ((skipRA && gambler.type == 'Resurrect Abomination') || (skipSE && gambler.type == 'Spontaneous Edifice' && !gambler.backfire)) {
				skipIndices.push(i);
			}

			if (randomSeeds[i] + backfireChance < 1) {
				displayCookie.push(cookie[0]);
				displayCookie.push(cookie[1]);
				if (cookie[2].type == "Elder Frenzy") {displayCookie[0].type += " (EF)"; displayCookie[0].noteworthy = true;}
				if (cookie[3].type == "Elder Frenzy") {displayCookie[1].type += " (EF)"; displayCookie[1].noteworthy = true;}
				if (cookie[2].type == "Free Sugar Lump") {displayCookie[0].type += " (Lump)";}
				if (cookie[3].type == "Free Sugar Lump") {displayCookie[1].type += " (Lump)";}
			}
			else {
				displayCookie.push(cookie[2]);
				displayCookie.push(cookie[3]);
				if (cookie[0].type == "Building Special") {displayCookie[0].type += " (BS)"; displayCookie[0].noteworthy = true;}
				if (cookie[1].type == "Building Special") {displayCookie[1].type += " (BS)"; displayCookie[1].noteworthy = true;}
				if (cookie[0].type == "Free Sugar Lump") {displayCookie[0].type += " (Lump)";}
				if (cookie[1].type == "Free Sugar Lump") {displayCookie[1].type += " (Lump)";}
			}
			displayCookie.push(gambler);

			// push to array
			cookies.push(cookie);
			displayCookies.push(displayCookie);
		}
		console.log(cookies);
		console.log(bsIndices);
		console.log(skipIndices);
		console.log(Date.now()-currentTime);

		for (let combo_length = minComboLength; combo_length <= maxComboLength; combo_length++) {
			combos[combo_length] = findCombos(combo_length, maxSpread, bsIndices, skipIndices);
		}

		console.log('Combos: ');
		console.log(combos);
		console.log(Date.now()-currentTime);

		// set to $scope
		$scope.cookies             = cookies;
		$scope.randomSeeds         = randomSeeds;
		$scope.baseBackfireChance  = baseBackfireChance;
		$scope.backfireChance      = backfireChance;
		$scope.displayCookies      = displayCookies;
		$scope.combos              = combos;
	}

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

	//want to return shortest, and first sequence for a given combo_length
	//if nothing that satisfies maxSpread, shortest will still be filled but first will be empty
	/**
	 * find comboes from indexes
	 *
	 * @param {number} combo_length want length of combo
	 * @param {number} maxSpread number of max spread (padding; neither BS nor skip)
	 * @param {number[]} bsIndices indexes of buff (Building Special etc.)
	 * @param {number[]} skipIndices indexes of skippable GFD (Resurrect Abomination etc.)
	 * @returns {object} found result
	 */
	const findCombos = (combo_length, maxSpread, bsIndices, skipIndices) => {
		let shortestDistance = 10000000;
		let shortestStart = -1;

		let firstDistance = 10000000;
		let firstStart = -1

		for (let i = 0; i + combo_length <= bsIndices.length; i++) {
			let seqStart = bsIndices[i];
			let seqEnd = bsIndices[i + combo_length - 1];
			let baseDistance = seqEnd - seqStart + 1;

			let skips = skipIndices.filter((idx) => idx > seqStart && idx < seqEnd && !bsIndices.includes(idx));

			let distance = baseDistance - skips.length;
			if (firstStart == -1 && distance <= combo_length + maxSpread) {
				firstStart = seqStart;
				firstDistance = distance;
			}

			if (distance < shortestDistance) {
				shortestStart = seqStart;
				shortestDistance = distance;
			}
		}

		return {
			shortest: {idx: shortestStart, length: shortestDistance},
			first: {idx: firstStart, length: firstDistance}
		};
	};

	/**
	 * determine whether passed cookies may trigger any buffs
	 *
	 * @param {boolean} include_ef whether include Elder Fever
	 * @param  {...object} cookies cookie objects that may trigger buff
	 * @returns {boolean} true if triggers buff
	 */
	const cookiesContainBuffs = (include_ef, ...cookies) => {
		return cookies.some((cookie) => {
			return cookie.type == 'Building Special' || (include_ef && cookie.type == 'Elder Frenzy');
		});
	};

	/**
	 * get cast result object of Gambler's Fever Dream
	 *
	 * @param {number} spellsCast index of cast to see (with total cast)
	 * @returns GFD cast result
	 */
	const check_gambler = (spellsCast) => {
		Math_seedrandom($scope.seed + '/' + spellsCast);

		let spells = [];
		for (const i in M_spells) {
			if (i != "gambler's fever dream")
				spells.push(M_spells[i]);
		}

		const gfdSpell = choose(spells);
		//simplifying the below cause this isn't patched yet afaict and i'll never be playing with diminished ineptitutde backfire
		const gfdBackfire = 0.5; /*M.getFailChance(gfdSpell);

		if(FortuneCookie.detectKUGamblerPatch()) gfdBackfire *= 2;
		else gfdBackfire = Math.max(gfdBackfire, 0.5);*/

		let gamblerSpell = {};
		gamblerSpell.type = gfdSpell.name;
		gamblerSpell.hasBs = false;
		gamblerSpell.hasEf = false;

		Math_seedrandom($scope.seed + '/' + (spellsCast + 1));
		if (Math.random() < (1 - gfdBackfire)) {
			gamblerSpell.backfire = false;

			if (gfdSpell.name == "Force the Hand of Fate") {
				gamblerSpell.innerCookie1 = castFtHoF(spellsCast + 1, false, "GC");
				gamblerSpell.innerCookie2 = castFtHoF(spellsCast + 1, true, "GC");

				gamblerSpell.hasBs = gamblerSpell.innerCookie1.type == 'Building Special' || gamblerSpell.innerCookie2.type == 'Building Special';
			}

			//TODO: Do something with edifice to make it clear if it will fail or not. like this:
			//if(gfdSpell.name == "Spontaneous Edifice") spellOutcome += ' (' + FortuneCookie.gamblerEdificeChecker(spellsCast + 1, true) + ')';
		} else {
			gamblerSpell.backfire = true;

			if (gfdSpell.name == "Force the Hand of Fate") {
				gamblerSpell.innerCookie1 = castFtHoF(spellsCast + 1, false, "RC");
				gamblerSpell.innerCookie2 = castFtHoF(spellsCast + 1, true, "RC");

				gamblerSpell.hasEf = gamblerSpell.innerCookie1.type == 'Elder Frenzy' || gamblerSpell.innerCookie2.type == 'Elder Frenzy';
			}

			//TODO: again, handle spontaneous edifice
			//if(gfdSpell.name == "Spontaneous Edifice") spellOutcome += ' (' + FortuneCookie.gamblerEdificeChecker(spellsCast + 1, false) + ')';
		}

		return gamblerSpell;
	};

	/**
	 * get cast result object of FtHoF
	 * simulating target: minigameGrimoire.js > M.castSpell (L299 on v2.052)
	 *
	 * @param {number} spellsCastTotal total spell cast count before this cast
	 * @param {boolean} isOneChange true if one change
	 * @param {("GC" | "RC")=} forceCookie "GC": force GC, "RC": force RC, default: roll with Math.random()
	 * @returns {FthofResult} FtHoF cast result
	 */
	const castFtHoF = (spellsCastTotal, isOneChange, forceCookie) => {
		// set seed (L312)
		Math_seedrandom($scope.seed + '/' + spellsCastTotal);

		// get fail chance (L307 > L289)
		const failChance = (() => {
			// return 0.0 or 1.0 if forced
			if (forceCookie == "GC") return 0.0;
			if (forceCookie == "RC") return 1.0;

			// calculate failChance (same as L289)
			let failChance = 0.15;
			if ($scope.buffDI) failChance *= 0.1;
			//if (Game.hasBuff('Magic inept')) failChance*=5;  // TODO: not implemented
			failChance *= 1 + 0.1 * $scope.buffSI;  // TODO: Reality Bending x1.1
			failChance += 0.15 * $scope.screenCookieCount;  // L46
			return failChance;
		})();

		// roll casting result (L313)
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

		// initializing GC/RC finished, back to spell.win() or spell.fail()

		/**
		 * choices of GC/RC effect name
		 * @type {string[]}
		 */
		let choices = [];

		/** FtHoF cast result */
		const cookie = {};

		// choose cookie effect
		if (isWin) {
			// choices of golden cookie (L52)
			choices.push('Frenzy', 'Lucky');
			if (!$scope.dragonflight) choices.push('Click Frenzy');
			if (Math.random() < 0.1) choices.push('Cookie Storm', 'Cookie Storm', 'Blab');
			if (Math.random() < 0.25) choices.push('Building Special');  // Game.BuildingsOwned>=10 is ignored
			if (Math.random() < 0.15) choices = ['Cookie Storm Drop'];
			if (Math.random() < 0.0001) choices.push('Free Sugar Lump');
			cookie.type = choose(choices);

			// There is an additional Math.random() in L62,
			// but this doesn't affect the result because choice is done.
			//if (cookie.type == 'Cookie Storm Drop') Math.random();

			// cookie is GC
			cookie.wrath = false;

		} else {
			// choices of red cookie (L70)
			choices.push('Clot', 'Ruin');
			if (Math.random() < 0.1) choices.push('Cursed Finger', 'Elder Frenzy');
			if (Math.random() < 0.003) choices.push('Free Sugar Lump');
			if (Math.random() < 0.1) choices = ['Blab'];
			cookie.type = choose(choices);

			// cookie is RC
			cookie.wrath = true;
		}

		// set description
		const description = cookieEffectNameToDescription[cookie.type];
		if (!description) console.error("No description in dictionary: " + cookie.type);
		cookie.description = description;

		// add noteworthy info
		cookie.noteworthy = false;
		if (cookie.type == 'Building Special') cookie.noteworthy = true;
		if (cookie.type == 'Elder Frenzy') cookie.noteworthy = true;

		// return FtHoF cast result
		return cookie;
	};


	// set functions to $scope that called from index.html
	$scope.loadMore          = loadMore;
	$scope.castSpell         = castSpell;
	$scope.printScope        = printScope;
	$scope.loadGame          = loadGame;
	$scope.updateCookies     = updateCookies;
	$scope.collapseInterface = collapseInterface;
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
