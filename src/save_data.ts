/**
 * FtHoF Planner v6b
 * save_data.ts
 *
 * types, functions of FtHoF Planner save data related to Cookie Clicker game data
 */


/** FtHoF Planner save data */
export type SaveData = {
	seed: string;
	ascensionMode: number;
	spellsCast: number;
	spellsCastTotal: number;
};


/** LocalStorage key for saving FtHoF Planner save data */
const localStorageKey = "fthof_save_data";


/**
 * get all FtHoF Planner save data from $scope
 *
 * @param $scope AngularJS $scope
 * @returns current save data
 */
export const getSaveData = ($scope: any): SaveData => {
	const saveData = {
		seed:            $scope.seed,
		ascensionMode:   $scope.ascensionMode,
		spellsCast:      $scope.spellsCast,
		spellsCastTotal: $scope.spellsCastTotal,
	};
	return saveData;
};


/**
 * set all FtHoF Planner save data to $scope
 *
 * @param $scope AngularJS $scope
 * @param saveData saveData to set
 */
export const setSaveData = ($scope: any, saveData: SaveData) => {
	Object.keys(saveData).forEach(key => {
		if (key in $scope) {
			// @ts-expect-error  ts(7053)
			$scope[key] = saveData[key];
		}
	});
};


/**
 * save FtHoF Planner save data to LocalStorage
 *
 * @param $scope AngularJS $scope
 */
export const saveSaveData = ($scope: any): void => {
	const saveData = getSaveData($scope);
	const jsonsaveData = JSON.stringify(saveData);
	try {
		window.localStorage.setItem(localStorageKey, jsonsaveData);
	} catch (error) {
		console.error("LocalStorage is full", error);
	}
};


/**
 * load FtHoF Planner save data from LocalStorage
 *
 * @param $scope AngularJS $scope
 */
export const loadSaveData = ($scope: any): void => {
	const jsonsaveData = window.localStorage.getItem(localStorageKey);
	if (!jsonsaveData) return;
	try {
		const objsaveData = JSON.parse(jsonsaveData) as SaveData;
		setSaveData($scope, objsaveData);
	} catch (error) {
		console.error("LocalStorage value is invalid", error);
	}
};


/**
 * initialize $scope value about FtHoF Planner save data
 *
 * @param $scope AngularJS $scope
 */
export const initSaveData = ($scope: any): void => {
	$scope.seed            = "";
	$scope.ascensionMode   = 0;
	$scope.spellsCast      = 0;
	$scope.spellsCastTotal = 0;
};
