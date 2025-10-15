import { Calendar, MapPin, Clock, Users, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";

const exhibitions = [
  {
    id: 1,
    title: "Международная выставка технологий и инноваций",
    date: "15-17",
    month: "ноября",
    year: "2025",
    location: "EXPO Астана",
    time: "10:00 - 18:00",
    description: "Крупнейшее событие года в сфере технологий. Более 200 экспонентов из 30 стран представят свои инновационные решения.",
    attendees: "5000+",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
    status: "upcoming"
  },
  {
    id: 2,
    title: "Startup Expo 2025",
    date: "5-6",
    month: "декабря",
    year: "2025",
    location: "Almaty Towers",
    time: "09:00 - 19:00",
    description: "Платформа для встреч стартапов и инвесторов. Питчинг-сессии, нетворкинг и мастер-классы от успешных предпринимателей.",
    attendees: "2000+",
    image: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800",
    status: "upcoming"
  },
  {
    id: 3,
    title: "AI & Machine Learning Summit",
    date: "20-21",
    month: "января",
    year: "2026",
    location: "IT Park, Астана",
    time: "10:00 - 17:00",
    description: "Конференция посвященная искусственному интеллекту и машинному обучению. Доклады экспертов, воркшопы и демонстрация кейсов.",
    attendees: "1500+",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800",
    status: "upcoming"
  },
  {
    id: 4,
    title: "Digital Transformation Forum",
    date: "10-12",
    month: "февраля",
    year: "2026",
    location: "Rixos Almaty",
    time: "09:00 - 18:00",
    description: "Форум о цифровой трансформации бизнеса. Обсуждение трендов, технологий и стратегий развития компаний.",
    attendees: "3000+",
    image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800",
    status: "completed"
  },
];

const upcomingEvents = [
  {
    id: 1,
    title: "Tech Meetup: Облачные технологии",
    date: "25 октября 2025",
    time: "18:00",
    location: "Online",
  },
  {
    id: 2,
    title: "Workshop: React и Next.js",
    date: "30 октября 2025",
    time: "19:00",
    location: "DevSpace Almaty",
  },
  {
    id: 3,
    title: "Networking: IT Community",
    date: "5 ноября 2025",
    time: "18:30",
    location: "CoWork Astana",
  },
];

export function ExhibitionsPage() {
  return (
    <div className="space-y-3 sm:space-y-6 lg:pt-6 pt-1">
      <div>
        <h1 className="mb-2">Выставки и события</h1>
        <p className="text-muted-foreground">
          Актуальная информация о предстоящих технологических выставках, конференциях и событиях
        </p>
      </div>

      {/* Main Exhibitions */}
      <div className="space-y-5">
        {exhibitions.map((exhibition) => (
          <div
            key={exhibition.id}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="grid grid-cols-4 gap-4 mb-5">
                {/* Left: Big Date - 1/4 */}
                <div className="col-span-1 flex flex-col items-start justify-center">
                  <div className="text-6xl text-blue-600 leading-none mb-1">{exhibition.date}</div>
                  <div className="text-sm uppercase tracking-wide text-gray-600">{exhibition.month}</div>
                  <div className="text-xs text-gray-500 mt-1">{exhibition.year}</div>
                </div>

                {/* Right: Photo - 3/4 */}
                {exhibition.image && (
                  <div className="col-span-3 h-32 overflow-hidden rounded-xl">
                    <img
                      src={exhibition.image}
                      alt={exhibition.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Bottom: Event Info */}
              <div className="mt-5">
                <div className="flex items-start justify-between mb-3">
                  <h2 className="flex-1">{exhibition.title}</h2>
                  <span className={`ml-4 px-3 py-1 rounded-full text-xs whitespace-nowrap ${
                    exhibition.status === 'upcoming' 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {exhibition.status === 'upcoming' ? 'Предстоящее' : 'Завершенное'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>{exhibition.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>{exhibition.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4 text-primary" />
                    <span>{exhibition.attendees} участников</span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4">{exhibition.description}</p>

                <Button className="gap-2">
                  Зарегистрироваться
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
