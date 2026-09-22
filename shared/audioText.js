// Shared by the study catalog and the API player: punctuation does not duplicate requests.
export const audioKey = text => String(text || "").normalize("NFKC").replace(/[\s。、！？!?.,・]/g, "").trim();
