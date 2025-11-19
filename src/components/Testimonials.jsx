// Testimonials.js
export default function Testimonials() {
  const guests = [
    {
      name: "Emma Rodriguez",
      review:
        "“I’ve used many booking platforms before, but none compare to the personalized experience and attention to detail that QuickStay provides. Their curated selection of hotels is unmatched.”",
      rating: 5,
      img: "https://randomuser.me/api/portraits/women/44.jpg", // Replace with actual images
    },
    {
      name: "Liam Johnson",
      review:
        "“I’ve used many booking platforms before, but none compare to the personalized experience and attention to detail that QuickStay provides. Their curated selection of hotels is unmatched.”",
      rating: 5,
      img: "https://randomuser.me/api/portraits/men/35.jpg",
    },
    {
      name: "Sophia Lee",
      review:
        "“I’ve used many booking platforms before, but none compare to the personalized experience and attention to detail that QuickStay provides. Their curated selection of hotels is unmatched.”",
      rating: 5,
      img: "https://randomuser.me/api/portraits/women/68.jpg",
    },
  ];

  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-semibold mb-2">What Our Guests Say</h2>
        <p className="text-gray-500">
          Discover why discerning travelers consistently choose us for their
          exclusive and luxurious accommodations around the world.
        </p>
      </div>
      <div className="flex justify-between">
        {guests.map((guest, idx) => (
          <div key={idx} className="bg-white shadow rounded-lg p-6 w-[30%]">
            <div className="flex items-center mb-2">
              <img
                src={guest.img}
                alt={guest.name}
                className="w-10 h-10 rounded-full mr-3"
              />
              <span className="font-semibold">{guest.name}</span>
            </div>
            <div className="flex mb-2">
              {[...Array(guest.rating)].map((_, i) => (
                <svg
                  key={i}
                  className="w-5 h-5 text-orange-500 fill-current"
                  viewBox="0 0 20 20"
                >
                  <polygon points="9.9,1.1 7.5,6.9 1.2,7.6 6.1,12.1 4.8,18.1 9.9,15 15,18.1 13.8,12.1 18.7,7.6 12.4,6.9" />
                </svg>
              ))}
            </div>
            <p className="text-gray-600 text-sm">{guest.review}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
