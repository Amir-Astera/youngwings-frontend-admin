import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { settingsApi } from "../../lib/api";
import type { RegionCityMap } from "../../lib/api";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

const STATIC_TOPICS = [
  "Устойчивое развитие в Центральной Азии",
  "Зеленые технологии",
  "Экологические стартапы",
  "Городская мобильность",
  "Социальные инициативы",
];

export function SettingsManager() {
  const [regionsMap, setRegionsMap] = useState<RegionCityMap>({});
  const [spheres, setSpheres] = useState<string[]>([]);
  const [topics] = useState<string[]>(STATIC_TOPICS);
  const [newRegion, setNewRegion] = useState("");
  const [newSphere, setNewSphere] = useState("");
  const [cityInputs, setCityInputs] = useState<Record<string, string>>({});

  const regions = useMemo(
    () => Object.keys(regionsMap).sort((a, b) => a.localeCompare(b, "ru")),
    [regionsMap]
  );

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [regionsData, spheresData] = await Promise.all([
          settingsApi.getRegionsWithCities(),
          settingsApi.getSpheres(),
        ]);
        setRegionsMap(regionsData);
        setSpheres(spheresData);
      } catch (error) {
        toast.error("Не удалось загрузить настройки");
      }
    };

    loadSettings();
  }, []);

  useEffect(() => {
    setCityInputs((prev) => {
      const next: Record<string, string> = {};
      regions.forEach((region) => {
        next[region] = prev[region] ?? "";
      });
      return next;
    });
  }, [regions]);

  const handleAddRegion = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = newRegion.trim();
    if (!trimmed) {
      return;
    }

    const exists = regions.some((region) => region.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      toast.error("Такой регион уже добавлен");
      return;
    }

    try {
      const updated = await settingsApi.addRegion(trimmed);
      setRegionsMap(updated);
      setNewRegion("");
      toast.success("Регион добавлен");
    } catch (error) {
      toast.error("Не удалось добавить регион");
    }
  };

  const handleAddSphere = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = newSphere.trim();
    if (!trimmed) {
      return;
    }

    try {
      const updated = await settingsApi.addSphere(trimmed);
      setSpheres(updated);
      setNewSphere("");
      toast.success("Сфера добавлена");
    } catch (error) {
      toast.error("Не удалось добавить сферу");
    }
  };

  const handleRemoveRegion = async (region: string) => {
    try {
      const updated = await settingsApi.deleteRegion(region);
      setRegionsMap(updated);
      toast.success("Регион удален");
    } catch (error) {
      toast.error("Не удалось удалить регион");
    }
  };

  const handleAddCity = async (event: React.FormEvent, region: string) => {
    event.preventDefault();
    const inputValue = cityInputs[region] ?? "";
    const trimmedCity = inputValue.trim();

    if (!trimmedCity) {
      return;
    }

    const existingCities = regionsMap[region] ?? [];
    const hasCity = existingCities.some((city) => city.toLowerCase() === trimmedCity.toLowerCase());

    if (hasCity) {
      toast.error("Такой город уже добавлен");
      return;
    }

    try {
      const updated = await settingsApi.addCity(region, trimmedCity);
      setRegionsMap(updated);
      setCityInputs((prev) => ({ ...prev, [region]: "" }));
      toast.success("Город добавлен");
    } catch (error) {
      toast.error("Не удалось добавить город");
    }
  };

  const handleRemoveCity = async (region: string, city: string) => {
    try {
      const updated = await settingsApi.deleteCity(region, city);
      setRegionsMap(updated);
      toast.success("Город удален");
    } catch (error) {
      toast.error("Не удалось удалить город");
    }
  };

  const handleRemoveSphere = async (sphere: string) => {
    try {
      const updated = await settingsApi.deleteSphere(sphere);
      setSpheres(updated);
      toast.success("Сфера удалена");
    } catch (error) {
      toast.error("Не удалось удалить сферу");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl">Настройки</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-5">
          <div>
            <h3 className="mb-2">Регионы и города</h3>
            <p className="text-sm text-gray-500">
              Настройте регионы стран СНГ и города, доступные при создании событий.
            </p>
          </div>
          <form onSubmit={handleAddRegion} className="space-y-2">
            <Input
              value={newRegion}
              onChange={(event) => setNewRegion(event.target.value)}
              placeholder="Добавьте регион"
            />
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
              Добавить регион
            </Button>
          </form>
          <div className="space-y-3">
            {regions.map((region) => {
              const cities = regionsMap[region] ?? [];

              return (
                <div
                  key={region}
                  className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{region}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveRegion(region)}
                    >
                      Удалить регион
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {cities.map((city) => (
                      <div
                        key={city}
                        className="flex items-center justify-between gap-2 rounded-md border border-gray-200 bg-white p-2 text-sm"
                      >
                        <span>{city}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveCity(region, city)}
                        >
                          Удалить
                        </Button>
                      </div>
                    ))}
                    {cities.length === 0 && (
                      <div className="rounded-md border border-dashed border-gray-200 bg-white p-3 text-sm text-gray-500">
                        Добавьте первый город
                      </div>
                    )}
                    <form
                      onSubmit={(event) => handleAddCity(event, region)}
                      className="flex flex-col sm:flex-row gap-2"
                    >
                      <Input
                        value={cityInputs[region] ?? ""}
                        onChange={(event) =>
                          setCityInputs((prev) => ({ ...prev, [region]: event.target.value }))
                        }
                        placeholder="Добавьте город"
                      />
                      <Button type="submit" className="bg-blue-600 hover:bg-blue-700 sm:w-auto">
                        Добавить город
                      </Button>
                    </form>
                  </div>
                </div>
              );
            })}
            {regions.length === 0 && (
              <div className="rounded-lg border border-dashed border-gray-200 p-3 text-sm text-gray-500">
                Добавьте первый регион
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
          <div>
            <h3 className="mb-4">Сферы развития</h3>
            <div className="space-y-2">
              {spheres.map((sphere) => (
                <div
                  key={sphere}
                  className="flex items-center justify-between gap-2 p-3 border border-gray-200 rounded-lg text-sm bg-gray-50"
                >
                  <span>{sphere}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveSphere(sphere)}
                  >
                    Удалить
                  </Button>
                </div>
              ))}
              {spheres.length === 0 && (
                <div className="p-3 border border-dashed border-gray-200 rounded-lg text-sm text-gray-500">
                  Добавьте первую сферу
                </div>
              )}
            </div>
          </div>
          <form onSubmit={handleAddSphere} className="space-y-2">
            <Input
              value={newSphere}
              onChange={(event) => setNewSphere(event.target.value)}
              placeholder="Добавьте сферу"
            />
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
              Добавить сферу
            </Button>
          </form>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="mb-4">Популярные темы</h3>
          <div className="space-y-2">
            {topics.map((topic) => (
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
          Списки регионов, городов и сфер сохраняются локально и доступны только вам. Добавляйте собственные значения, чтобы
          быстрее планировать мероприятия и проекты для Центральной Азии.
        </p>
      </div>
    </div>
  );
}
