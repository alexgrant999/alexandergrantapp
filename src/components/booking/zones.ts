// One entry per clock, named for a city people look for. Cities share an entry only when their clocks change on the same days.
export const ZONE_REGIONS: { label: string; places: { zone: string; label: string }[] }[] = [
  {
    label: 'North America',
    places: [
      { zone: 'Pacific/Honolulu', label: 'Honolulu' },
      { zone: 'America/Anchorage', label: 'Anchorage' },
      { zone: 'America/Los_Angeles', label: 'Los Angeles / Vancouver' },
      { zone: 'America/Phoenix', label: 'Phoenix' },
      { zone: 'America/Denver', label: 'Denver / Calgary' },
      { zone: 'America/Chicago', label: 'Chicago / Dallas' },
      { zone: 'America/Mexico_City', label: 'Mexico City' },
      { zone: 'America/New_York', label: 'New York / Toronto' },
      { zone: 'America/Puerto_Rico', label: 'Puerto Rico' },
      { zone: 'America/Halifax', label: 'Halifax' },
      { zone: 'America/St_Johns', label: 'St John’s' },
    ],
  },
  {
    label: 'Central and South America',
    places: [
      { zone: 'America/Costa_Rica', label: 'Costa Rica / Guatemala' },
      { zone: 'America/Bogota', label: 'Bogota / Lima' },
      { zone: 'America/Santiago', label: 'Santiago' },
      { zone: 'America/Sao_Paulo', label: 'Sao Paulo / Buenos Aires' },
    ],
  },
  {
    label: 'Europe and Africa',
    places: [
      { zone: 'Europe/London', label: 'London / Dublin' },
      { zone: 'Europe/Paris', label: 'Paris / Berlin / Madrid' },
      { zone: 'Africa/Lagos', label: 'Lagos' },
      { zone: 'Europe/Athens', label: 'Athens / Helsinki' },
      { zone: 'Africa/Johannesburg', label: 'Johannesburg' },
      { zone: 'Africa/Nairobi', label: 'Nairobi' },
      { zone: 'Europe/Istanbul', label: 'Istanbul / Moscow' },
    ],
  },
  {
    label: 'Asia',
    places: [
      { zone: 'Asia/Dubai', label: 'Dubai' },
      { zone: 'Asia/Kolkata', label: 'Mumbai / Delhi' },
      { zone: 'Asia/Bangkok', label: 'Bangkok / Jakarta' },
      { zone: 'Asia/Makassar', label: 'Bali' },
      { zone: 'Asia/Singapore', label: 'Singapore / Hong Kong' },
      { zone: 'Asia/Tokyo', label: 'Tokyo / Seoul' },
    ],
  },
  {
    label: 'Australia and New Zealand',
    places: [
      { zone: 'Australia/Perth', label: 'Perth' },
      { zone: 'Australia/Darwin', label: 'Darwin' },
      { zone: 'Australia/Adelaide', label: 'Adelaide' },
      { zone: 'Australia/Brisbane', label: 'Brisbane' },
      { zone: 'Australia/Sydney', label: 'Sydney / Melbourne' },
      { zone: 'Pacific/Auckland', label: 'Auckland / Wellington' },
    ],
  },
]

// Alex's clients are mostly in the United States and Australia.
export const COMMON_ZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Australia/Sydney',
  'Australia/Brisbane',
  'Australia/Perth',
  'Europe/London',
]

const LABELS = new Map(ZONE_REGIONS.flatMap(r => r.places.map(p => [p.zone, p.label])))

export function placeLabel(zone: string): string {
  return LABELS.get(zone) ?? (zone.split('/').pop() ?? zone).replaceAll('_', ' ')
}

// The meetup group is in Sydney and Brisbane. Brisbane keeps no daylight saving, so in summer the two are an hour apart.
// Every group poll time is shown in both, whatever zone the visitor is in.
export const MEETUP_ZONES = ['Australia/Sydney', 'Australia/Brisbane']
