import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Plus, Edit, Trash2, Save } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
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
import {
  Translator,
  TranslatorRequest,
  translatorsApi,
  api,
} from "../../lib/api";
import { resolveFileUrl } from "../../lib/files";

const emptyForm: TranslatorRequest = {
  fullName: "",
  languages: "",
  specialization: "",
  experience: "",
  location: "",
  photoUrl: "",
  qrUrl: "",
  nickname: "",
};

const initialFilters = {
  q: "",
  languages: "",
  specializations: "",
  experience: "",
};

const parseCsv = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

const formatDateTime = (value: string) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function TranslatorsManager() {
  const [translators, setTranslators] = useState<Translator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingTranslator, setEditingTranslator] = useState<Translator | null>(null);
  const [deleteTranslatorId, setDeleteTranslatorId] = useState<string | null>(null);
  const [formData, setFormData] = useState<TranslatorRequest>(emptyForm);
  const [filters, setFilters] = useState(() => ({ ...initialFilters }));
  const [pagination, setPagination] = useState({ page: 1, size: 20, total: 0 });
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadingQr, setIsUploadingQr] = useState(false);
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const qrInputRef = useRef<HTMLInputElement | null>(null);
  const [areFiltersVisible, setAreFiltersVisible] = useState(false);
  const photoPreviewUrl =
    resolveFileUrl(formData.photoUrl?.trim() || undefined) ??
    (formData.photoUrl?.trim() ?? "");
  const qrPreviewUrl =
    resolveFileUrl(formData.qrUrl?.trim() || undefined) ?? (formData.qrUrl?.trim() ?? "");

  useEffect(() => {
    void loadTranslators(1, filters, pagination.size);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTranslators = async (
    page = 1,
    nextFilters = filters,
    size = pagination.size,
  ) => {
    try {
      setIsLoading(true);
      const data = await translatorsApi.getAll({
        page,
        size,
        q: nextFilters.q.trim() || undefined,
        languages: parseCsv(nextFilters.languages),
        specializations: parseCsv(nextFilters.specializations),
        experience: nextFilters.experience.trim() || undefined,
      });

      setTranslators(data.items);
      setPagination({ page: data.page, size: data.size, total: data.total });
    } catch (error) {
      toast.error("Ошибка загрузки переводчиков");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (isUploadingPhoto || isUploadingQr) {
      toast.error("Дождитесь завершения загрузки файлов");
      return;
    }

    const trimmed: TranslatorRequest = {
      fullName: formData.fullName.trim(),
      languages: formData.languages.trim(),
      specialization: formData.specialization.trim(),
      experience: formData.experience.trim(),
      location: formData.location.trim(),
      photoUrl: formData.photoUrl.trim(),
      qrUrl: formData.qrUrl.trim(),
      nickname: formData.nickname.trim(),
    };

    const fieldLabels: Record<keyof TranslatorRequest, string> = {
      fullName: "ФИО",
      languages: "Языки",
      specialization: "Специализация",
      experience: "Опыт",
      location: "Локация",
      photoUrl: "Фото",
      qrUrl: "QR-код",
      nickname: "Ватсап номер",
    };

    const missingField = (Object.keys(trimmed) as Array<keyof TranslatorRequest>).find(
      (key) => trimmed[key].length === 0,
    );

    if (missingField) {
      toast.error(`Заполните поле "${fieldLabels[missingField]}"`);
      return;
    }

    try {
      if (editingTranslator) {
        await translatorsApi.update(editingTranslator.id, trimmed);
        toast.success("Вакансия обновлена");
      } else {
        await translatorsApi.create(trimmed);
        toast.success("Вакансия добавлена");
      }

      setShowDialog(false);
      resetForm();
      void loadTranslators(1, filters, pagination.size);
    } catch (error) {
      toast.error("Ошибка сохранения переводчика");
    }
  };

  const handleEdit = (translator: Translator) => {
    setEditingTranslator(translator);
    setFormData({
      fullName: translator.fullName,
      languages: translator.languages,
      specialization: translator.specialization,
      experience: translator.experience,
      location: translator.location,
      photoUrl: translator.photoUrl,
      qrUrl: translator.qrUrl,
      nickname: translator.nickname,
    });
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await translatorsApi.delete(id);
      toast.success("Вакансия удалена");
      void loadTranslators(1, filters, pagination.size);
    } catch (error) {
      toast.error("Ошибка удаления переводчика");
    }
    setDeleteTranslatorId(null);
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingTranslator(null);
    if (photoInputRef.current) {
      photoInputRef.current.value = "";
    }
    if (qrInputRef.current) {
      qrInputRef.current.value = "";
    }
  };

  const handleFilterSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await loadTranslators(1, filters, pagination.size);
  };

  const handleResetFilters = () => {
    setFilters({ ...initialFilters });
    void loadTranslators(1, initialFilters, pagination.size);
  };

  const handlePhotoUpload = async (fileEvent: ChangeEvent<HTMLInputElement>) => {
    const file = fileEvent.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      setIsUploadingPhoto(true);
      const uploadResult = await api.uploadFile("ASSETS", file);
      const uploadedUrl = resolveFileUrl(uploadResult.url) ?? uploadResult.url ?? "";

      setFormData((prev) => ({ ...prev, photoUrl: uploadedUrl }));
      toast.success("Фото загружено");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Ошибка загрузки фото");
    } finally {
      setIsUploadingPhoto(false);
      if (fileEvent.target) {
        fileEvent.target.value = "";
      }
    }
  };

  const handleQrUpload = async (fileEvent: ChangeEvent<HTMLInputElement>) => {
    const file = fileEvent.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      setIsUploadingQr(true);
      const uploadResult = await api.uploadFile("ASSETS", file);
      const uploadedUrl = resolveFileUrl(uploadResult.url) ?? uploadResult.url ?? "";

      setFormData((prev) => ({ ...prev, qrUrl: uploadedUrl }));
      toast.success("QR загружен");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Ошибка загрузки QR");
    } finally {
      setIsUploadingQr(false);
      if (fileEvent.target) {
        fileEvent.target.value = "";
      }
    }
  };

  const splitValues = (value: string) => (value ? parseCsv(value) : []);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl">Управление переводчиками</h1>
          <p className="text-sm text-gray-500 mt-1">
            Всего вакансий переводчиков: {pagination.total}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => setAreFiltersVisible((prev) => !prev)}
          >
            {areFiltersVisible ? "Скрыть фильтры" : "Показать фильтры"}
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => {
              resetForm();
              setShowDialog(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Добавить переводчика
          </Button>
        </div>
      </div>

      {areFiltersVisible && (
        <form
          onSubmit={handleFilterSubmit}
          className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm grid gap-4 md:grid-cols-4"
        >
          <div className="space-y-2">
            <Label htmlFor="filter-q">Поиск</Label>
            <Input
              id="filter-q"
              value={filters.q}
              onChange={(event) => setFilters((prev) => ({ ...prev, q: event.target.value }))}
              placeholder="ФИО, языки, специализация"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="filter-languages">Языки</Label>
            <Input
              id="filter-languages"
              value={filters.languages}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, languages: event.target.value }))
              }
              placeholder="Например: EN,RU"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="filter-specializations">Специализации</Label>
            <Input
              id="filter-specializations"
              value={filters.specializations}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, specializations: event.target.value }))
              }
              placeholder="Технический,Синхронный"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="filter-experience">Опыт</Label>
            <Input
              id="filter-experience"
              value={filters.experience}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, experience: event.target.value }))
              }
              placeholder="Например: 5 лет"
            />
          </div>
          <div className="flex items-end gap-2 md:col-span-4">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Применить фильтры
            </Button>
            <Button type="button" variant="outline" onClick={handleResetFilters}>
              Сбросить
            </Button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Загрузка...</div>
        ) : translators.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Переводчики не найдены</div>
        ) : (
          translators.map((translator) => {
            const languages = splitValues(translator.languages);
            const specializations = splitValues(translator.specialization);
            const photoUrl = resolveFileUrl(translator.photoUrl) ?? translator.photoUrl;
            const qrUrl = resolveFileUrl(translator.qrUrl) ?? translator.qrUrl;

            return (
              <div
                key={translator.id}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-start gap-4">
                    {photoUrl && (
                      <img
                        src={photoUrl}
                        alt={translator.fullName}
                        className="w-20 h-20 rounded-lg object-cover border border-gray-200"
                      />
                    )}
                    <div>
                      <h3 className="text-lg font-semibold mb-1">{translator.fullName}</h3>
                      <div className="space-y-1 text-sm text-gray-500">
                        <div>Ватсап номер: {translator.nickname}</div>
                        <div>Локация: {translator.location}</div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-xs text-gray-500 space-y-1">
                    <div>Версия: v{translator.version}</div>
                    <div>Создано: {formatDateTime(translator.createdAt)}</div>
                    <div>Обновлено: {formatDateTime(translator.updatedAt)}</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-1">Языки:</div>
                  <div className="flex flex-wrap gap-2">
                    {languages.map((lang) => (
                      <span
                        key={lang}
                        className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded"
                      >
                        {lang}
                      </span>
                    ))}
                    {languages.length === 0 && (
                      <span className="text-sm text-gray-400">Не указаны</span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-1">Специализация:</div>
                  <div className="flex flex-wrap gap-2">
                    {specializations.map((spec) => (
                      <span
                        key={spec}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                      >
                        {spec}
                      </span>
                    ))}
                    {specializations.length === 0 && (
                      <span className="text-sm text-gray-400">Не указано</span>
                    )}
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  Опыт: <span className="text-gray-700">{translator.experience}</span>
                </div>

                {photoUrl && (
                  <div>
                    <a
                      href={photoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Открыть фото
                    </a>
                  </div>
                )}

                {qrUrl && (
                  <div>
                    <a
                      href={qrUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Открыть QR
                    </a>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(translator)}>
                    <Edit className="w-4 h-4 mr-1" />
                    Редактировать
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => setDeleteTranslatorId(translator.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Удалить
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Dialog
        open={showDialog}
        onOpenChange={(open) => {
          setShowDialog(open);
          if (!open) {
            resetForm();
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTranslator ? "Редактировать переводчика" : "Добавить переводчика"}
            </DialogTitle>
            <DialogDescription>
              {editingTranslator
                ? "Измените данные переводчика и сохраните изменения"
                : "Заполните информацию о новой вакансии переводчика"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="fullName">ФИО *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(event) => setFormData({ ...formData, fullName: event.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="languages">Языки (через запятую) *</Label>
              <Input
                id="languages"
                value={formData.languages}
                onChange={(event) => setFormData({ ...formData, languages: event.target.value })}
                placeholder="Например: RU,EN,KZ"
                required
              />
            </div>

            <div>
              <Label htmlFor="specialization">Специализации (через запятую) *</Label>
              <Input
                id="specialization"
                value={formData.specialization}
                onChange={(event) =>
                  setFormData({ ...formData, specialization: event.target.value })
                }
                placeholder="Например: Синхронный, Технический"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="experience">Опыт *</Label>
                <Input
                  id="experience"
                  value={formData.experience}
                  onChange={(event) => setFormData({ ...formData, experience: event.target.value })}
                  placeholder="Например: 5 лет"
                  required
                />
              </div>
              <div>
                <Label htmlFor="location">Локация *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(event) => setFormData({ ...formData, location: event.target.value })}
                  placeholder="Город"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nickname">Ватсап номер *</Label>
                <Input
                  id="nickname"
                  value={formData.nickname}
                  onChange={(event) => setFormData({ ...formData, nickname: event.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Фото *</Label>
                <div className="mt-2 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => photoInputRef.current?.click()}
                      disabled={isUploadingPhoto}
                    >
                      {isUploadingPhoto
                        ? "Загрузка..."
                        : photoPreviewUrl
                          ? "Заменить фото"
                          : "Загрузить фото"}
                    </Button>
                    {photoPreviewUrl && (
                      <a
                        href={photoPreviewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Открыть в новой вкладке
                      </a>
                    )}
                  </div>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                  {photoPreviewUrl && (
                    <img
                      src={photoPreviewUrl}
                      alt="Фото переводчика"
                      className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                    />
                  )}
                </div>
              </div>

              <div>
                <Label>QR-код *</Label>
                <div className="mt-2 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => qrInputRef.current?.click()}
                      disabled={isUploadingQr}
                    >
                      {isUploadingQr
                        ? "Загрузка..."
                        : qrPreviewUrl
                          ? "Заменить QR"
                          : "Загрузить QR"}
                    </Button>
                    {qrPreviewUrl && (
                      <a
                        href={qrPreviewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Открыть в новой вкладке
                      </a>
                    )}
                  </div>
                  <input
                    ref={qrInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleQrUpload}
                  />
                  {qrPreviewUrl && (
                    <img
                      src={qrPreviewUrl}
                      alt="QR переводчика"
                      className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Отмена
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" />
                Сохранить
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteTranslatorId !== null} onOpenChange={() => setDeleteTranslatorId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить переводчика?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Переводчик будет удален из списка.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteTranslatorId && void handleDelete(deleteTranslatorId)}
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
