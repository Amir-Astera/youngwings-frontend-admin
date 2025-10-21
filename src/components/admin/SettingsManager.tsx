const STATIC_REGIONS = [
  "Республика Татарстан",
  "Москва",
  "Санкт-Петербург",
  "Новосибирская область",
  "Краснодарский край",
];

const STATIC_SPHERES = [
  "Экология",
  "Образование",
  "Предпринимательство",
  "Технологии",
  "Социальные проекты",
];

const STATIC_TOPICS = [
  "Экологические инициативы",
  "Развитие молодежи",
  "Городские проекты",
  "Инновации и технологии",
  "Волонтерство",
];

export function SettingsManager() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl">Настройки</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="mb-4">Регионы</h3>
          <div className="space-y-2">
            {STATIC_REGIONS.map((region) => (
              <div
                key={region}
                className="p-3 border border-gray-200 rounded-lg text-sm bg-gray-50"
              >
                {region}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="mb-4">Сферы</h3>
          <div className="space-y-2">
            {STATIC_SPHERES.map((sphere) => (
              <div
                key={sphere}
                className="p-3 border border-gray-200 rounded-lg text-sm bg-gray-50"
              >
                {sphere}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="mb-4">Популярные темы</h3>
          <div className="space-y-2">
            {STATIC_TOPICS.map((topic) => (
              <div
                key={topic}
                className="p-3 border border-gray-200 rounded-lg text-sm bg-gray-50"
              >
                {topic}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <h3 className="mb-2">Информация</h3>
        <p className="text-sm text-gray-600">
          Значения разделов настроек сейчас заданы статически и служат для демонстрации. Когда появится поддержка на стороне
          сервера, здесь можно будет управлять списками через API.
        </p>
      </div>
    </div>
  );
}
