import { useState, useEffect, useRef } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { api, Event, eventsApi, settingsApi } from "../../lib/api";
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
  const [regions, setRegions] = useState<string[]>([]);
  const [spheres, setSpheres] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Event>>({
    title: "",
    description: "",
    eventDate: "",
    eventTime: "",
    location: "",
    format: "ONLINE",
    region: "",
    sphere: "",
    coverUrl: "",
    registrationUrl: "",
  });
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    loadEvents();
    loadSettings();
  }, []);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const data = await eventsApi.getAll();
      setEvents(data);
    } catch (error) {
      toast.error("Ошибка загрузки событий");
    } finally {
      setIsLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const [regionsData, spheresData] = await Promise.all([
        settingsApi.getRegions(),
        settingsApi.getSpheres(),
      ]);
      setRegions(regionsData);
      setSpheres(spheresData);
    } catch (error) {
      console.error("Ошибка загрузки настроек");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        await eventsApi.update(editingEvent.id, formData);
        toast.success("Событие обновлено");
      } else {
        await eventsApi.create(formData);
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
      eventTime: event.eventTime,
      location: event.location,
      format: event.format,
      region: event.region,
      sphere: event.sphere,
      coverUrl: event.coverUrl ?? "",
      registrationUrl: event.registrationUrl ?? "",
    });
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
      eventTime: "",
      location: "",
      format: "ONLINE",
      region: "",
      sphere: "",
      coverUrl: "",
      registrationUrl: "",
    });
    setEditingEvent(null);
  };

  const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      setIsUploadingCover(true);
      const uploadResult = await api.uploadFile("ASSETS", file);
      const uploadedUrl = uploadResult.url ?? (uploadResult as any).path ?? "";

      if (!uploadedUrl) {
        throw new Error("Не удалось получить ссылку на файл");
      }

      setFormData((prev) => ({ ...prev, coverUrl: uploadedUrl }));
      toast.success("Обложка загружена");
    } catch (error) {
      console.error(error);
      toast.error("Ошибка загрузки обложки");
    } finally {
      setIsUploadingCover(false);
      if (event.target) {
        event.target.value = "";
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl">Управление событиями</h1>
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
          events.map((event) => (
            <div
              key={event.id}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
            >
              <div className="flex gap-4">
                {event.coverUrl && (
                  <img
                    src={event.coverUrl}
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
                    <span>{event.eventDate}</span>
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
          ))
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
                <Label htmlFor="date">Дата *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="time">Время *</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.eventTime}
                  onChange={(e) => setFormData({ ...formData, eventTime: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location">Место проведения *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
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
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="region">Регион</Label>
                <select
                  id="region"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
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
                  {formData.coverUrl && (
                    <a
                      href={formData.coverUrl}
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
                {formData.coverUrl && (
                  <img
                    src={formData.coverUrl}
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
