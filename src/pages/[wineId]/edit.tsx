import type { WineType } from "@prisma/client";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";

import { api, type RouterOutputs } from "~/utils/api";

const WINE_TYPES: WineType[] = [
  "RED",
  "WHITE",
  "ROSE",
  "RED_BLEND",
  "WHITE_BLEND",
];

import { Check, ChevronsUpDown } from "lucide-react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "~/components/ui/command";
import { wineries } from "~/lib/data";
import { Textarea } from "~/components/ui/textarea";

export default function EditWine() {
  useSession({ required: true });
  const router = useRouter();
  const utils = api.useUtils();
  const wineId = router.query.wineId as string | undefined;

  const [wine, setWine] = useState<RouterOutputs["wine"]["getOne"] | null>(
    null,
  );

  useEffect(() => {
    if (wineId === undefined || wine) return;
    void utils.wine.getOne
      .fetch({ id: parseInt(wineId) })
      .then((wine) => setWine(wine));
  }, [wineId, wine, utils.wine.getOne]);

  const editWine = api.wine.edit.useMutation();
  const handleSaveWine = async () => {
    if (wine === null) return;

    await editWine.mutateAsync(wine);
    await router.push("/");
  };

  const [winerySelectorOpen, setWinerySelectorOpen] = useState(false);
  const [typeSelectorOpen, setTypeSelectorOpen] = useState(false);

  return (
    <>
      <Head>
        <title>Wine Demo App</title>
        <meta name="description" content="Zamaqo wine demo app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="mx-auto my-4 max-w-lg space-y-4 px-8">
        <h1 className="text-center text-3xl font-bold">Edit Wine</h1>
        <fieldset>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={wine?.name}
            onChange={(e) => wine && setWine({ ...wine, name: e.target.value })}
            disabled={!wine}
          />
        </fieldset>

        <fieldset>
          <Label htmlFor="winery">Winery</Label>
          <Popover
            open={winerySelectorOpen}
            onOpenChange={setWinerySelectorOpen}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={winerySelectorOpen}
                className="flex w-[200px] justify-between"
              >
                {wine?.wineryKey
                  ? wineries.find((winery) => winery.key === wine.wineryKey)
                      ?.name
                  : "Select winery..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder="Search winery..." />
                <CommandEmpty>No wineries found.</CommandEmpty>
                <CommandGroup className="max-h-60 overflow-y-auto">
                  {wineries.map((winery) => (
                    <CommandItem
                      key={winery.key}
                      value={winery.key}
                      onSelect={(currentValue: string) => {
                        setWine((prev) =>
                          prev
                            ? {
                                ...prev,
                                wineryKey:
                                  currentValue === prev.wineryKey
                                    ? ""
                                    : currentValue,
                              }
                            : null,
                        );
                        setWinerySelectorOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          wine?.wineryKey === winery.key
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                      {winery.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </fieldset>

        <fieldset>
          <Label htmlFor="year">Year</Label>
          <Input
            id="year"
            type="number"
            max={new Date().getFullYear()}
            min={1900}
            value={wine?.year}
            onChange={(e) =>
              wine && setWine({ ...wine, year: parseInt(e.target.value) })
            }
            disabled={!wine}
          />
        </fieldset>
        <fieldset>
          <Label htmlFor="type">Type</Label>
          <Popover open={typeSelectorOpen} onOpenChange={setTypeSelectorOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={typeSelectorOpen}
                className="flex w-[200px] justify-between"
              >
                {wine?.type
                  ? WINE_TYPES.find((type) => type === wine.type)
                  : "Select type..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandGroup className="max-h-60 overflow-y-auto">
                  {WINE_TYPES.map((type) => (
                    <CommandItem
                      key={type}
                      value={type}
                      onSelect={() => {
                        if (!wine) return;

                        setWine({
                          ...wine,
                          type,
                        });

                        setTypeSelectorOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          wine?.type === type ? "opacity-100" : "opacity-0",
                        )}
                      />
                      {type}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </fieldset>
        <fieldset>
          <Label htmlFor="varietal">Varietal</Label>
          <Input
            id="varietal"
            value={wine?.varietal}
            onChange={(e) =>
              wine && setWine({ ...wine, varietal: e.target.value })
            }
            disabled={!wine}
          />
        </fieldset>
        <fieldset>
          <Label htmlFor="rating">Rating</Label>
          <Input
            id="rating"
            type="number"
            step="0.1"
            max="5"
            value={wine?.rating}
            onChange={(e) =>
              wine && setWine({ ...wine, rating: parseFloat(e.target.value) })
            }
            disabled={!wine}
          />
        </fieldset>
        <fieldset className="flex items-center gap-4">
          <Checkbox
            id="consumed"
            checked={wine?.consumed}
            onCheckedChange={(checked) =>
              wine && setWine({ ...wine, consumed: checked as boolean })
            }
            disabled={!wine}
          />
          <Label htmlFor="consumed">Consumed</Label>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "ml-auto w-[240px] justify-start text-left font-normal",
                  !wine?.dateConsumed && "text-muted-foreground",
                )}
                disabled={!wine || !wine.consumed}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {wine?.dateConsumed ? (
                  format(wine?.dateConsumed, "PPP")
                ) : (
                  <span>Date Consumed</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={wine?.dateConsumed ?? undefined}
                onSelect={(date) =>
                  wine && setWine({ ...wine, dateConsumed: date ?? null })
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </fieldset>

        <fieldset>
          <Textarea
            value={wine?.note ?? ""}
            onChange={(e) => wine && setWine({ ...wine, note: e.target.value })}
          />
        </fieldset>

        <div className="flex justify-between">
          <Button>
            <Link href="/">Cancel</Link>
          </Button>
          <Button onClick={handleSaveWine}>Save</Button>
        </div>
      </main>
    </>
  );
}
