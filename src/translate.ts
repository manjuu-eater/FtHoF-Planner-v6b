/**
 * FtHoF Planner v6b
 * translate.ts
 *
 * translation definition
 */


/** translation dictionary */
type EnToLocalWordDict = {
	"Lucky": string;
	"Ruin": string;
	"Cookie Chain": string;
	"Frenzy": string;
	"Elder Frenzy": string;
	"Clot": string;
	"Cursed Finger": string;
	"Click Frenzy": string;
	"Cookie Storm": string;
	"Sugar Lump": string;
};


// code for getting translated words in each languages
/*(async () => {
	// base loc() id to get translated words
	const locIds = [
		// not buff: main.js L5542, L5549, L5589
		"Lucky!", "Ruin!", "Cookie chain",

		// buff: main.js L13865
		"Frenzy", "Elder frenzy", "Clot", "Cursed finger", "Click frenzy", "Cookie storm",

		// language file L7, main.js L4520
		"sugar lump", "%1 sugar lump",
	];
	const translateds = {};
	for (const lang in Langs) {  // L305
		LoadLang('loc/'+lang+'.js?v='+Game.version);  // L16915 > L16861 > L16868
		await new Promise((res) => setTimeout(res, 3000));
		translateds[lang] = locIds.map(e => loc(e));
	};
	console.log(translateds);
})();*/


export const langDict: { [lang: string]: EnToLocalWordDict } = {
	"EN": {
		"Lucky": "Lucky",
		"Ruin": "Ruin",
		"Cookie Chain": "Cookie Chain",
		"Frenzy": "Frenzy",
		"Elder Frenzy": "Elder Frenzy",
		"Clot": "Clot",
		"Cursed Finger": "Cursed Finger",
		"Click Frenzy": "Click Frenzy",
		"Cookie Storm": "Cookie Storm",
		"Sugar Lump": "Sugar Lump",
	},
	"FR": {
		"Lucky": "Quelle chance",
		"Ruin": "Raté",
		"Cookie Chain": "Chaîne de cookies",
		"Frenzy": "Frénésie",
		"Elder Frenzy": "Frénésie des anciennes",
		"Clot": "Caillot",
		"Cursed Finger": "Doigt maudit",
		"Click Frenzy": "Frénésie de clics",
		"Cookie Storm": "Tempête de cookies",
		"Sugar Lump": "morceau de sucre",
	},
	"DE": {
		"Lucky": "Glück",
		"Ruin": "Ruin",
		"Cookie Chain": "Keks-Kette",
		"Frenzy": "Rausch",
		"Elder Frenzy": "Ältestenrausch",
		"Clot": "Gerinnsel",
		"Cursed Finger": "Verfluchter Finger",
		"Click Frenzy": "Klickrausch",
		"Cookie Storm": "Kekssturm",
		"Sugar Lump": "Würfelzucker",
	},
	"NL": {
		"Lucky": "Geluk",
		"Ruin": "Geruïneerd",
		"Cookie Chain": "Koekjesketen",
		"Frenzy": "Frenzy",
		"Elder Frenzy": "Ouderlingenfrenzy",
		"Clot": "Prop",
		"Cursed Finger": "Vervloekte Vinger",
		"Click Frenzy": "Klikfrenzy",
		"Cookie Storm": "Koekjesstorm",
		"Sugar Lump": "Suikerklontje",
	},
	"CS": {
		"Lucky": "Šťastlivec",
		"Ruin": "Ztráta",
		"Cookie Chain": "Keksový řetězec",
		"Frenzy": "Frenzy",
		"Elder Frenzy": "Starší Frenzy",
		"Clot": "Sraženina",
		"Cursed Finger": "Prokletý prst",
		"Click Frenzy": "Klikněte na Frenzy",
		"Cookie Storm": "Sušenková bouře",
		"Sugar Lump": "cukrová hrudka",
	},
	"PL": {
		"Lucky": "Szczęściarz",
		"Ruin": "Tragedia",
		"Cookie Chain": "Ciastkowy łańcuch",
		"Frenzy": "Szał",
		"Elder Frenzy": "Szał starszyzny",
		"Clot": "Zakrzep",
		"Cursed Finger": "Przeklęty palec",
		"Click Frenzy": "Szał klikania",
		"Cookie Storm": "Ciastkowa burza",
		"Sugar Lump": "grudka cukru",
	},
	"IT": {
		"Lucky": "Che fortuna",
		"Ruin": "Che disgrazia",
		"Cookie Chain": "Combo di biscotti",
		"Frenzy": "Frenesia",
		"Elder Frenzy": "Frenesia venerabile",
		"Clot": "Coagulo",
		"Cursed Finger": "Dita maledette",
		"Click Frenzy": "Frenesia di clic",
		"Cookie Storm": "Tempesta di biscotti",
		"Sugar Lump": "zolletta di zucchero",
	},
	"ES": {
		"Lucky": "Qué suerte",
		"Ruin": "Porras",
		"Cookie Chain": "Cadena de galletas",
		"Frenzy": "Frenesí",
		"Elder Frenzy": "Frenesí de ancianas",
		"Clot": "Grumo",
		"Cursed Finger": "Dedo maldito",
		"Click Frenzy": "Frenesí de clics",
		"Cookie Storm": "Tormenta de galletas",
		"Sugar Lump": "terrón de azúcar",
	},
	"PT-BR": {
		"Lucky": "Que sorte",
		"Ruin": "Ruína",
		"Cookie Chain": "Corrente de cookies",
		"Frenzy": "Frenesi",
		"Elder Frenzy": "Frenesi Ancestral",
		"Clot": "Coágulo",
		"Cursed Finger": "Dedo amaldiçoado",
		"Click Frenzy": "Frenesi de cliques",
		"Cookie Storm": "Tempestade de cookies",
		"Sugar Lump": "torrão de açúcar",
	},
	"JA": {
		"Lucky": "ラッキー",
		"Ruin": "台無し",
		"Cookie Chain": "クッキーチェーン",
		"Frenzy": "フィーバー",
		"Elder Frenzy": "エルダーフィーバー",
		"Clot": "障害発生",
		"Cursed Finger": "呪われた指",
		"Click Frenzy": "クリックフィーバー",
		"Cookie Storm": "クッキー乱舞",
		"Sugar Lump": "砂糖玉",
	},
	"ZH-CN": {
		"Lucky": "好运气",
		"Ruin": "破财",
		"Cookie Chain": "饼干连锁",
		"Frenzy": "狂热",
		"Elder Frenzy": "长者狂热",
		"Clot": "凝块",
		"Cursed Finger": "被诅咒的手指",
		"Click Frenzy": "点击狂热",
		"Cookie Storm": "饼干风暴",
		"Sugar Lump": "糖块",
	},
	"KO": {
		"Lucky": "행운",
		"Ruin": "파멸",
		"Cookie Chain": "쿠키 체인",
		"Frenzy": "프렌지",
		"Elder Frenzy": "장로 프렌지",
		"Clot": "응고",
		"Cursed Finger": "저주받은 손가락",
		"Click Frenzy": "클릭 프렌지",
		"Cookie Storm": "쿠키 폭풍",
		"Sugar Lump": "각설탕",
	},
	"RU": {
		"Lucky": "Повезло",
		"Ruin": "Разорение",
		"Cookie Chain": "Цепочка печенья",
		"Frenzy": "Безумие",
		"Elder Frenzy": "Безумие старушек",
		"Clot": "Сгусток",
		"Cursed Finger": "Проклятый палец",
		"Click Frenzy": "Кликательное безумие",
		"Cookie Storm": "Шторм печенек",
		"Sugar Lump": "кусочек сахара",
	},
};
