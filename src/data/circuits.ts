export type CircuitStop = {
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  stay: string;
  note: string;
};

export type TravelCircuit = {
  slug: string;
  title: string;
  region: string;
  category: string;
  duration: string;
  distance: string;
  budget: string;
  bestTime: string;
  transport: string;
  summary: string;
  image: string;
  slides: string[];
  sourceName: string;
  sourceUrl: string;
  stops: CircuitStop[];
};

export const travelCircuits: TravelCircuit[] = [
  {
    slug: "golden-triangle",
    title: "The Golden Triangle",
    region: "Delhi · Uttar Pradesh · Rajasthan",
    category: "Culture & heritage",
    duration: "6–7 days",
    distance: "Approx. 720 km loop",
    budget: "₹32,000–₹65,000 per person",
    bestTime: "October to March",
    transport: "Intercity train or private car; metro and local taxi within cities",
    summary: "India’s classic first circuit links Delhi’s layered capitals, Agra’s Mughal monuments, and Jaipur’s forts and planned old city.",
    image: "/images/travel/commons/destination/delhi.jpg",
    slides: ["/images/travel/commons/destination/taj-mahal.jpg", "/images/travel/commons/destination/jaipur.jpg", "/images/travel/commons/gallery/taj-mahal-2.jpg"],
    sourceName: "Incredible India — Traversing the Golden Triangle",
    sourceUrl: "https://www.prod.incredibleindia.gov.in/content/incredible-india-v2/en/itineraries/pan-india/traversing-the-golden-triangle.html",
    stops: [
      { name: "Delhi", slug: "delhi", latitude: 28.6139, longitude: 77.209, stay: "2 nights", note: "Old Delhi, Humayun’s Tomb, museums, and the ceremonial capital." },
      { name: "Taj Mahal · Agra", slug: "taj-mahal", latitude: 27.1751, longitude: 78.0421, stay: "1 night", note: "Taj Mahal at first light, Agra Fort, and the Yamuna riverfront." },
      { name: "Jaipur", slug: "jaipur", latitude: 26.9124, longitude: 75.7873, stay: "2–3 nights", note: "Amber Fort, City Palace, Jantar Mantar, bazaars, and craft workshops." },
    ],
  },
  {
    slug: "kerala-seven-day",
    title: "Kerala: hills, backwaters & coast",
    region: "Kerala",
    category: "Nature & slow travel",
    duration: "7 days",
    distance: "Official route: 167 km core; transfers vary",
    budget: "₹38,000–₹78,000 per person",
    bestTime: "October to March",
    transport: "Rail and bus between major towns; taxi for hill and backwater transfers",
    summary: "A south-to-central Kerala journey connecting city culture, Varkala’s cliffs, Alappuzha’s waterways, Kochi’s heritage, and Munnar’s tea country.",
    image: "/images/travel/commons/destination/varkala.jpg",
    slides: ["/images/travel/commons/destination/alappuzha.jpg", "/images/travel/commons/destination/kochi.jpg", "/images/travel/commons/destination/munnar.jpg"],
    sourceName: "Incredible India — 7 days in God’s own country",
    sourceUrl: "https://www.incredibleindia.gov.in/en/trips/trip-listing/7-days-in-gods-own-country-kerala-adventure",
    stops: [
      { name: "Varkala", slug: "varkala", latitude: 8.7379, longitude: 76.7163, stay: "1 night", note: "Cliff walks, beach time, and the Janardanaswamy Temple area." },
      { name: "Alappuzha", slug: "alappuzha", latitude: 9.4981, longitude: 76.3388, stay: "1 night", note: "Backwater cruise, Kuttanad landscapes, and waterside villages." },
      { name: "Kochi", slug: "kochi", latitude: 9.9312, longitude: 76.2673, stay: "2 nights", note: "Fort Kochi, Mattancherry, ferries, arts, and coastal cuisine." },
      { name: "Munnar", slug: "munnar", latitude: 10.0889, longitude: 77.0595, stay: "2 nights", note: "Tea landscapes, Eravikulam region, and early-morning viewpoints." },
    ],
  },
  {
    slug: "northeast-green-triangle",
    title: "The Northeast Green Triangle",
    region: "Assam · Meghalaya",
    category: "Waterfalls & highlands",
    duration: "5–6 days",
    distance: "Official route: 280 km",
    budget: "₹36,000–₹72,000 per person",
    bestTime: "October to May; monsoon for peak waterfalls",
    transport: "Fly or rail to Guwahati, then registered taxi for the hill circuit",
    summary: "A compact northeast circuit from Guwahati to Shillong and Sohra, combining Khasi culture, immense waterfalls, lake country, and forest walks.",
    image: "/images/travel/commons/destination/shillong.jpg",
    slides: ["/images/travel/commons/destination/guwahati.jpg", "/images/travel/commons/destination/cherrapunji.jpg", "/images/travel/commons/gallery/cherrapunji-2.jpg"],
    sourceName: "Incredible India — The Northeast Green Triangle",
    sourceUrl: "https://www.incredibleindia.gov.in/en/trips/trip-listing/the-northeast-green-triangle",
    stops: [
      { name: "Guwahati", slug: "guwahati", latitude: 26.1445, longitude: 91.7362, stay: "1 night", note: "Arrival hub, Brahmaputra riverfront, and Kamakhya Temple." },
      { name: "Shillong", slug: "shillong", latitude: 25.5788, longitude: 91.8933, stay: "2 nights", note: "Umiam Lake, markets, music culture, and Khasi heritage." },
      { name: "Cherrapunji · Sohra", slug: "cherrapunji", latitude: 25.2702, longitude: 91.7323, stay: "2 nights", note: "Waterfalls, limestone caves, viewpoints, and living-root landscapes." },
    ],
  },
  {
    slug: "sikkim-darjeeling",
    title: "Sikkim & Darjeeling highlands",
    region: "Sikkim · West Bengal",
    category: "Himalayan culture",
    duration: "6–7 days",
    distance: "Official route: 731 km",
    budget: "₹42,000–₹85,000 per person",
    bestTime: "March to May; October to December",
    transport: "Fly or rail to Bagdogra/NJP, then registered shared or private hill taxis",
    summary: "A panoramic eastern Himalayan journey through Gangtok, Pelling, and Darjeeling, mixing monasteries, tea country, markets, and mountain rail heritage.",
    image: "/images/travel/commons/destination/gangtok.jpg",
    slides: ["/images/travel/commons/destination/pelling.jpg", "/images/travel/commons/gallery/gangtok-2.jpg", "/images/travel/commons/destination/darjeeling.jpg"],
    sourceName: "Incredible India — Amazing Northeast",
    sourceUrl: "https://www.incredibleindia.gov.in/en/trips/trip-listing/amazing-northeast",
    stops: [
      { name: "Gangtok", slug: "gangtok", latitude: 27.3314, longitude: 88.6138, stay: "2 nights", note: "Monasteries, viewpoints, MG Marg, and optional high-altitude excursions." },
      { name: "Pelling", slug: "pelling", latitude: 27.3005, longitude: 88.2343, stay: "2 nights", note: "Monastery landscapes, forest walks, and views toward Kangchenjunga." },
      { name: "Darjeeling", slug: "darjeeling", latitude: 27.041, longitude: 88.2663, stay: "2 nights", note: "Tea estates, Himalayan Railway heritage, markets, and ridge walks." },
    ],
  },
];

export function getCircuit(slug: string) {
  return travelCircuits.find((circuit) => circuit.slug === slug) ?? null;
}
