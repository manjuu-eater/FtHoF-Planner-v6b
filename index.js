/// <reference path="./lib/base64.js" />
// @ts-check
/**
 * FtHoF Planner v6
 * index.js
 */


// import game related objects and functions
import { Math_seedrandom, choose, M_spells } from "./game_related_data.js";


/** cookie effect description dictionary */
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
	$scope.supremeintellect = false
	$scope.diminishineptitude = false
	$scope.on_screen_cookies = 0
	$scope.min_combo_length = 2
	$scope.max_combo_length = 4
	$scope.max_spread = 2
	//$scope.save_string = "Mi4wMTl8fDE1NTcwMjQwMjkzMjQ7MTUyNTU2Mzg4NjQ5ODsxNTU3MDI2MDY3NTI2O1ByZXR0eSBCaXNjdWl0O2ljb2NkfDExMTExMTExMTAwMTAwMTAwMDAxMHwzMTcyOTc5ODU2ODk2MS4wNzsyNDk5OTU5MzQxMDEyOTYuNjszNTE0OzgzMzc7Nzc3NzExMzQ3NDEzMDIuMjc7NzI2ODU7MDszOzEuNjMwODE0MDg0NjAwMTQxOGUrMTAxOzA7MDswOzA7MDsxMDg7MTE7MDswOzExOzE7MjU4MzAzNjsxO2NocmlzdG1hczswOzA7NS40NjM0NjQ4MjMyNzM2MjRlKzI5OzUuNDYzNDY0ODIzMjczNjI0ZSsyOTsxMDM0OTI0NTIwNTExOzA7MDsyMjY7MjI4OzIyMzsyMjI7MjI1OzU7MTswOzE7MTAwOzA7MDsxODk7NDY3OzE1NTcwMjM1NTE1NDY7MTU1Njk5MjAzMDQ0ODswOzEyOSwyMjc7NDA7fDE2MCwxNjAsMTg0MDI4NTc4NDIyMCwxLCwwOzE1MCwxNTAsNzE2NTA1ODQ0NTcwLDEsLDA7MTAwLDIxMCwyODczMDgyMzkzMyw5LDE1NTcwMjYyODY2MDQ6MDoxNTU3MDI0MDI5MzMxOjA6MDozNzM5OjE6MToxNTU3MDI0MDI5MzMxOiAxMTExMTAxMDExMTExMTAwMDAwMDEwMTEwMDAwMDAwMTAwIDA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOiwwOzEwMCwyMDAsODg2MTIxODQ2MDMsMSwsMDsxMDAsMTgwLDE5NjIxNTUxOTQzMSwxLCwwOzgwLDE1MCw3MzUxMjI3MzcxNzcsMSwsMDs1MCw1MCwxNzUzMjgyNjI2MDA4LDEsMi8tMS8tMSAyIDE1NTcwMjU5NTgwMzQgMSwwOzUwLDUxLDY5OTUwMzAwMjc2NTksMSwzNiAwIDM1NTUgMSwwOzMwLDMwLDE5Njg2NTA3NjkzNjA0LDEsLDA7MTUsMTUsMjE5ODQxODMyNjA2NDIsMSwsMDsxMCwxMCwyMzI3OTQ1NzQyMDkyOCwxLCwwOzUsNSw1OTkyOTYzODI0OTY5OSwyLCwwOzAsMCwwLDQsLDA7MCwwLDAsMTAsLDA7MCwwLDAsNCwsMDswLDAsMCwxMCwsMDt8MTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDAxMDEwMDAxMDEwMDAxMTExMTExMTExMTExMTExMTExMTExMTEwMDExMTExMTExMDAwMDAwMDAxMTExMTAxMTExMTExMTExMTExMTAwMDAxMDAwMDAwMDAwMDAwMDAwMDAwMDAwMTExMTExMTEwMDExMTEwMDAwMDAwMDExMDAxMTExMTAwMDEwMTAwMDAwMDAwMDAwMDAwMDAwMDAwMDEwMTAxMDEwMTAwMDExMTExMTExMDAwMDAwMDAwMDExMDAwMDAwMDAwMDAwMDAwMDAwMTAwMDAwMDAwMDAwMDAwMDExMDAxMTAwMTEwMDExMTExMTExMTEwMDAwMDAwMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAxMTExMTAxMDEwMDAxMDAwMDAxMDAwMTEwMDAwMDAwMDAwMDAwMDAwMDAxMTExMTExMTAwMDAwMDEwMTEwMDAwMDAxMTAwMDAwMDAwMDAwMDAwMTExMTAwMTExMTAwMTEwMDAwMDAxMTExMTExMTAwMDAxMTExMTExMTAwMDAxMTExMTExMDAwMDAxMTExMTExMTExMTEwMDAwMDAwMDAwMDAwMDAwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDEwMTAxMDExMTExMTExMTExMTExMDAxMDAwMTAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDExMTExMTExMTExMTExMTExMDExMTExMTExMDAwMDExMDAwMDEwMDAwMDAwMDAxMDAwMDAxMDAwMTAwMDEwMDAwMDAwMDAwMDAwMDAwMDAwMTExMTExMTExMTAwMDAwMDAwMDAwMDAwMDAwMDAwMTExMTExMTExMTExMTAwMDAwMDAwMDAwMDAwMDAwMDAwMDEwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAxMDAwMDAwMDAwMDAwMDExMTExMTEwMDAwMDAwMDAwMDAwMDAwMDAwMTAwMDAwMDAwMDAwMDAwMDEwMTAxMDEwMTAxMDEwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDEwMTExMTAwMDAwMDAwMDAxMTExMTExMTAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAxMTAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMTEwMDExMTExMTExMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMTExMTEwMTEwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAxMTExMTExMXwxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDExMTExMTExMTExMTExMTExMTExMTExMTEwMDAwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDAwMDAwMDAwMDAwMDExMTEwMTExMTExMTExMTEwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExfA%3D%3D%21END%21%3D%3D%21END%21"
	$scope.save_string = ""
	$scope.lookahead = 200

	// fill the save code input if previous save code exists in LocalStorage
	const previousSaveCode = window.localStorage.getItem("fthof_save_code");
	if (previousSaveCode) $scope.save_string = previousSaveCode;

	/**
	 * push more items to FtHoF list
	 *
	 * @param {number=} count load row count (default: 50)
	 */
	const load_more = (count = 50) => {
		$scope.lookahead += count;
		update_cookies();
	};

	/**
	 * pop and push items to FtHoF list
	 *
	 * @param {number=} count cast count (default: 1)
	 */
	const cast_spell = (count = 1) => {
		const callCount = count;
		$scope.spellsCast += callCount;
		$scope.spellsCastTotal += callCount;
		update_cookies();
	};

	/**
	 * log $scope (debug function)
	 */
	const print_scope = () => {
		console.log($scope);
	};

	/**
	 * load save code
	 *
	 * @param {string=} saveCode save code (if omitted, read from html)
	 */
	const load_game = (saveCode) => {
		// read from html
		const saveStr = saveCode ? saveCode : String($scope.save_string);

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
			$scope.save_string = "invalid save code";
			return;
		}

		// save valid save code to LocalStorage
		window.localStorage.setItem("fthof_save_code", saveStr);

		// set to $scope
		$scope.seed = saveData.seed;
		$scope.ascensionMode = saveData.ascensionMode;
		$scope.spellsCast = saveData.spellsCast;
		$scope.spellsCastTotal = saveData.spellsCastTotal;

		// calculate and display FtHoF list
		update_cookies();
	};

	/**
	 * calculate future FtHoF que and display result
	 */
	const update_cookies = () => {
		$scope.cookies = []
		$scope.randomSeeds = [];
		$scope.baseBackfireChance = 0.15*($scope.supremeintellect?1.1:1)*($scope.diminishineptitude?0.1:1);
		$scope.backfireChance = $scope.baseBackfireChance+0.15*$scope.on_screen_cookies;
		$scope.displayCookies = [];
		let bsIndices = [];
		let skipIndices = [];
		let currentTime = Date.now();
		for (let i = 0; i < $scope.lookahead; i++) {
			let currentSpell = i+$scope.spellsCastTotal;
			Math_seedrandom($scope.seed + '/' + currentSpell);
			let roll = Math.random();
			$scope.randomSeeds.push(roll);

			$scope.cookies.push([])
			$scope.displayCookies.push([])
			let cookie1Success = castFtHoF($scope.spellsCastTotal + i, false, "GC")
			let cookie2Success = castFtHoF($scope.spellsCastTotal + i, true, "GC")
			//cookie3 = check_cookies($scope.spellsCastTotal + i, true)
			let cookie1Backfire = castFtHoF($scope.spellsCastTotal + i, false, "RC")
			let cookie2Backfire = castFtHoF($scope.spellsCastTotal + i, true, "RC")
			let gambler = check_gambler($scope.spellsCastTotal + i)
			$scope.cookies[i].push(cookie1Success)
			$scope.cookies[i].push(cookie2Success)
			$scope.cookies[i].push(cookie1Backfire)
			$scope.cookies[i].push(cookie2Backfire)
			$scope.cookies[i].push(gambler)

			if (cookiesContainBuffs($scope.include_ef_in_sequence, cookie1Success, cookie2Success, cookie1Backfire, cookie2Backfire) || gambler.hasBs || ($scope.include_ef_in_sequence && gambler.hasEf)) {
				bsIndices.push(i);
			}

			if (($scope.skip_abominations && gambler.type == 'Resurrect Abomination') || ($scope.skip_edifices && gambler.type == 'Spontaneous Edifice' && !gambler.backfire)) {
				skipIndices.push(i);
			}

			if ($scope.randomSeeds[i] + $scope.backfireChance < 1) {
				$scope.displayCookies[i].push($scope.cookies[i][0]);
				$scope.displayCookies[i].push($scope.cookies[i][1]);
				if ($scope.cookies[i][2].type == "Elder Frenzy") {$scope.displayCookies[i][0].type += " (EF)"; $scope.displayCookies[i][0].noteworthy = true;}
				if ($scope.cookies[i][3].type == "Elder Frenzy") {$scope.displayCookies[i][1].type += " (EF)"; $scope.displayCookies[i][1].noteworthy = true;}
				if ($scope.cookies[i][2].type == "Free Sugar Lump") {$scope.displayCookies[i][0].type += " (Lump)";}
				if ($scope.cookies[i][3].type == "Free Sugar Lump") {$scope.displayCookies[i][1].type += " (Lump)";}
			}
			else {
				$scope.displayCookies[i].push($scope.cookies[i][2]);
				$scope.displayCookies[i].push($scope.cookies[i][3]);
				if ($scope.cookies[i][0].type == "Building Special") {$scope.displayCookies[i][0].type += " (BS)"; $scope.displayCookies[i][0].noteworthy = true;}
				if ($scope.cookies[i][1].type == "Building Special") {$scope.displayCookies[i][1].type += " (BS)"; $scope.displayCookies[i][1].noteworthy = true;}
				if ($scope.cookies[i][0].type == "Free Sugar Lump") {$scope.displayCookies[i][0].type += " (Lump)";}
				if ($scope.cookies[i][1].type == "Free Sugar Lump") {$scope.displayCookies[i][1].type += " (Lump)";}
			}
			$scope.displayCookies[i].push(gambler);
		}
		console.log($scope.cookies);
		console.log(bsIndices);
		console.log(skipIndices);
		console.log(Date.now()-currentTime);

		$scope.combos = {}

		for (let combo_length = $scope.min_combo_length; combo_length <= $scope.max_combo_length; combo_length++) {
			$scope.combos[combo_length] = findCombos(combo_length, $scope.max_spread, bsIndices, skipIndices);
		}

		console.log('Combos: ');
		console.log($scope.combos);
		console.log(Date.now()-currentTime);
	}

	/**
	 * toggle interface button
	 *
	 * @param {number} contentId number of "content-*"
	 */
	const collapse_interface = (contentId) => {
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
	//if nothing that satisfies max_spread, shortest will still be filled but first will be empty
	/**
	 * find comboes from indexes
	 *
	 * @param {number} combo_length want length of combo
	 * @param {number} max_spread number of max spread (padding; neither BS nor skip)
	 * @param {number[]} bsIndices indexes of buff (Building Special etc.)
	 * @param {number[]} skipIndices indexes of skippable GFD (Resurrect Abomination etc.)
	 * @returns {object} found result
	 */
	const findCombos = (combo_length, max_spread, bsIndices, skipIndices) => {
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
			if (firstStart == -1 && distance <= combo_length + max_spread) {
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
	 * @returns FtHoF cast result
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
			if ($scope.diminishineptitude) failChance *= 0.1;
			//if (Game.hasBuff('Magic inept')) failChance*=5;  // TODO: not implemented
			failChance *= 1 + 0.1 * $scope.supremeintellect;  // TODO: Reality Bending x1.1
			failChance += 0.15 * $scope.on_screen_cookies;  // L46
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
	$scope.load_more          = load_more;
	$scope.cast_spell         = cast_spell;
	$scope.print_scope        = print_scope;
	$scope.load_game          = load_game;
	$scope.update_cookies     = update_cookies;
	$scope.collapse_interface = collapse_interface;
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
