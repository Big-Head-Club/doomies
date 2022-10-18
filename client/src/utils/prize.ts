export const totalPrize = (entryFee: number, players: number, contractpct: number) => {
  const fullPot = players * entryFee // 16 * 0.1 = 1.6
  const contractCut = fullPot * (contractpct / 100) // 1.6 * 0.51 = 0.816
  return fullPot - contractCut // 1.6 - 0.816 = 0.784
}
