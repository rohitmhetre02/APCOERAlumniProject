import { useState } from "react";
import Card from "../components/ui/Card";

const Gallery = () => {
  const [selectedIndex, setSelectedIndex] = useState(null);

  const gallery = [
    { id: 1, title: 'Alumni Meet 2024', image: 'https://picsum.photos/seed/alumni-meet-2024/400/300.jpg', category: 'Events', date: '2024-01-15' },
    { id: 2, title: 'Workshop Session', image: 'https://picsum.photos/seed/workshop-session/400/300.jpg', category: 'Workshops', date: '2024-01-10' },
    { id: 3, title: 'Cultural Evening', image: 'https://picsum.photos/seed/cultural-evening/400/300.jpg', category: 'Cultural', date: '2024-01-08' },
    { id: 4, title: 'Sports Day', image: 'https://picsum.photos/seed/sports-day/400/300.jpg', category: 'Sports', date: '2024-01-05' },
    { id: 5, title: 'Guest Lecture', image: 'https://picsum.photos/seed/guest-lecture/400/300.jpg', category: 'Academic', date: '2024-01-03' },
    { id: 6, title: 'Networking Event', image: 'https://picsum.photos/seed/networking-event/400/300.jpg', category: 'Networking', date: '2023-12-28' },
    { id: 7, title: 'Award Ceremony', image: 'https://picsum.photos/seed/award-ceremony/400/300.jpg', category: 'Achievements', date: '2023-12-25' },
    { id: 8, title: 'Campus Tour', image: 'https://picsum.photos/seed/campus-tour/400/300.jpg', category: 'Campus', date: '2023-12-20' },
    { id: 9, title: 'Tech Conference', image: 'https://picsum.photos/seed/tech-conference/400/300.jpg', category: 'Events', date: '2023-12-18' },
    { id: 10, title: 'Alumni Dinner', image: 'https://picsum.photos/seed/alumni-dinner/400/300.jpg', category: 'Social', date: '2023-12-15' },
    { id: 11, title: 'Innovation Fair', image: 'https://picsum.photos/seed/innovation-fair/400/300.jpg', category: 'Academic', date: '2023-12-12' },
    { id: 12, title: 'Farewell Party', image: 'https://picsum.photos/seed/farewell-party/400/300.jpg', category: 'Cultural', date: '2023-12-10' }
  ];

  const getCategoryColor = (category) => {
    const colors = {
      Events: "bg-blue-100 text-blue-800",
      Workshops: "bg-indigo-100 text-indigo-800",
      Cultural: "bg-pink-100 text-pink-800",
      Sports: "bg-red-100 text-red-800",
      Academic: "bg-yellow-100 text-yellow-800",
      Networking: "bg-purple-100 text-purple-800",
      Achievements: "bg-green-100 text-green-800",
      Campus: "bg-gray-100 text-gray-800",
      Social: "bg-orange-100 text-orange-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="text-center pt-10 space-y-2">
        <h1 className="text-3xl font-bold text-gray-800">
          Photo Gallery
        </h1>
        <p className="text-gray-500">
          Memories from our events and activities
        </p>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {gallery.map((item, index) => (
          <Card
            key={item.id}
            className="hover:shadow-lg transition hover:scale-105 overflow-hidden cursor-pointer"
            onClick={() => setSelectedIndex(index)}
          >
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-52 object-cover"
            />

            {/* OPTIONAL: hide text (as per your requirement) */}
            {/* If you want remove below completely */}
            <div className="p-3">
              <h4 className="text-sm font-medium text-gray-800">
                {item.title}
              </h4>
            </div>
          </Card>
        ))}
      </div>

      {/* MODAL VIEWER */}
      {selectedIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">

          {/* Close */}
          <button
            onClick={() => setSelectedIndex(null)}
            className="absolute top-5 right-5 text-white text-3xl"
          >
            ✕
          </button>

          {/* Left Arrow */}
          <button
            onClick={() =>
              setSelectedIndex(
                selectedIndex === 0 ? gallery.length - 1 : selectedIndex - 1
              )
            }
            className="absolute left-5 text-white text-4xl"
          >
            ←
          </button>

          {/* Image */}
          <img
            src={gallery[selectedIndex].image}
            className="max-h-[80vh] max-w-[90%] rounded-lg"
          />

          {/* Right Arrow */}
          <button
            onClick={() =>
              setSelectedIndex(
                selectedIndex === gallery.length - 1 ? 0 : selectedIndex + 1
              )
            }
            className="absolute right-5 text-white text-4xl"
          >
            →
          </button>

        </div>
      )}

      {/* LOAD MORE */}
      <div className="text-center">
        <button className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
          Load More Photos
        </button>
      </div>

    </div>
  );
};

export default Gallery;