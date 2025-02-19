# FtHoF-Planner-v6

FtHoF Planner for Cookie Clicker by Orteil

*This version is compatible with version 2.052, "often imitated, never duplicated"  update that went live on 07-05-2023*


### Usage

- **Force the Hand of Fate is not completely random, it is based on your game's seed (which changes after each ascension) and on the number of spells cast this game. This means that if you know the seed then you can predict the results for casting Force the Hand of Fate.**
	- There are two main things that can affect the result of FtHoF, the current season <s>and the golden cookie sound selector</s>. If the season is Valentines or Easter the random seed will be increased once. This means there are 2 possible results for each cast of FtHoF depending on the selected season. Continuing to switch between seasons will not affecting the results, they only affect the result at the time the spell is cast.
	- Dragonflight can also affect the results of casting FtHoF. If the buff is active (not just possible) when FtHoF is cast then Click Frenzy is not added to the pool of possible results. This can change the result even if the original result was not a Click Frenzy.
	- Another thing that after the result is how many golden cookies are already on the screen. Each one increases the chance of failure by 15%.
	- Since the result of FtHoF is based on the number of spells cast, if the next FtHoF cookie is not the one you want, you can cast a different spell to skip this one. This can be useful if you are searching for a particular cookie or need to skip a wrath cookie.

- **Combo search: Once you import a save file, the planner will display both the earliest and shortest versions of combos. Combos are combinations of Building Specials (BS) (and optionally Elder Frenzies (EF)) that are close together.**
	- Min combo is the smallest combo to search for; Max is the largest.
	- Spread is how much leeway to include in the combo search. For example, if you want a 3x combo and are ok with a sequence of [BS, non-BS, BS, BS], that would be a combo size of 3 with a spread of 1, for a total length of 4.
	- Include Elder Frenzies is asking whether to count EF spawns from FtHoF in your combos. For most people these are just as good, if not better than Building Specials, so they're included by default. But in some cases you may not want EF via FtHoF, so I have an option to exclude it.
	- For Skip Abominations and Skip Spontaneous Edifices, see below for more explanation, but these options are just asking whether to factor in skippable rows when searching for combos. Can't imagine why you'd want this off, but I have the option there at least for educational purposes.

- **Gambler's fever dream: Added a column for this, as it's critical to getting combos:**
	- More chances for Building Special or Elder Frenzy via Gambler's -> FtHoF. Plus these casts end up costing significantly less mana, which can help with more spread-out combos. Hover over the cookie when it's FtHoF to see what the cookie might contain
	- Allows for more combos by skipping over certain rows when desired. (Abominations and successful Spontaneous Edifice casts from Gambler's can both increment your spell counter for free, i.e. without costing any mana.)
	- For the same skipping reason as above, this can help in incrementing your spell counter quickly to get to your desired combo.

- Lookahead length: This is how many grimoire casts (rows) are loaded when you import (original had it hard-coded to 10).

- Spell counter column (the one on the left) now includes indices for both your spells casts this ascension, and total spells cast

- Building Specials and Elder Frenzies are highlighted yellow
- Rows skippable via Gambler's have their Gambler's spell highlighted blue.
- **Cast Spell and Apply Settings:**
	- The Cast Spell button will forward the whole list 1 spell. It will also apply all settings so if you have changed them the outcome for future spells may change. If you have to cast FtHoF for a CF first you want to keep that cookie on screen, this way you can up the "Golden Cookies on screen" and then cast spell
	- If you made progress you don't want to click the Import Save button as it will reset your manually cast spells. You can use Apply Settings to change stuff up without losing track.

- For early game players the possibility to hide the One change column as they won't have Season Switcher

- Added a checkbox for the "Supreme Intellect" dragon aura as this should influence the positive/negative rate by 10% more negative. <s>This is maybe a bug in the game but currently this button is a placebo or a placeholder for future implementation</s>. The game and the planner do currently not step out of line when using the aura without any update to the planner.


### Credits

- [FtHoF Planner v1](http://fthof-planner.s3-website.us-east-2.amazonaws.com/) by [RebelKeithy](https://www.reddit.com/user/RebelKeithy) (reddit)
	- The first version made good use of the code that you can just copy from the cookie clicker website and interpreted the code in a way that made the first FtHoF planner. Basic but a powerful start.

- [FtHoF Planner v2](https://messieurs.github.io/fthofplannerv2/) by [@skeezy](https://discord.gg/cookie) (discord)
	- The second version of the FtHoF planner with undeniable the biggest update to it to date. The new version also made it possible to have a look into the Gambler's Fever Dream and a combo-finder was added which made it more easy to actually find them.

- [FtHoF Planner v3](https://eminenti.github.io/FtHoF-Planner-v3/) by [@eminenti](https://discord.com/invite/r6hssr5) (discord)
	- The third version was mainly a bugfix because of a bugfix. The original and second FtHoF planners made use (just like the original cookie clicker) of a second possible change to alter the outcome of FtHoF. This was a bug and fixed by Orteil. This broke the first 2 planners and was fixed in V3. Later also the combo-finder was fixed not to calculate those outcomes for Gambler's Fever Dream.

- [FtHoF Planner v4](https://mylaaan.github.io/FtHoF-Planner-v4/) by [@mylaaan](https://discord.gg/cookie) (discord)
	- The fourth version only added ease of use interface options. Like the "Cast Spell" button to make it easier to keep track of where you are without importing the save again. Also updated some visual features and removed Google Analytics.

- [FtHoF Planner v5](https://joseph3079.github.io/FtHoF-Planner-v5/) by [@joseph3079](https://discord.gg/cookie) (discord)
	- The fifth version added a "Random Seed" column, which can be used to see how many onscreen cookies will cause a spell to backfire without needing to change settings repeatedly, and can be used to tell what Gambler's Fever Dream will give when it can't choose all 8 spells. Additionally, it now shows building specials, elder frenzies, and sugar lumps that aren't visible due to a wrong backfire chance.

- [FtHoF Planner v6](https://manjuu-eater.github.io/FtHoF-Planner-v6/) by @manjuu-eater
	- Added "Cast x10" button (for Gambler's Fever Dream bashing)
	- WIP
