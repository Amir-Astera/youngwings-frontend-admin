import { useState, useEffect, useRef } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { api, Event, eventsApi, settingsApi } from "../../lib/api";
import type { RegionCityMap } from "../../lib/api";
import { resolveFileUrl } from "../../lib/files";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

export function EventsManager() {
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsMeta, setEventsMeta] = useState({ total: 0, page: 1, size: 20 });
  const [regionCityMap, setRegionCityMap] = useState<RegionCityMap>({});
  const [regions, setRegions] = useState<string[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [spheres, setSpheres] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Event>>({
    title: "",
    description: "",
    eventDate: "",
    eventEndDate: "",
    eventTime: "00:00",
    location: "",
    format: "ONLINE",
    region: "",
    sphere: "",
    coverUrl: "",
    registrationUrl: "",
  });
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const coverPreviewUrl =
    resolveFileUrl(formData.coverUrl ?? undefined) ?? (formData.coverUrl?.trim() ?? "");

  const selectedRegion = (formData.region ?? "").trim();
  const selectedCity = (formData.location ?? "").trim();

  const updateAvailableCities = (
    regionName: string,
    currentCity?: string,
    sourceMap?: RegionCityMap
  ) => {
    const map = sourceMap ?? regionCityMap;
    const trimmedRegion = regionName.trim();

    if (!trimmedRegion) {
      setAvailableCities([]);
      return;
    }

    const normalizedRegion =
      Object.keys(map).find((key) => key.toLowerCase() === trimmedRegion.toLowerCase()) ??
      trimmedRegion;

    const baseCities = map[normalizedRegion] ?? [];
    const trimmedCity = currentCity?.trim();

    const uniqueCities = new Set(
      baseCities.map((city) => city.trim()).filter((city) => city.length > 0)
    );

    if (trimmedCity && trimmedCity.length > 0) {
      uniqueCities.add(trimmedCity);
    }

    const nextCities = Array.from(uniqueCities).sort((a, b) => a.localeCompare(b, "ru"));
    setAvailableCities(nextCities);
  };

  useEffect(() => {
    loadEvents();
    loadSettings();
  }, []);

  useEffect(() => {
    if (!selectedRegion) {
      setAvailableCities([]);
      return;
    }

    updateAvailableCities(selectedRegion, selectedCity);
  }, [selectedRegion, selectedCity, regionCityMap]);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const data = await eventsApi.getAll({ page: 1, size: 20 });
      setEvents(data.items);
      setEventsMeta({ total: data.total, page: data.page, size: data.size });
    } catch (error) {
      toast.error("Ошибка загрузки событий");
    } finally {
      setIsLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const [regionsData, spheresData] = await Promise.all([
        settingsApi.getRegionsWithCities(),
        settingsApi.getSpheres(),
      ]);
      const sortedRegions = Object.keys(regionsData).sort((a, b) => a.localeCompare(b, "ru"));
      setRegionCityMap(regionsData);
      setRegions(sortedRegions);
      setSpheres(spheresData);
      updateAvailableCities(selectedRegion, selectedCity, regionsData);
    } catch (error) {
      console.error("Ошибка загрузки настроек");
    }
  };

  const handleRegionSelect = (value: string) => {
    const trimmed = value.trim();
    setFormData((prev) => ({
      ...prev,
      region: trimmed,
      location: "",
    }));
    updateAvailableCities(trimmed);
  };

  const handleCitySelect = (value: string) => {
    const trimmed = value.trim();
    setFormData((prev) => ({
      ...prev,
      location: trimmed,
    }));
  };

  const handleEventStartDateChange = (value: string) => {
    const trimmed = value.trim();
    setFormData((prev) => {
      if (!trimmed) {
        return {
          ...prev,
          eventDate: "",
          eventEndDate: "",
        };
      }

      const currentEnd = prev.eventEndDate?.trim() ?? "";
      const normalizedEnd = !currentEnd || currentEnd < trimmed ? trimmed : currentEnd;

      return {
        ...prev,
        eventDate: trimmed,
        eventEndDate: normalizedEnd,
      };
    });
  };

  const handleEventEndDateChange = (value: string) => {
    const trimmed = value.trim();
    setFormData((prev) => {
      if (!trimmed) {
        return { ...prev, eventEndDate: "" };
      }

      const start = prev.eventDate?.trim() ?? "";
      const normalizedEnd = start && trimmed < start ? start : trimmed;

      return {
        ...prev,
        eventEndDate: normalizedEnd,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploadingCover) {
      toast.error("Дождитесь завершения загрузки обложки");
      return;
    }

    const trimValue = (value?: string | null) => (value ?? "").trim();
    const normalizeOptional = (value?: string | null) => {
      const trimmed = trimValue(value);
      return trimmed.length > 0 ? trimmed : undefined;
    };

    const normalizedEventDate = trimValue(formData.eventDate);
    const normalizedEventEndDate = trimValue(formData.eventEndDate) || normalizedEventDate;

    const normalized: Partial<Event> = {
      title: trimValue(formData.title),
      description: trimValue(formData.description),
      eventDate: normalizedEventDate,
      eventEndDate: normalizedEventEndDate,
      eventTime: "00:00",
      location: trimValue(formData.location),
      format: trimValue(formData.format),
      region: trimValue(formData.region),
      sphere: trimValue(formData.sphere),
      coverUrl: normalizeOptional(formData.coverUrl),
      registrationUrl: normalizeOptional(formData.registrationUrl),
    };

    const requiredFields: Array<keyof typeof normalized> = [
      "title",
      "description",
      "eventDate",
      "eventEndDate",
      "region",
      "location",
      "format",
      "sphere",
    ];

    const fieldLabels: Record<string, string> = {
      title: "Заголовок",
      description: "Описание",
      eventDate: "Дата проведения",
      eventEndDate: "Дата окончания",
      location: "Город",
      format: "Формат",
      region: "Регион",
      sphere: "Сфера",
    };

    const missingField = requiredFields.find((field) => {
      const value = normalized[field];
      return !value || (typeof value === "string" && value.length === 0);
    });

    if (missingField) {
      toast.error(`Заполните поле "${fieldLabels[missingField as string] ?? missingField}"`);
      return;
    }

    try {
      if (editingEvent) {
        await eventsApi.update(editingEvent.id, normalized);
        toast.success("Событие обновлено");
      } else {
        await eventsApi.create(normalized);
        toast.success("Событие создано");
      }
      setShowDialog(false);
      resetForm();
      loadEvents();
    } catch (error) {
      toast.error("Ошибка сохранения события");
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      id: event.id,
      title: event.title,
      description: event.description,
      eventDate: event.eventDate,
      eventEndDate: event.eventEndDate,
      eventTime: event.eventTime || "00:00",
      location: event.location,
      format: event.format,
      region: event.region,
      sphere: event.sphere,
      coverUrl: event.coverUrl ?? "",
      registrationUrl: event.registrationUrl ?? "",
    });
    updateAvailableCities(event.region ?? "", event.location ?? "");
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await eventsApi.delete(id);
      toast.success("Событие удалено");
      loadEvents();
    } catch (error) {
      toast.error("Ошибка удаления события");
    }
    setDeleteEventId(null);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      eventDate: "",
      eventEndDate: "",
      eventTime: "00:00",
      location: "",
      format: "ONLINE",
      region: "",
      sphere: "",
      coverUrl: "",
      registrationUrl: "",
    });
    setEditingEvent(null);
    setAvailableCities([]);
  };

  const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      setIsUploadingCover(true);
      const uploadResult = await api.uploadFile("ASSETS", file);
      const uploadedUrl = resolveFileUrl(uploadResult.url) ?? uploadResult.url;

      setFormData((prev) => ({ ...prev, coverUrl: uploadedUrl || "" }));
      toast.success("Обложка загружена");
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Ошибка загрузки обложки"
      );
    } finally {
      setIsUploadingCover(false);
      if (event.target) {
        event.target.value = "";
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl">Управление событиями</h1>
          <p className="text-sm text-gray-500 mt-1">Всего событий: {eventsMeta.total}</p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => {
            resetForm();
            setShowDialog(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Добавить событие
        </Button>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Загрузка...</div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 text-gray-500">События и выставки не найдены</div>
        ) : (
          events.map((event) => {
            const coverSrc = resolveFileUrl(event.coverUrl ?? undefined) ?? event.coverUrl ?? undefined;
            const hasDateRange =
              Boolean(event.eventEndDate) && event.eventEndDate !== event.eventDate;
            const dateLabel = hasDateRange
              ? `${event.eventDate} — ${event.eventEndDate}`
              : event.eventDate;

            return (
              <div
                key={event.id}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
              >
                <div className="flex gap-4">
                  {coverSrc && (
                    <img
                      src={coverSrc}
                      alt={event.title}
                      className="w-32 h-24 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg mb-2">{event.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {event.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <span>{dateLabel}</span>
                      {event.eventTime && (
                        <>
                          <span>·</span>
                          <span>{event.eventTime}</span>
                        </>
                      )}
                      <span>·</span>
                      <span>{event.location}</span>
                      <span>·</span>
                      <span>{event.format}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(event)}>
                        <Edit className="w-4 h-4 mr-1" />
                        Редактировать
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setDeleteEventId(event.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Удалить
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEvent ? "Редактировать событие/выставку" : "Создать событие/выставку"}
            </DialogTitle>
            <DialogDescription>
              {editingEvent 
                ? "Измените данные события/выставки и сохраните изменения"
                : "Заполните информацию о новом событии или выставке"
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Название *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Описание *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                required
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dateStart">Дата начала *</Label>
                <Input
                  id="dateStart"
                  type="date"
                  value={formData.eventDate ?? ""}
                  onChange={(e) => handleEventStartDateChange(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="dateEnd">Дата окончания *</Label>
                <Input
                  id="dateEnd"
                  type="date"
                  value={formData.eventEndDate ?? ""}
                  min={formData.eventDate || undefined}
                  onChange={(e) => handleEventEndDateChange(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="format">Формат</Label>
                <select
                  id="format"
                  value={formData.format}
                  onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                >
                  <option value="ONLINE">Онлайн</option>
                  <option value="OFFLINE">Офлайн</option>
                  <option value="HYBRID">Гибрид</option>
                </select>
              </div>
              <div>
                <Label htmlFor="sphere">Сфера</Label>
                <select
                  id="sphere"
                  value={formData.sphere}
                  onChange={(e) => setFormData({ ...formData, sphere: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                >
                  <option value="">Выберите сферу</option>
                  {spheres.map((sphere) => (
                    <option key={sphere} value={sphere}>
                      {sphere}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="region">Регион *</Label>
                <select
                  id="region"
                  value={formData.region ?? ""}
                  onChange={(e) => handleRegionSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  required
                >
                  <option value="">Выберите регион</option>
                  {regions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="city">Город *</Label>
                <select
                  id="city"
                  value={formData.location ?? ""}
                  onChange={(e) => handleCitySelect(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  disabled={!selectedRegion}
                  required={Boolean(selectedRegion)}
                >
                  <option value="">
                    {selectedRegion ? "Выберите город" : "Сначала выберите регион"}
                  </option>
                  {availableCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="registrationUrl">Ссылка на регистрацию</Label>
              <Input
                id="registrationUrl"
                type="url"
                value={formData.registrationUrl ?? ""}
                onChange={(e) => setFormData({ ...formData, registrationUrl: e.target.value })}
                placeholder="https://example.com/register"
              />
            </div>

            <div>
              <Label>Обложка события</Label>
              <div className="mt-2 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingCover}
                  >
                    {isUploadingCover ? "Загрузка..." : "Загрузить обложку"}
                  </Button>
                  {coverPreviewUrl && (
                    <a
                      href={coverPreviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Открыть в новой вкладке
                    </a>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverUpload}
                />
                {coverPreviewUrl && (
                  <img
                    src={coverPreviewUrl}
                    alt="Обложка"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowDialog(false);
                  resetForm();
                }}
              >
                Отмена
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {editingEvent ? "Обновить" : "Создать"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteEventId} onOpenChange={() => setDeleteEventId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить событие/выставку?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Событие/выставка будет удалено навсегда.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteEventId && handleDelete(deleteEventId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
