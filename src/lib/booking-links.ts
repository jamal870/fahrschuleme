/** Anmeldung und Buchung von Fahrstunden in der Fahrschul-App. */
export const FAHRSTUNDEN_APP_URL = "https://app.l-me.ch/api/anmeldung";

/**
 * Partner-Fahrschule Star: Nothilfekurs und Verkehrskundeunterricht (VKU).
 * Die utm-Angaben zeigen dem Partner, dass die Anfrage von dieser Website kommt.
 */
const PARTNER_UTM = "utm_source=fahrschule-me.ch&utm_medium=partner";
export const PARTNER_VKU_URL = `https://fahrschule-star.ch/vku?${PARTNER_UTM}&utm_campaign=vku#kurse`;
export const PARTNER_NOTHILFE_URL = `https://fahrschule-star.ch/nothelfer?${PARTNER_UTM}&utm_campaign=nothilfekurs#kurse`;
/** Partner-Links sind Verweise mit Gegenleistung, daher "sponsored". */
export const PARTNER_LINK_REL = "noopener sponsored";
