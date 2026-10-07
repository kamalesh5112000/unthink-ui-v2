// theme names
export const THEME_ALL = "all";
export const THEME_DEFAULT = "default";
export const THEME_RED = "red";
export const THEME_LOVER = "lover";
export const THEME_MIDNIGHTS = "midnights";
export const THEME_TAYLOR_SWIFT = "taylor-swift";
export const THEME_REPUTATION = "reputation";
export const THEME_FOLKLORE = "folklore";
export const THEME_FEARLESS = "fearless";
export const THEME_THE_TORTURED_POETS_DEPARTMENT =
	"the-tortured-poets-department";
export const THEME_SPEAK_NOW = "speak-now";
export const THEME_1989 = "1989";
export const THEME_EVERMORE = "evermore";

// theme codes containing all themes codes, styles and properties
export const THEME_CODES = {
	[THEME_DEFAULT]: {
		name: "default theme",
		productCard: {
			hover_bg: "rgba(0, 0, 0, 0.7)",
		},
		header: {
			announcement_bar_bg: "var(--color-secondary)",
			announcement_bar_text: "black",
			header_bg: "#f2f2f2",
			font_weight:'860'
		},
		page_container_bg: "#fff",
	},
	[THEME_RED]: {
		name: "red theme",
		productCard: {
			hover_bg: "rgba(255, 0, 0, 0.7)",
		},
		header: {
			announcement_bar_bg: "rgb(122, 46, 57)",
			announcement_bar_text: "rgb(255, 250, 250)",
			header_bg: "rgb(178, 34, 34)",
			textColor:'rgba(255, 255, 255, 1)',
			fills:'brightness(0) invert(1) opacity(0.7)'
		},
		page_container_bg: "rgb(255, 250, 250)",
	},
	[THEME_MIDNIGHTS]: {
		name: "midnights theme",
		productCard: {
			hover_bg: "rgba(25, 25, 112, 0.7)",
		},
		header: {
			announcement_bar_bg: "rgb(36, 46, 71)",
			announcement_bar_text: "rgb(234, 240, 255)",
			header_bg: "rgb(17, 46, 118)",
			textColor:'rgba(255, 255, 255, 1)',
			fills:'brightness(0) invert(1) opacity(0.7)'
		},
		page_container_bg: "#EAF0FF",
	},
	[THEME_LOVER]: {
		name: "lover theme",
		productCard: {
			hover_bg: "rgb(227, 125, 164,0.7)",
		},
		header: {
			announcement_bar_bg: "rgb(210, 68, 125)",
			announcement_bar_text: "rgb(255, 240, 245)",
			header_bg: "#FFB0D6",
			textColor:'rgba(255, 255, 255, 1)',
			fills:'brightness(0) invert(1) opacity(0.7)'
		},
		page_container_bg: "#FFF1F5",
	},
	[THEME_TAYLOR_SWIFT]: {
		name: "taylor-swift theme",
		productCard: {
			hover_bg: "rgb(99, 166, 166,0.7)",
		},
		header: {
			announcement_bar_bg: "rgb(165, 201, 166)",
			announcement_bar_text: "rgb(0, 86, 63)",
			header_bg: "rgb(0, 128, 128)",
			textColor:'rgba(255, 255, 255, 1)',
			fills:'brightness(0) invert(1) opacity(0.7)'
		},
		page_container_bg: "rgb(253, 255, 254)",
	},
	[THEME_REPUTATION]: {
		name: "reputation theme",
		productCard: {
			hover_bg: "rgb(116, 111, 112,0.7)",
		},
		header: {
			announcement_bar_bg: "rgb(116, 111, 112)",
			announcement_bar_text: "rgb(245, 245, 245)",
			header_bg: "rgb(38, 38, 38)",
			textColor:'rgba(255, 255, 255, 1)',
			fills:'brightness(0) invert(1) opacity(0.7)'
		},
		page_container_bg: "rgb(245, 245, 245)",
	},
	[THEME_FOLKLORE]: {
		name: "folklore theme",
		productCard: {
			hover_bg: "rgb(116, 126, 112,0.7)",
		},
		header: {
			announcement_bar_bg: "rgb(205, 201, 193)",
			announcement_bar_text: "rgb(105, 105, 105)",
			header_bg: "rgb(105, 105, 105)",
			textColor:'rgba(255, 255, 255, 1)',
			fills:'brightness(0) invert(1) opacity(0.7)'
		},
		page_container_bg: "rgb(245, 245, 245)",
	},
	[THEME_FEARLESS]: {
		name: "fearless theme",
		productCard: {
			hover_bg: "rgb(212, 167, 112,0.7)",
		},
		header: {
			announcement_bar_bg: "rgb(220, 198, 170)",
			announcement_bar_text: "rgb(254, 255, 254)",
			header_bg: "rgb(206, 143, 64)",
			textColor:'rgba(255, 255, 255, 1)',
			fills:'brightness(0) invert(1) opacity(0.7)'
		},
		page_container_bg: "rgb(254, 252, 238)",
	},
	[THEME_THE_TORTURED_POETS_DEPARTMENT]: {
		name: "the-tortured-poets-department theme",
		productCard: {
			hover_bg: "rgb(102, 100, 97,0.7)",
		},
		header: {
			announcement_bar_bg: "rgb(94, 91, 88)",
			announcement_bar_text: "rgb(237, 232, 229)",
			header_bg: "rgb(43, 43, 43)",
			textColor:'rgba(255, 255, 255, 1)',
			fills:'brightness(0) invert(1) opacity(0.7)'
		},
		page_container_bg: "rgb(237, 232, 229)",
	},
	[THEME_SPEAK_NOW]: {
		name: "speak-now theme",
		productCard: {
			hover_bg: "rgb(169, 86, 167,0.7)",
		},
		header: {
			announcement_bar_bg: "rgb(199, 168, 203)",
			announcement_bar_text: "rgb(128, 0, 128)",
			header_bg: "rgb(138, 2, 139)",
			textColor:'rgba(255, 255, 255, 1)',
			fills:'brightness(0) invert(1) opacity(0.7)'
		},
		page_container_bg: "rgb(230, 230, 250)",
	},
	[THEME_1989]: {
		name: "1989 theme",
		productCard: {
			hover_bg: "rgb(125, 162, 197,0.7)",
		},
		header: {
			announcement_bar_bg: "rgb(231, 249, 255)",
			announcement_bar_text: "rgb(71, 130, 180)",
			header_bg: "rgb(71, 130, 180)",
			textColor:'rgba(255, 255, 255, 1)',
			fills:'brightness(0) invert(1) opacity(0.7)'
		},
		page_container_bg: "rgb(231, 249, 255)",
	},
	[THEME_EVERMORE]: {
		name: "evermore theme",
		productCard: {
			hover_bg: "rgb(121, 53, 33,0.7)",
		},
		header: {
			announcement_bar_bg: "rgb(196, 173, 144)",
			announcement_bar_text: "rgb(103, 35, 14)",
			header_bg: "rgb(123, 63, 0)",
			textColor:'rgba(255, 255, 255, 1)',
			fills:'brightness(0) invert(1) opacity(0.7)'
		},
		page_container_bg: "rgb(255, 243, 231)",
	},
};
