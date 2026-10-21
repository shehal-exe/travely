export type Visibility = "public" | "private";

export type Profile = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
};

export type Destination = {
  id: string;
  name: string;
  slug: string;
  country: string;
  region: string | null;
  description: string;
  category_id: string | null;
  latitude: number | null;
  longitude: number | null;
  cover_image_url: string | null;
  best_time_to_visit: string | null;
  opening_hours: string | null;
  entry_fee: string | null;
  created_at: string;
  is_sample?: boolean;
  district?: string | null;
  source_name?: string | null;
  source_url?: string | null;
  verified_at?: string | null;
  highlights?: string[] | null;
  category?: Category | null;
  average_rating?: number;
  review_count?: number;
  history?: string | null;
  average_budget?: string | null;
  ideal_duration?: string | null;
  nearest_airport?: string | null;
  getting_around?: string | null;
  safety_note?: string | null;
  gallery_images?: string[] | null;
  video_url?: string | null;
  media_credit?: string | null;
  wikipedia_url?: string | null;
  wikidata_id?: string | null;
  data_rank?: number;
};

export type MemoryImage = {
  id: string;
  memory_id: string;
  image_url: string;
  storage_path: string;
  position: number;
  caption?: string | null;
};

export type TravelMemory = {
  id: string;
  user_id: string;
  destination_id: string | null;
  title: string;
  destination_name: string;
  location_visited: string;
  country: string;
  description: string;
  travel_tips: string | null;
  travel_date: string;
  rating: number;
  category: string | null;
  visibility: Visibility;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
  profile?: Profile | null;
  images?: MemoryImage[];
  likes_count?: number;
  total_expense?: number | null;
  days_spent?: number | null;
  trip_style?: string | null;
  author_note?: string | null;
};
