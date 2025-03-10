/**
 * FtHoF Planner v6b
 * settings.ts
 *
 * types, functions of FtHoF settings
 */


/** FtHoF-Planner settings */
export type Settings = {
	lookahead: number;

	minComboLength: number;
	maxComboLength: number;
	maxSpread: number;
	includeEF: boolean;
	skipRA: boolean;
	skipSE: boolean;
	skipST: boolean;

	screenCookieCount: number;
	buffDF: boolean;
	auraSI: boolean;
	auraRB: boolean;
	buffDI: boolean;
	debuffDI: boolean;

	season: string;
	hideUseless: boolean;
	shortenCSDrop: boolean;
};


/** LocalStorage key for saving settings data */
const localStorageKey = "fthof_settings";


/** names of ng-model */
export const settingsModelNames: (keyof Settings)[] = [
	"lookahead", "minComboLength", "maxComboLength", "maxSpread",
	"includeEF", "skipRA", "skipSE", "skipST",
	"screenCookieCount", "buffDF", "auraSI", "auraRB", "buffDI", "debuffDI",
	"season", "hideUseless", "shortenCSDrop",
];


/**
 * get all FtHoF settings from $scope
 *
 * @param $scope AngularJS $scope
 * @returns current settings
 */
export const getSettings = ($scope: any): Settings => {
	const settings = {
		lookahead:         $scope.lookahead,
		minComboLength:    $scope.minComboLength,
		maxComboLength:    $scope.maxComboLength,
		maxSpread:         $scope.maxSpread,
		includeEF:         $scope.includeEF,
		skipRA:            $scope.skipRA,
		skipSE:            $scope.skipSE,
		skipST:            $scope.skipST,
		screenCookieCount: $scope.screenCookieCount,
		buffDF:            $scope.buffDF,
		auraSI:            $scope.auraSI,
		auraRB:            $scope.auraRB,
		buffDI:            $scope.buffDI,
		debuffDI:          $scope.debuffDI,
		season:            $scope.season,
		hideUseless:       $scope.hideUseless,
		shortenCSDrop:     $scope.shortenCSDrop,
	};
	return settings;
};


/**
 * set all FtHoF settings to $scope
 *
 * @param $scope AngularJS $scope
 * @param settings settings to set
 */
export const setSettings = ($scope: any, settings: Settings) => {
	Object.keys(settings).forEach(key => {
		if (key in $scope) {
			// @ts-expect-error  ts(7053)
			$scope[key] = settings[key];
		}
	});
};


/**
 * save FtHoF settings to LocalStorage
 *
 * @param $scope AngularJS $scope
 */
export const saveSettings = ($scope: any): void => {
	const settings = getSettings($scope);
	const jsonSettings = JSON.stringify(settings);
	try {
		window.localStorage.setItem(localStorageKey, jsonSettings);
	} catch (error) {
		console.error("LocalStorage is full", error);
	}
};


/**
 * load FtHoF settings from LocalStorage
 *
 * @param $scope AngularJS $scope
 */
export const loadSettings = ($scope: any): void => {
	const jsonSettings = window.localStorage.getItem(localStorageKey);
	if (!jsonSettings) return;
	try {
		const objSettings = JSON.parse(jsonSettings) as Settings;
		setSettings($scope, objSettings);
	} catch (error) {
		console.error("LocalStorage value is invalid", error);
	}
};


/**
 * initialize $scope value about FtHoF settings
 *
 * @param $scope AngularJS $scope
 */
export const initSettings = ($scope: any): void => {
	// Settings: Lookahead Length
	$scope.lookahead = 200;

	// Settings: Combos
	$scope.minComboLength = 2;
	$scope.maxComboLength = 4;
	$scope.maxSpread = 2;

	// Settings: Include EF or Skip Some GFD
	$scope.includeEF = true;
	$scope.skipRA = true;
	$scope.skipSE = true;
	$scope.skipST = false;

	// Settings: Buffs / Debuffs that affect fail chance
	$scope.screenCookieCount = 0;
	$scope.buffDF = false;
	$scope.auraSI = false;
	$scope.auraRB = false;
	$scope.buffDI = false;
	$scope.debuffDI = false;

	// Settings: FtHoF Settings
	$scope.season = "cookie";
	$scope.hideUseless = false;
	$scope.shortenCSDrop = false;
};
