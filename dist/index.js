/**
 * FtHoF Planner v6b
 * index.ts
 *
 * FtHoF Planner main script file
 */
// import game related objects and functions
import { Math_seedrandom, } from "./game_related_data.js";
import { settingsModelNames, getSettings, saveSettings, loadSettings, updateSettings, initSettings, } from "./settings.js";
import { saveSaveCodeToLS, loadSaveCodeFromLS, removeSaveCodeFromLS, readSaveDataFromSaveCode, } from "./save_code.js";
import { getSaveData, saveSaveData, loadSaveData, removeSaveData, initSaveData, } from "./save_data.js";
import { getBaseFailChance, getFthofFailChance, castFtHoF, hasCookieEffect, castGFD, } from "./grimoire.js";
import { langDict } from "./translate.js";
const app = window.angular.module("myApp", ["ngMaterial"]);
app.controller("myCtrl", ($rootScope, $scope) => {
    var _a;
    // initialize Save Code
    $scope.saveCode = "";
    // initialize FtHoF Planner save data
    initSaveData($scope);
    // initialize FtHoF Planner Scope Variables
    $scope.baseBackfireChance = undefined;
    $scope.backfireChance = undefined;
    $scope.combos = [];
    $scope.sugars = [];
    $scope.grimoireResults = [];
    $scope.langDict = langDict;
    // initialize FtHoF Planner settings
    initSettings($scope);
    // ready state flag
    $scope.ready = false;
    /**
     * Select input field for easy copying when clicked or right-clicked.
     *
     * @param event event triggered by interacting with input element
     */
    const selectInput = (event) => {
        // event target element
        const eTarget = event.target;
        // only for <input>
        if (!(eTarget instanceof HTMLInputElement))
            return;
        // if right button down / up event
        if (event.button == 2) {
            if (event.type == "mousedown") {
                eTarget.dataset.isRightButtonDowned = "1";
                return;
            }
            else if (event.type == "mouseup") {
                if (!eTarget.dataset.isRightButtonDowned)
                    return;
                eTarget.dataset.isRightButtonDowned = "";
            }
            ;
        }
        // select save code input
        eTarget.select();
    };
    /**
     * log $scope (debug function)
     */
    const printScope = () => {
        console.log($scope);
    };
    /**
     * import save data from save code and update Grimoire result list
     */
    const importSave = () => {
        // if save code is blank, reset LocalStorage and quit
        if ($scope.saveCode === "") {
            removeSaveCodeFromLS();
            removeSaveData();
            return;
        }
        // import save data (and save valid save data), update list
        const isLoaded = readSaveDataFromSaveCode($scope, $scope.saveCode);
        if (isLoaded) {
            saveSaveData($scope); // save imported save data
            updateCookies();
        }
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
    const findCombos = (comboLength, maxSpread, comboIndexes, skipIndexes) => {
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
            const skips = skipIndexes.filter((index) => index > seqStart && index < seqEnd && !comboIndexes.includes(index));
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
            shortest: { idx: shortestStartIndex, length: shortestLength },
            first: { idx: firstStartIndex, length: firstLength }
        };
    };
    /**
     * calculate future FtHoF que and display result
     */
    const updateCookies = () => {
        // read $scope variables
        const { seed, spellsCastTotal, } = getSaveData($scope);
        const settings = getSettings($scope);
        const { lookahead, minComboLength, maxComboLength, maxSpread, includeEF, skipRA, skipSE, skipST, season, } = settings;
        // update Settings data
        updateSettings(settings);
        // variables to set $scope.*
        const baseBackfireChance = getBaseFailChance();
        const fthofBackfireChance = getFthofFailChance(baseBackfireChance);
        const combos = {};
        const sugars = [];
        // object that contain FtHoF and GFD result, combo / skip indexes, etc.
        const grimoireResults = [];
        // do nothing if seed is empty
        if (seed === "")
            return;
        // calculation srart time
        const startTime = performance.now();
        const comboIndexes = [];
        const skipIndexes = [];
        for (let i = 0; i < lookahead; i++) {
            // get first random number and push to array
            Math_seedrandom(seed + "/" + (spellsCastTotal + i));
            const randomNumber = Math.random();
            // minimum count of GC/WC on screen that changes GC to WC
            const wcThreshold = (randomNumber < 1 - baseBackfireChance // if false, 100% WC with no GC/WC on screen
                ? Math.ceil((1 - randomNumber - baseBackfireChance) / 0.15)
                : 0);
            // FtHoF success or backfire (L313)
            const isFthofWin = randomNumber < 1 - fthofBackfireChance;
            // get FtHoF results (both success and backfire)
            const gc0 = castFtHoF(seed, spellsCastTotal, i, false, "GC");
            const gc1 = castFtHoF(seed, spellsCastTotal, i, true, "GC");
            const wc0 = castFtHoF(seed, spellsCastTotal, i, false, "WC");
            const wc1 = castFtHoF(seed, spellsCastTotal, i, true, "WC");
            const gfd = castGFD(seed, spellsCastTotal, i);
            // cookies that user can cast (reduce cookie1 for single season option)
            const allGcWcs = [gc0, wc0, ...(season == "noswitch" ? [] : [gc1, wc1])];
            // determine whether current cookies can be part of a combo
            const canCombo = ([...allGcWcs, gfd].some(cookie => cookie.canCombo));
            if (canCombo)
                comboIndexes.push(i);
            // count skippable GFD
            if (gfd.canSkip)
                skipIndexes.push(i);
            // determine whether Sugar Lump can be get
            const gfdCookies = [gfd.cookie0, gfd.cookie1].filter(e => !!e);
            const allGcWcGfdCookies = [...allGcWcs, ...gfdCookies];
            let canSugar = hasCookieEffect(allGcWcGfdCookies, "Free Sugar Lump");
            if (hasCookieEffect([gc0, gc1], "Free Sugar Lump")) {
                const sugar = {
                    index: i,
                    isGC: true,
                    isFewBuildings: false,
                };
                sugars.push(sugar);
            }
            if (hasCookieEffect([wc0, wc1], "Free Sugar Lump")) {
                const sugar = {
                    index: i,
                    isGC: false,
                    isFewBuildings: false,
                };
                sugars.push(sugar);
            }
            if ([gc0, gc1].some(gc => gc.canGcSugarWithFewBuildings)) {
                const sugar = {
                    index: i,
                    isGC: true,
                    isFewBuildings: true,
                };
                sugars.push(sugar);
            }
            // No Change, One Change cookie to display
            const cookie0 = isFthofWin ? gc0 : wc0;
            const cookie1 = isFthofWin ? gc1 : wc1;
            // add good effect information about hidden GC/WC
            let isOtherCookieNotable0 = false;
            let isOtherCookieNotable1 = false;
            if (isFthofWin) {
                if (wc0.name == "Elder Frenzy") {
                    gc0.displayName += " (EF)";
                    gc0.noteworthy = true;
                    isOtherCookieNotable0 = true;
                }
                if (wc1.name == "Elder Frenzy") {
                    gc1.displayName += " (EF)";
                    gc1.noteworthy = true;
                    isOtherCookieNotable1 = true;
                }
                if (wc0.name == "Free Sugar Lump")
                    gc0.displayName += " (Sugar)";
                if (wc1.name == "Free Sugar Lump")
                    gc1.displayName += " (Sugar)";
            }
            else {
                if (gc0.name == "Building Special") {
                    wc0.displayName += " (BS)";
                    wc0.noteworthy = true;
                    isOtherCookieNotable0 = true;
                }
                if (gc1.name == "Building Special") {
                    wc1.displayName += " (BS)";
                    wc1.noteworthy = true;
                    isOtherCookieNotable1 = true;
                }
                if (gc0.name == "Free Sugar Lump")
                    wc0.displayName += " (Sugar)";
                if (gc1.name == "Free Sugar Lump")
                    wc1.displayName += " (Sugar)";
            }
            // set to object and push to array
            const grimoireResult = {
                num: i + 1,
                firstRandomNum: randomNumber,
                wcThreshold,
                isFthofWin,
                cookie0, gc0, wc0, isOtherCookieNotable0,
                cookie1, gc1, wc1, isOtherCookieNotable1,
                gfd,
                canCombo, canSugar,
            };
            grimoireResults.push(grimoireResult);
        }
        // find combos
        for (let comboLength = minComboLength; comboLength <= maxComboLength; comboLength++) {
            combos[comboLength] = findCombos(comboLength, maxSpread, comboIndexes, skipIndexes);
        }
        // log
        console.log("grimoireResults:", grimoireResults);
        console.log("comboIndexes:", comboIndexes);
        console.log("skipIndexes:", skipIndexes);
        console.log("Combos:", combos);
        // log performance time
        const ellapsedMilliSec = performance.now() - startTime;
        console.log("updateCookies calculate time: ", ellapsedMilliSec, "ms");
        // set to $scope
        $scope.baseBackfireChance = baseBackfireChance;
        $scope.backfireChance = fthofBackfireChance;
        $scope.combos = combos;
        $scope.sugars = sugars;
        $scope.grimoireResults = grimoireResults;
    };
    /**
     * pop and push items to FtHoF list
     *
     * @param count cast count (default: 1)
     */
    const castSpell = (count = 1) => {
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
    const loadMore = (count = 50) => {
        $scope.lookahead += count;
        updateCookies();
    };
    // set functions to $scope that called from index.html
    $scope.selectInput = selectInput;
    $scope.printScope = printScope;
    $scope.importSave = importSave;
    $scope.updateCookies = updateCookies;
    $scope.castSpell = castSpell;
    $scope.loadMore = loadMore;
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
    if ($scope.saveCode && !((_a = $scope.grimoireResults) === null || _a === void 0 ? void 0 : _a.length))
        updateCookies();
    /**
     * function that is called when something is dropped to window

     * @param event drag event object
     * @returns Promise<void>
     */
    const onItemDropped = async (event) => {
        // cancel default dropping
        event.preventDefault();
        // get DataTransfer object
        const { dataTransfer } = event;
        if (!dataTransfer)
            return;
        // get dropped text
        const droppedText = await (async () => {
            var _a;
            // dropped simple text
            const simpleText = dataTransfer.getData("text");
            if (simpleText)
                return simpleText;
            // search save file from dropped items (max: 100 files)
            for (let i = 0; i < 100; i++) {
                const item = dataTransfer.items[i];
                if (item.kind != "file" || item.type != "text/plain")
                    continue;
                const fileText = await ((_a = item.getAsFile()) === null || _a === void 0 ? void 0 : _a.text());
                if (fileText === null || fileText === void 0 ? void 0 : fileText.includes("END"))
                    return fileText;
            }
            return "";
        })();
        // save code text or file is not dropped
        if (!droppedText)
            return;
        // try loading save data with dropped save code
        const isLoadSuccess = readSaveDataFromSaveCode($scope, droppedText);
        // if valid, set save code to Save Code input area, and update list
        if (isLoadSuccess) {
            $scope.saveCode = droppedText;
            saveSaveCodeToLS(droppedText);
            saveSaveData($scope);
            updateCookies();
        }
        // manually trigger AngularJS digest cycle because this event is not tracked by AngularJS
        $scope.$apply();
    };
    /**
     * function that is called when specified $scope value changes
     *
     * @param after value after change
     * @param before value before change
     */
    const onSettingsChanged = (after, before) => {
        // do nothing if no change
        if (after === before)
            return;
        // call updateCookies()
        updateCookies();
        // save settings to LocalStorage
        saveSettings($scope);
    };
    /**
     * start watching events related to FtHoF Planner UI
     */
    const initUIEventListeners = () => {
        // support drag & drop save code input
        document.addEventListener("drop", onItemDropped);
        // start monitoring $scope changes
        settingsModelNames.forEach(modelName => $scope.$watch(modelName, onSettingsChanged));
    };
    // start watching events related to UI
    initUIEventListeners();
    // override $scope.$apply to measure AngularJS rendering time
    // $scope.$apply: can't measure first write but more accurate
    // $rootScope.$digest: can measure first write but a little short time
    (() => {
        const originalApply = $scope.$apply; // can be $rootScope.$digest
        $scope.$apply = function () {
            const start = performance.now();
            const result = originalApply.apply(this, arguments);
            const end = performance.now();
            console.log("AngularJS rendering time: ", end - start, "ms");
            return result;
        };
    })();
    // remove loading text
    $scope.ready = true;
});
// to allow drag & drop save codes, disable browser to receive dropped objects
document.addEventListener("dragover", (event) => event.preventDefault());
//# sourceMappingURL=index.js.map