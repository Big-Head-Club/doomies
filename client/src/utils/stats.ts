export type RawStats = [number, number, number, number, number, number, number]

export type StatsRecord = {
  sadistic: number;
  ruthless: number;
  devious: number;
  conniving: number;
  brutish: number;
  resourceful: number;
  sneaky: number;
}

export type AvailableStats = keyof StatsRecord

export const parseRawStats = (stats: RawStats): StatsRecord =>
  ({
    sadistic: stats[0],
    ruthless: stats[1],
    devious: stats[2],
    conniving: stats[3],
    brutish: stats[4],
    resourceful: stats[5],
    sneaky: stats[6],
  })
