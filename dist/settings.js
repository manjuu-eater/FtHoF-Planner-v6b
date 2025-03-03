/**
 * FtHoF Planner v6b
 * settings.ts
 *
 * types, functions of FtHoF settings
 */
/** LocalStorage key for saving settings data */
const localStorageKey = "fthof_settings";
/**
 * get all FtHoF settings from $scope
 *
 * @param $scope AngularJS $scope
 * @returns current settings
 */
export const getSettings = ($scope) => {
    const settings = {
        lookahead: $scope.lookahead,
        minComboLength: $scope.minComboLength,
        maxComboLength: $scope.maxComboLength,
        maxSpread: $scope.maxSpread,
        includeEF: $scope.includeEF,
        skipRA: $scope.skipRA,
        skipSE: $scope.skipSE,
        skipST: $scope.skipST,
        screenCookieCount: $scope.screenCookieCount,
        buffDF: $scope.buffDF,
        auraSI: $scope.auraSI,
        buffDI: $scope.buffDI,
        debuffDI: $scope.debuffDI,
        season: $scope.season,
    };
    return settings;
};
/**
 * set all FtHoF settings to $scope
 *
 * @param $scope AngularJS $scope
 * @param settings settings to set
 */
export const setSettings = ($scope, settings) => {
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
export const saveSettings = ($scope) => {
    const settings = getSettings($scope);
    const jsonSettings = JSON.stringify(settings);
    try {
        window.localStorage.setItem(localStorageKey, jsonSettings);
    }
    catch (error) {
        console.error("LocalStorage is full", error);
    }
};
/**
 * load FtHoF settings from LocalStorage
 *
 * @param $scope AngularJS $scope
 */
export const loadSettings = ($scope) => {
    const jsonSettings = window.localStorage.getItem(localStorageKey);
    if (!jsonSettings)
        return;
    try {
        const objSettings = JSON.parse(jsonSettings);
        setSettings($scope, objSettings);
    }
    catch (error) {
        console.error("LocalStorage value is invalid", error);
    }
};
//# sourceMappingURL=settings.js.map