/**
 * FtHoF Planner v6b
 * save_code.ts
 *
 * types, functions about Cookie Clicker game save code
 */
import { b64_to_utf8 } from "./game_related_data.js";
/** LocalStorage key for saving save code */
const localStorageKey = "fthof_save_code";
/**
 * Extract save data about Magic tower minigame from exported save code.
 *
 * causes TypeError if invalid save code
 *
 * @param saveCode exported save code
 * @returns extracted save data
 */
export const extractSaveData = (saveCode) => {
    // load save data
    // to see detail: console.log(Game.WriteSave(3))
    // decode save code
    // simulating: main.js v2.052
    //             > Game.ImportSaveCode (L2625)
    //             > Game.LoadSave (L2628 > L2903)
    const unescaped = unescape(saveCode); // decode escaped string (L2906)
    const base64 = unescaped.split("!END!")[0]; // remove "!END!" (L2944)
    const decoded = b64_to_utf8(base64); // decode Base64 string (L2945)
    // extract save data: split in multiple stages
    const pipeSplited = decoded.split("|"); // (L2951)
    const runDetails = pipeSplited[2].split(";"); // (L2973)
    const miscGameData = pipeSplited[4].split(";"); // (L3012)
    const buildings = pipeSplited[5].split(";"); // (L3069)
    // seed, ascensionMode
    const seed = runDetails[4]; // (L2978)
    const ascensionMode = parseInt(miscGameData[29]); // (L3041)
    // load Wizard tower minigame data
    const wizardTower = buildings[7]; // (L3069)
    const wizDataStr = wizardTower.split(",")[4]; // (L3078)
    const wizData = wizDataStr.split(" "); // (L3080 > minigameGrimoire.js L463 > L469)
    // spellsCast, spellsCastTotal
    const [strMagic, strSpellsCast, strSpellsCastTotal, strOn] = wizData; // (L471-L474)
    const spellsCast = parseInt(strSpellsCast) || 0;
    const spellsCastTotal = parseInt(strSpellsCastTotal) || 0;
    // log
    console.table({ seed, wizardTower, spellsCast, spellsCastTotal });
    // return
    const saveData = {
        seed: seed,
        ascensionMode: ascensionMode,
        spellsCast: spellsCast,
        spellsCastTotal: spellsCastTotal,
    };
    return saveData;
};
/**
 * save Cookie Clicker save code to LocalStorage
 *
 * @param saveCode Cookie Clicker save code
 */
export const saveSaveCodeToLS = (saveCode) => {
    try {
        window.localStorage.setItem(localStorageKey, saveCode);
    }
    catch (error) {
        console.error("LocalStorage is full", error);
    }
};
/**
 * load Cookie Clicker save code from LocalStorage
 */
export const loadSaveCodeFromLS = () => {
    const saveCode = window.localStorage.getItem(localStorageKey);
    return saveCode;
};
/**
 * remove Cookie Clicker save code from LocalStorage
 */
export const removeSaveCodeFromLS = () => {
    window.localStorage.removeItem(localStorageKey);
};
//# sourceMappingURL=save_code.js.map