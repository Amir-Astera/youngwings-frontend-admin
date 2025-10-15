import { useState, useEffect } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Translator, translatorsApi } from "../../lib/api";
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

export function TranslatorsManager() {
  const [translators, setTranslators] = useState<Translator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingTranslator, setEditingTranslator] = useState<Translator | null>(null);
  const [deleteTranslatorId, setDeleteTranslatorId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Translator>>({
    name: "",
    languages: [],
    specialization: [],
    experience: "",
    hourlyRate: "",
    available: true,
    rating: 0,
    completedProjects: 0,
  });

  useEffect(() => {
    loadTranslators();
  }, []);

  const loadTranslators = async () => {
    try {
      setIsLoading(true);
      const data = await translatorsApi.getAll();
      setTranslators(data);
    } catch (error) {
      toast.error("Ошибка загрузки переводчиков");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTranslator) {
        await translatorsApi.update(editingTranslator.id, formData);
        toast.success("Переводчик обновлен");
      } else {
        await translatorsApi.create(formData);
        toast.success("Переводчик добавлен");
      }
      setShowDialog(false);
      resetForm();
      loadTranslators();
    } catch (error) {
      toast.error("Ошибка сохранения переводчика");
    }
  };

  const handleEdit = (translator: Translator) => {
    setEditingTranslator(translator);
    setFormData(translator);
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await translatorsApi.delete(id);
      toast.success("Переводчик удален");
      loadTranslators();
    } catch (error) {
      toast.error("Ошибка удаления переводчика");
    }
    setDeleteTranslatorId(null);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      languages: [],
      specialization: [],
      experience: "",
      hourlyRate: "",
      available: true,
      rating: 0,
      completedProjects: 0,
    });
    setEditingTranslator(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl">Управление переводчиками</h1>
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

      {/* Translators List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Загрузка...</div>
        ) : translators.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Переводчики не найдены</div>
        ) : (
          translators.map((translator) => (
            <div
              key={translator.id}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg mb-1">{translator.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <span>⭐ {translator.rating}/5</span>
                    <span>·</span>
                    <span>{translator.completedProjects} проектов</span>
                    <span>·</span>
                    <span className={translator.available ? "text-green-600" : "text-gray-400"}>
                      {translator.available ? "Доступен" : "Занят"}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg text-blue-600">{translator.hourlyRate}</div>
                  <div className="text-xs text-gray-500">в час</div>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="text-sm text-gray-600 mb-1">Языки:</div>
                <div className="flex flex-wrap gap-2">
                  {translator.languages.map((lang) => (
                    <span
                      key={lang}
                      className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <div className="text-sm text-gray-600 mb-1">Специализация:</div>
                <div className="flex flex-wrap gap-2">
                  {translator.specialization.map((spec) => (
                    <span
                      key={spec}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-sm text-gray-500 mb-3">
                Опыт: {translator.experience}
              </div>

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
          ))
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTranslator ? "Редактировать переводчика" : "Добавить переводчика"}
            </DialogTitle>
            <DialogDescription>
              {editingTranslator 
                ? "Измените данные переводчика и сохраните изменения"
                : "Заполните информацию о новом переводчике"
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">ФИО *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="languages">Языки (через запятую) *</Label>
              <Input
                id="languages"
                value={formData.languages?.join(", ")}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    languages: e.target.value.split(",").map((l) => l.trim()),
                  })
                }
                placeholder="Русский, Английский, Казахский"
                required
              />
            </div>

            <div>
              <Label htmlFor="specialization">Специализация (через запятую) *</Label>
              <Input
                id="specialization"
                value={formData.specialization?.join(", ")}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    specialization: e.target.value.split(",").map((s) => s.trim()),
                  })
                }
                placeholder="Технический перевод, Юридический перевод"
                required
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="experience">Опыт работы *</Label>
                <Input
                  id="experience"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  placeholder="5+ лет"
                  required
                />
              </div>
              <div>
                <Label htmlFor="hourlyRate">Ставка в час *</Label>
                <Input
                  id="hourlyRate"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                  placeholder="5000 ₸"
                  required
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rating">Рейтинг (0-5)</Label>
                <Input
                  id="rating"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={formData.rating}
                  onChange={(e) =>
                    setFormData({ ...formData, rating: Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <Label htmlFor="completedProjects">Завершенных проектов</Label>
                <Input
                  id="completedProjects"
                  type="number"
                  value={formData.completedProjects}
                  onChange={(e) =>
                    setFormData({ ...formData, completedProjects: Number(e.target.value) })
                  }
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="available"
                checked={formData.available}
                onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="available">Доступен для работы</Label>
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
                {editingTranslator ? "Обновить" : "Добавить"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTranslatorId} onOpenChange={() => setDeleteTranslatorId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить переводчика?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Переводчик будет удален навсегда.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTranslatorId && handleDelete(deleteTranslatorId)}
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
