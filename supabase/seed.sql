-- Demonstration destinations only. No fictional traveler reviews are inserted.
insert into public.destination_categories (id, name, slug) values
  ('10000000-0000-0000-0000-000000000001', 'Beaches', 'beaches'),
  ('10000000-0000-0000-0000-000000000002', 'Mountains', 'mountains'),
  ('10000000-0000-0000-0000-000000000003', 'Hill Stations', 'hill-stations'),
  ('10000000-0000-0000-0000-000000000004', 'Nature', 'nature'),
  ('10000000-0000-0000-0000-000000000005', 'Cities', 'cities'),
  ('10000000-0000-0000-0000-000000000006', 'Historical Places', 'historical-places'),
  ('10000000-0000-0000-0000-000000000007', 'Spiritual', 'spiritual'),
  ('10000000-0000-0000-0000-000000000008', 'Wildlife', 'wildlife')
on conflict (slug) do nothing;

insert into public.destinations (id, name, slug, country, region, description, category_id, latitude, longitude, cover_image_url, is_sample) values
  ('20000000-0000-0000-0000-000000000001', 'Munnar', 'munnar', 'India', 'Kerala', 'A hill destination known for layered tea estates, forested valleys, and cool mountain air.', '10000000-0000-0000-0000-000000000003', 10.0889, 77.0595, 'https://images.unsplash.com/photo-1696027356970-b1527cc0d33c?auto=format&fit=crop&w=1600&q=85', true),
  ('20000000-0000-0000-0000-000000000002', 'Varkala', 'varkala', 'India', 'Kerala', 'A coastal town where dramatic cliffs meet the Arabian Sea, with beaches and coastal walking paths.', '10000000-0000-0000-0000-000000000001', 8.7379, 76.7163, 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1600&q=85', true),
  ('20000000-0000-0000-0000-000000000003', 'Alleppey', 'alleppey', 'India', 'Kerala', 'A waterside destination shaped by canals, lagoons, villages, and the Kerala backwaters.', '10000000-0000-0000-0000-000000000004', 9.4981, 76.3388, 'https://images.unsplash.com/photo-1528034342377-c406327f14b7?auto=format&fit=crop&w=1600&q=85', true),
  ('20000000-0000-0000-0000-000000000004', 'Goa', 'goa', 'India', 'Goa', 'A coastal state with beaches, historic neighborhoods, local cuisine, and a distinctive cultural landscape.', '10000000-0000-0000-0000-000000000001', 15.2993, 74.1240, 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1600&q=85', true),
  ('20000000-0000-0000-0000-000000000005', 'Manali', 'manali', 'India', 'Himachal Pradesh', 'A Himalayan town surrounded by high peaks, river valleys, pine forests, and mountain trails.', '10000000-0000-0000-0000-000000000002', 32.2432, 77.1892, 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1600&q=85', true),
  ('20000000-0000-0000-0000-000000000006', 'Jaipur', 'jaipur', 'India', 'Rajasthan', 'A historic city recognized for forts, palaces, craft traditions, and planned urban heritage.', '10000000-0000-0000-0000-000000000006', 26.9124, 75.7873, 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1600&q=85', true),
  ('20000000-0000-0000-0000-000000000007', 'Taj Mahal', 'taj-mahal', 'India', 'Uttar Pradesh', 'A white-marble Mughal mausoleum on the Yamuna river and one of India''s most recognisable architectural landmarks.', '10000000-0000-0000-0000-000000000006', 27.1751, 78.0421, 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1600&q=85', true),
  ('20000000-0000-0000-0000-000000000008', 'Varanasi', 'varanasi', 'India', 'Uttar Pradesh', 'An ancient city on the Ganga known for river ghats, living spiritual traditions, music, and craft heritage.', '10000000-0000-0000-0000-000000000007', 25.3176, 82.9739, 'https://images.unsplash.com/photo-1717070882156-108ae2c5c343?auto=format&fit=crop&w=1600&q=85', true),
  ('20000000-0000-0000-0000-000000000009', 'Leh–Ladakh', 'leh-ladakh', 'India', 'Ladakh', 'A high-altitude Himalayan region of dramatic valleys, monasteries, mountain passes, and clear desert light.', '10000000-0000-0000-0000-000000000002', 34.1526, 77.5771, 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1600&q=85', true),
  ('20000000-0000-0000-0000-000000000010', 'Kaziranga National Park', 'kaziranga-national-park', 'India', 'Assam', 'A UNESCO-listed landscape of grasslands, wetlands, and forests renowned for the greater one-horned rhinoceros.', '10000000-0000-0000-0000-000000000008', 26.5775, 93.1711, null, true),
  ('20000000-0000-0000-0000-000000000011', 'Hampi', 'hampi', 'India', 'Karnataka', 'The monumental ruins of the Vijayanagara capital sit among boulder hills, temple complexes, and the Tungabhadra river.', '10000000-0000-0000-0000-000000000006', 15.3350, 76.4600, null, true),
  ('20000000-0000-0000-0000-000000000012', 'Great Rann of Kutch', 'great-rann-of-kutch', 'India', 'Gujarat', 'A vast seasonal salt marsh whose white horizon, desert ecology, villages, and craft traditions define the Kutch landscape.', '10000000-0000-0000-0000-000000000004', 23.7337, 69.8597, null, true),
  ('20000000-0000-0000-0000-000000000013', 'Khajuraho', 'khajuraho', 'India', 'Madhya Pradesh', 'A celebrated group of medieval temples known for finely carved Nagara-style architecture and sculptural detail.', '10000000-0000-0000-0000-000000000006', 24.8318, 79.9199, null, true),
  ('20000000-0000-0000-0000-000000000014', 'Konark Sun Temple', 'konark-sun-temple', 'India', 'Odisha', 'A monumental thirteenth-century temple conceived as Surya''s stone chariot near Odisha''s coast.', '10000000-0000-0000-0000-000000000006', 19.8876, 86.0945, null, true),
  ('20000000-0000-0000-0000-000000000015', 'Darjeeling', 'darjeeling', 'India', 'West Bengal', 'A Himalayan hill town known for tea gardens, mountain rail heritage, and views toward the eastern Himalaya.', '10000000-0000-0000-0000-000000000003', 27.0410, 88.2663, null, true),
  ('20000000-0000-0000-0000-000000000016', 'Gangtok', 'gangtok', 'India', 'Sikkim', 'Sikkim''s mountain capital is a gateway to monasteries, high-altitude lakes, forested ridges, and Himalayan routes.', '10000000-0000-0000-0000-000000000002', 27.3314, 88.6138, null, true),
  ('20000000-0000-0000-0000-000000000017', 'Puducherry', 'puducherry', 'India', 'Puducherry', 'A Bay of Bengal city of Tamil neighbourhoods, coastal promenades, tree-lined heritage streets, and distinctive food culture.', '10000000-0000-0000-0000-000000000005', 11.9416, 79.8083, null, true),
  ('20000000-0000-0000-0000-000000000018', 'Swaraj Dweep', 'swaraj-dweep', 'India', 'Andaman and Nicobar Islands', 'A tropical island destination with coral reefs, rainforest edges, clear-water beaches, and marine experiences.', '10000000-0000-0000-0000-000000000001', 11.9761, 92.9876, null, true),
  ('20000000-0000-0000-0000-000000000019', 'Shillong', 'shillong', 'India', 'Meghalaya', 'A highland city and gateway to Khasi hills, waterfalls, living-root landscapes, music, and Meghalaya''s monsoon country.', '10000000-0000-0000-0000-000000000003', 25.5788, 91.8933, null, true),
  ('20000000-0000-0000-0000-000000000020', 'Kanyakumari', 'kanyakumari', 'India', 'Tamil Nadu', 'India''s southern coastal tip, where sea horizons, pilgrimage sites, memorials, and Tamil landscapes meet.', '10000000-0000-0000-0000-000000000007', 8.0883, 77.5385, null, true)
on conflict (slug) do nothing;

-- Opening hours, entry fees, and seasonal guidance remain NULL until an administrator verifies them.

-- Attach provenance to seeded coordinates. Descriptions remain TRAVELY editorial summaries.
update public.destinations
set source_name = 'OpenStreetMap contributors',
    source_url = 'https://www.openstreetmap.org/?mlat=' || latitude || '&mlon=' || longitude || '#map=12/' || latitude || '/' || longitude,
    verified_at = date '2026-10-20'
where is_sample = true and latitude is not null and longitude is not null;
