/**
 * image file paths
 */
/** image url of GC */
export const gcImageUrl = "./img/goldCookie.png";
/** image url of GC */
export const wcImageUrl = "./img/wrathCookie.png";
/**
 * make heart image url from image index
 *
 * @param index index of image
 * @returns image url
 */
export const heartImageUrl = (index) => {
    return `./img/hearts/${index}.png`;
};
/**
 * make bunny image url from image index
 *
 * @param isWrath true if wrath cookie
 * @param index index of image
 * @returns image url
 */
export const bunnyImageUrl = (isWrath, index) => {
    const isWrathNum = isWrath ? "1" : "0";
    return `./img/bunnies/${isWrathNum}${index}.png`;
};
/**
 * dictionary of spell icon image file url
 */
export const spellNameToIconUrl = {
    "Conjure Baked Goods": "./img/spells/0.png",
    "Force the Hand of Fate": "./img/spells/1.png",
    "Stretch Time": "./img/spells/2.png",
    "Spontaneous Edifice": "./img/spells/3.png",
    "Haggler's Charm": "./img/spells/4.png",
    "Summon Crafty Pixies": "./img/spells/5.png",
    "Gambler's Fever Dream": "./img/spells/6.png",
    "Resurrect Abomination": "./img/spells/7.png",
    "Diminish Ineptitude": "./img/spells/8.png",
};
//# sourceMappingURL=image_file_paths.js.map