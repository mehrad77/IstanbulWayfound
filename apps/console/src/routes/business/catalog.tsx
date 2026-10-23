import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { ALLERGENS, DIETARY, type Localized, type Vertical } from "@wayfound/core";
import { t } from "@wayfound/i18n";
import clsx from "clsx";
import { Check, ChevronDown, GripVertical, ImagePlus, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Card,
  ErrorNote,
  Field,
  Input,
  LocalizedField,
  Spinner,
} from "../../components/ui.tsx";
import { api } from "../../lib/api.ts";
import { ago, CATALOG_LABEL } from "../../lib/format.ts";
import { useBusiness } from "../../lib/session.ts";
import type { EditableCategory, EditableItem } from "../../lib/types.ts";

type Patch = Partial<Omit<EditableItem, "id" | "photoUrl" | "updatedAt">>;

async function suggest(text: string, from: "en" | "tr", to: "en" | "tr") {
  const r = await api<{ text: string }>("/console/translate", {
    method: "POST",
    json: { text, from, to },
  });
  return r.text;
}

function PriceInput({
  item,
  onSave,
}: {
  item: EditableItem;
  onSave: (kurus: number | null) => Promise<void>;
}) {
  const [value, setValue] = useState(item.priceKurus === null ? "" : String(item.priceKurus / 100));
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");
  useEffect(
    () => setValue(item.priceKurus === null ? "" : String(item.priceKurus / 100)),
    [item.priceKurus],
  );
  async function commit() {
    const kurus = value.trim() === "" ? null : Math.round(Number(value.replace(",", ".")) * 100);
    if (kurus !== null && Number.isNaN(kurus)) return;
    if (kurus === item.priceKurus) return;
    setState("saving");
    await onSave(kurus);
    setState("saved");
    setTimeout(() => setState("idle"), 2000);
  }
  return (
    <div className="flex items-center gap-1">
      <span className="text-sm text-ink-soft">₺</span>
      <input
        aria-label={`Price for ${item.name.en}`}
        data-testid={`price-${item.id}`}
        inputMode="decimal"
        className="field w-24 py-1 text-end tabular-nums"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        }}
      />
      <span className="w-4" aria-live="polite">
        {state === "saved" ? (
          <Check className="size-4 text-ok" aria-label="Saved" data-testid={`saved-${item.id}`} />
        ) : null}
      </span>
    </div>
  );
}

function ItemEditor({
  item,
  vertical,
  onPatch,
  onDelete,
  bid,
}: {
  item: EditableItem;
  vertical: Vertical;
  onPatch: (p: Patch) => Promise<void>;
  onDelete: () => void;
  bid: string;
}) {
  const [draft, setDraft] = useState({ name: item.name, description: item.description });
  const [extra, setExtra] = useState({
    sku: item.sku ?? "",
    fabric: item.fabric ?? "",
    sizes: item.sizes.join(", "),
    moq: item.moq ?? "",
    durationMin: item.durationMin ?? "",
  });
  const qc = useQueryClient();
  const dirty =
    JSON.stringify(draft) !== JSON.stringify({ name: item.name, description: item.description });
  const toggle = (key: "dietary" | "allergens", v: string) => {
    const list = item[key].includes(v) ? item[key].filter((x) => x !== v) : [...item[key], v];
    onPatch({ [key]: list });
  };
  async function upload(file: File) {
    const body = new FormData();
    body.set("file", file);
    await api(`/console/businesses/${bid}/items/${item.id}/photo`, { method: "POST", body });
    qc.invalidateQueries({ queryKey: ["catalog", bid] });
  }
  const suggestField =
    (field: "name" | "description") => async (from: "en" | "tr", to: "en" | "tr") => {
      const text = await suggest(draft[field][from], from, to);
      setDraft((d) => ({ ...d, [field]: { ...d[field], [to]: text } as Localized }));
    };

  return (
    <div className="grid gap-3 border-t border-line bg-paper/60 p-4">
      <LocalizedField
        label="Name"
        value={draft.name}
        onChange={(v) => setDraft({ ...draft, name: v })}
        onSuggest={suggestField("name")}
      />
      <LocalizedField
        label="Description"
        value={draft.description}
        multiline
        onChange={(v) => setDraft({ ...draft, description: v })}
        onSuggest={suggestField("description")}
      />
      {dirty ? (
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => onPatch(draft)}>
            Save text
          </Button>
          <span className="text-xs text-ink-soft">
            Machine suggestions are drafts: check them before saving.
          </span>
        </div>
      ) : null}

      {vertical === "dining" ? (
        <>
          <div>
            <p className="label">Diet</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {DIETARY.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggle("dietary", d)}
                  className={clsx(
                    "rounded-full border px-2.5 py-1 text-xs font-medium",
                    item.dietary.includes(d)
                      ? "border-ok bg-ok-soft text-ok"
                      : "border-line bg-white text-ink-soft",
                  )}
                >
                  {t("en", `dietary.${d}`)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="label">Contains allergens</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {ALLERGENS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggle("allergens", a)}
                  className={clsx(
                    "rounded-full border px-2.5 py-1 text-xs font-medium",
                    item.allergens.includes(a)
                      ? "border-warn bg-warn-soft text-warn"
                      : "border-line bg-white text-ink-soft",
                  )}
                >
                  {t("en", `allergens.${a}`)}
                </button>
              ))}
            </div>
          </div>
        </>
      ) : null}

      {vertical === "retail" ? (
        <div className="grid gap-3 sm:grid-cols-4">
          <Field label="Item code">
            <Input
              value={extra.sku}
              onChange={(e) => setExtra({ ...extra, sku: e.target.value })}
              onBlur={() => onPatch({ sku: extra.sku || null })}
            />
          </Field>
          <Field label="Fabric">
            <Input
              value={extra.fabric}
              onChange={(e) => setExtra({ ...extra, fabric: e.target.value })}
              onBlur={() => onPatch({ fabric: extra.fabric || null })}
            />
          </Field>
          <Field label="Sizes">
            <Input
              value={extra.sizes}
              onChange={(e) => setExtra({ ...extra, sizes: e.target.value })}
              onBlur={() =>
                onPatch({
                  sizes: extra.sizes
                    .split(",")
                    .map((x) => x.trim())
                    .filter(Boolean),
                })
              }
            />
          </Field>
          <Field label="Min. order">
            <Input
              type="number"
              min={0}
              value={extra.moq}
              onChange={(e) => setExtra({ ...extra, moq: e.target.value })}
              onBlur={() => onPatch({ moq: extra.moq === "" ? null : Number(extra.moq) })}
            />
          </Field>
        </div>
      ) : null}

      {vertical === "clinic" ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Duration (minutes)">
            <Input
              type="number"
              min={0}
              value={extra.durationMin}
              onChange={(e) => setExtra({ ...extra, durationMin: e.target.value })}
              onBlur={() =>
                onPatch({
                  durationMin: extra.durationMin === "" ? null : Number(extra.durationMin),
                })
              }
            />
          </Field>
          <label className="flex items-center gap-2 pt-5 text-sm">
            <input
              type="checkbox"
              checked={item.priceFrom}
              onChange={(e) => onPatch({ priceFrom: e.target.checked })}
            />{" "}
            Show as "from" price
          </label>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-cobalt-700">
          <ImagePlus className="size-4" /> {item.photoUrl ? "Replace photo" : "Add photo"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="sr-only"
            onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
          />
        </label>
        <Button variant="danger" size="sm" className="ms-auto" onClick={onDelete}>
          <Trash2 className="size-3.5" /> Delete item
        </Button>
      </div>
    </div>
  );
}

function SortableItem(props: {
  item: EditableItem;
  vertical: Vertical;
  bid: string;
  onPatch: (p: Patch) => Promise<void>;
  onDelete: () => void;
}) {
  const { item } = props;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });
  const [open, setOpen] = useState(false);
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={clsx("bg-white", isDragging && "relative z-10 shadow-lg")}
      data-item-row={item.id}
    >
      <div className="flex items-center gap-2 px-3 py-2">
        <button
          type="button"
          className="cursor-grab touch-none p-1 text-ink-soft"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>
        {item.photoUrl ? (
          <img src={item.photoUrl} alt="" className="size-9 rounded-md object-cover" />
        ) : null}
        <button type="button" className="min-w-0 flex-1 text-start" onClick={() => setOpen(!open)}>
          <span
            className={clsx(
              "block truncate text-sm font-semibold",
              item.soldOut ? "text-ink-soft line-through" : "text-ink",
            )}
          >
            {item.name.en || item.name.tr}
          </span>
          <span className="block truncate text-xs text-ink-soft">
            {item.name.tr}
            {!item.name.tr || !item.name.en ? <Badge tone="warn">translation missing</Badge> : null}
          </span>
        </button>
        <label className="hidden items-center gap-1 text-xs text-ink-soft sm:flex">
          <input
            type="checkbox"
            checked={item.soldOut}
            onChange={(e) => props.onPatch({ soldOut: e.target.checked })}
          />{" "}
          Sold out
        </label>
        <PriceInput item={item} onSave={(priceKurus) => props.onPatch({ priceKurus })} />
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-label="Edit item"
          className="p-1 text-ink-soft"
        >
          <ChevronDown className={clsx("size-4 transition-transform", open && "rotate-180")} />
        </button>
      </div>
      {open ? <ItemEditor {...props} /> : null}
    </li>
  );
}

function CategoryBlock({
  category,
  vertical,
  bid,
}: {
  category: EditableCategory;
  vertical: Vertical;
  bid: string;
}) {
  const qc = useQueryClient();
  const [items, setItems] = useState(category.items);
  const [name, setName] = useState(category.name);
  useEffect(() => setItems(category.items), [category.items]);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const refresh = () => qc.invalidateQueries({ queryKey: ["catalog", bid] });

  async function patchItem(id: string, patch: Patch) {
    setItems((list) => list.map((i) => (i.id === id ? { ...i, ...patch } : i)));
    await api(`/console/businesses/${bid}/items/${id}`, { method: "PATCH", json: patch });
    refresh();
  }
  async function onDragEnd(e: DragEndEvent) {
    if (!e.over || e.active.id === e.over.id) return;
    const from = items.findIndex((i) => i.id === e.active.id);
    const to = items.findIndex((i) => i.id === e.over!.id);
    const next = arrayMove(items, from, to);
    setItems(next);
    await api(`/console/businesses/${bid}/items/reorder`, {
      method: "POST",
      json: { ids: next.map((i) => i.id) },
    });
    refresh();
  }
  async function addItem() {
    await api(`/console/businesses/${bid}/items`, {
      method: "POST",
      json: {
        categoryId: category.id,
        name: { en: "New item", tr: "" },
        description: { en: "", tr: "" },
        priceKurus: null,
        priceFrom: vertical === "clinic",
      },
    });
    refresh();
  }
  async function deleteItem(id: string) {
    if (!confirm("Delete this item from the public page?")) return;
    await api(`/console/businesses/${bid}/items/${id}`, { method: "DELETE" });
    refresh();
  }
  const nameDirty = name.en !== category.name.en || name.tr !== category.name.tr;

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-end gap-2 border-b border-line bg-paper-deep/50 p-3">
        <div className="min-w-0 flex-1">
          <LocalizedField label="Category" value={name} onChange={setName} />
        </div>
        {nameDirty ? (
          <Button
            size="sm"
            onClick={async () => {
              await api(`/console/businesses/${bid}/categories/${category.id}`, {
                method: "PATCH",
                json: { name },
              });
              refresh();
            }}
          >
            Save
          </Button>
        ) : null}
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <ul className="divide-y divide-line">
            {items.map((item) => (
              <SortableItem
                key={item.id}
                item={item}
                vertical={vertical}
                bid={bid}
                onPatch={(p) => patchItem(item.id, p)}
                onDelete={() => deleteItem(item.id)}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
      <div className="border-t border-line p-2">
        <Button variant="ghost" size="sm" onClick={addItem}>
          <Plus className="size-3.5" /> Add item
        </Button>
      </div>
    </Card>
  );
}

export function CatalogPage() {
  const { bid } = useParams({ from: "/app/b/$bid/catalog" });
  const biz = useBusiness(bid)!;
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["catalog", bid],
    queryFn: () =>
      api<{ categories: EditableCategory[] }>(`/console/businesses/${bid}/catalog`).then(
        (r) => r.categories,
      ),
  });
  const addCategory = useMutation({
    mutationFn: () =>
      api(`/console/businesses/${bid}/categories`, {
        method: "POST",
        json: { name: { en: "New category", tr: "Yeni kategori" } },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalog", bid] }),
  });
  if (isLoading) return <Spinner />;
  const latest = data
    ?.flatMap((c) => c.items.map((i) => i.updatedAt))
    .sort()
    .at(-1);
  return (
    <div className="grid max-w-4xl gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-soft">
          {CATALOG_LABEL[biz.vertical]}: {data?.reduce((a, c) => a + c.items.length, 0)} items.
          Prices are in Turkish lira; edits go live on the public page immediately.
          {latest ? <> Last change {ago(latest)}.</> : null}
        </p>
        <Button variant="secondary" size="sm" onClick={() => addCategory.mutate()}>
          <Plus className="size-3.5" /> Add category
        </Button>
      </div>
      <ErrorNote error={error} />
      {data?.map((c) => (
        <CategoryBlock key={c.id} category={c} vertical={biz.vertical} bid={bid} />
      ))}
    </div>
  );
}
