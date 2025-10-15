import { Languages, Star, MapPin, Clock, Mail, Phone } from "lucide-react";
import { Button } from "./ui/button";

const translators = [
  {
    id: 1,
    name: "Айгуль Нурланова",
    languages: ["Русский", "Английский", "Казахский"],
    specialization: "Технические переводы, IT-документация",
    rating: 4.9,
    reviews: 156,
    hourlyRate: "5000 ₸/час",
    location: "Алматы",
    experience: "8 лет",
    available: true,
  },
  {
    id: 2,
    name: "Дмитрий Ким",
    languages: ["Английский", "Корейский", "Русский"],
    specialization: "Деловые переводы, контракты",
    rating: 4.8,
    reviews: 203,
    hourlyRate: "6000 ₸/час",
    location: "Астана",
    experience: "10 лет",
    available: true,
  },
  {
    id: 3,
    name: "Лейла Сабитова",
    languages: ["Французский", "Русский", "Английский"],
    specialization: "Юридические переводы",
    rating: 5.0,
    reviews: 98,
    hourlyRate: "7000 ₸/час",
    location: "Алматы",
    experience: "6 лет",
    available: false,
  },
  {
    id: 4,
    name: "Марат Токтаров",
    languages: ["Немецкий", "Русский", "Казахский"],
    specialization: "Технические переводы, маркетинг",
    rating: 4.7,
    reviews: 134,
    hourlyRate: "5500 ₸/час",
    location: "Шымкент",
    experience: "7 лет",
    available: true,
  },
];

const services = [
  {
    id: 1,
    title: "Письменный перевод",
    description: "Перевод документов, статей, контрактов и другой письменной документации",
    price: "От 1000 ₸ за страницу",
  },
  {
    id: 2,
    title: "Устный перевод",
    description: "Синхронный и последовательный перевод на мероприятиях и встречах",
    price: "От 10000 ₸ за час",
  },
  {
    id: 3,
    title: "Локализация",
    description: "Адаптация контента под местную аудиторию, включая веб-сайты и приложения",
    price: "От 2000 ₸ за час",
  },
  {
    id: 4,
    title: "Редактура и корректура",
    description: "Проверка и улучшение качества переведенных текстов",
    price: "От 800 ₸ за страницу",
  },
];

export function TranslatorsPage() {
  return (
    <div className="space-y-3 sm:space-y-6 lg:pt-6 pt-1">
      <div>
        <h1 className="mb-2">Переводчики и услуги</h1>
        <p className="text-muted-foreground">
          Профессиональные переводчики и языковые услуги для вашего бизнеса
        </p>
      </div>

      {/* Translators List */}
      <div className="space-y-5">
        <h2>Наши переводчики</h2>
        {translators.map((translator) => (
          <div
            key={translator.id}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex gap-6">
                {/* Photo - Left Side */}
                <div className="w-32 h-32 flex-shrink-0 overflow-hidden rounded-xl">
                  <img
                    src={`https://images.unsplash.com/photo-${1438761681033 + translator.id * 1000}-5ccbaa6147b?w=200`}
                    alt={translator.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Content - Right Side */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="mb-2">{translator.name}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{translator.rating}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          ({translator.reviews} отзывов)
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="mb-2">{translator.hourlyRate}</p>
                      {translator.available ? (
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs">
                          Доступен
                        </span>
                      ) : (
                        <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                          Занят
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{translator.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>Опыт: {translator.experience}</span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Languages className="w-4 h-4 text-primary" />
                      <span className="text-sm">Языки:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {translator.languages.map((lang, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">
                    <span className="text-gray-900">Специализация:</span> {translator.specialization}
                  </p>

                  <div className="flex gap-3">
                    <Button size="sm" className="gap-2">
                      <Mail className="w-4 h-4" />
                      Написать
                    </Button>
                    <Button size="sm" variant="outline" className="gap-2">
                      <Phone className="w-4 h-4" />
                      Позвонить
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Contact Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="mb-3">Нужна помощь с подбором переводчика?</h3>
        <p className="text-sm text-gray-600 mb-4">
          Свяжитесь с нами, и мы поможем найти подходящего специалиста для вашего проекта
        </p>
        <Button className="gap-2">
          <Mail className="w-4 h-4" />
          Связаться с нами
        </Button>
      </div>
    </div>
  );
}
