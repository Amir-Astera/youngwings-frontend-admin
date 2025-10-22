import { useEffect, useState } from "react";
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
} from "../../lib/api";
import { resolveFileUrl } from "../../lib/files";

const emptyForm: TranslatorRequest = {
  fullName: "",
  languages: "",
  specialization: "",
  experience: "",
  location: "",
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

    const trimmed: TranslatorRequest = {
      fullName: formData.fullName.trim(),
      languages: formData.languages.trim(),
      specialization: formData.specialization.trim(),
      experience: formData.experience.trim(),
      location: formData.location.trim(),
      qrUrl: formData.qrUrl.trim(),
      nickname: formData.nickname.trim(),
    };

    const fieldLabels: Record<keyof TranslatorRequest, string> = {
      fullName: "ФИО",
      languages: "Языки",
      specialization: "Специализация",
      experience: "Опыт",
      location: "Локация",
      qrUrl: "Ссылка на QR-код",
      nickname: "Никнейм",
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
  };

  const handleFilterSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await loadTranslators(1, filters, pagination.size);
  };

  const handleResetFilters = () => {
    setFilters({ ...initialFilters });
    void loadTranslators(1, initialFilters, pagination.size);
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

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Загрузка...</div>
        ) : translators.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Переводчики не найдены</div>
        ) : (
          translators.map((translator) => {
            const languages = splitValues(translator.languages);
            const specializations = splitValues(translator.specialization);
            const qrLink = resolveFileUrl(translator.qrUrl) ?? translator.qrUrl;

            return (
              <div
                key={translator.id}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4"
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{translator.fullName}</h3>
                    <div className="space-y-1 text-sm text-gray-500">
                      <div>Никнейм: {translator.nickname}</div>
                      <div>Локация: {translator.location}</div>
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

                {qrLink && (
                  <div className="text-sm">
                    QR-код: {" "}
                    <a
                      href={qrLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-all"
                    >
                      {qrLink}
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
                <Label htmlFor="nickname">Никнейм *</Label>
                <Input
                  id="nickname"
                  value={formData.nickname}
                  onChange={(event) => setFormData({ ...formData, nickname: event.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="qrUrl">Ссылка на QR-код *</Label>
                <Input
                  id="qrUrl"
                  value={formData.qrUrl}
                  onChange={(event) => setFormData({ ...formData, qrUrl: event.target.value })}
                  placeholder="/api/files/qr/..."
                  required
                />
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
