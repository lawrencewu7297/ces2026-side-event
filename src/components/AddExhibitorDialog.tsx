import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Exhibitor } from "@/types";
import { Plus } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface AddExhibitorDialogProps {
  onAdd: (data: Omit<Exhibitor, 'iid' | 'isXFactor'>) => void;
}

export function AddExhibitorDialog({ onAdd }: AddExhibitorDialogProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    booth: '',
    country: '',
    category: 'X-Factor',
    website: '',
    about: '',
    contact: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
        名称: formData.name,
        booths: formData.booth,
        国家: formData.country,
        category: formData.category,
        website: formData.website,
        关于: formData.about,
        contact: formData.contact,
        Logo: null,
        event: null,
        "Company Info": null
    });
    setOpen(false);
    setFormData({
        name: '',
        booth: '',
        country: '',
        category: 'X-Factor',
        website: '',
        about: '',
        contact: ''
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4" />
            {t.actions.addXFactor}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
            <DialogHeader>
            <DialogTitle>{t.dialog.addTitle}</DialogTitle>
            <DialogDescription>
                {t.dialog.addDesc}
            </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">{t.dialog.name} *</Label>
                <Input id="name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="booth" className="text-right">{t.dialog.booth}</Label>
                <Input id="booth" value={formData.booth} onChange={e => setFormData({...formData, booth: e.target.value})} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="country" className="text-right">{t.filters.country}</Label>
                <Input id="country" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">{t.dialog.category}</Label>
                <Input id="category" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="contact" className="text-right">{t.dialog.contact}</Label>
                <Textarea id="contact" value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} className="col-span-3" />
            </div>
            </div>
            <DialogFooter>
            <Button type="submit">{t.actions.save}</Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
