export function isoToMDY(iso: string) {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    if (!y || !m || !d) return "";
    return `${Number(m)}/${Number(d)}/${y}`;
}

export function mdyToISO(mdy: string) {
    if (!mdy) return "";
    const [m, d, y] = mdy.split("/");
    if (!m || !d || !y) return "";
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}