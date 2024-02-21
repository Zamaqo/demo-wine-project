import type { WineType } from "@prisma/client";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import * as Select from "~/components/ui/select";
import { cn } from "~/lib/utils";

import { api, type RouterInputs } from "~/utils/api";

import { Check, ChevronsUpDown } from "lucide-react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "~/components/ui/command";
import { wineries } from "~/lib/data";

const WINE_TYPES: WineType[] = [
  "RED",
  "WHITE",
  "ROSE",
  "RED_BLEND",
  "WHITE_BLEND",
];

type WineInput = RouterInputs["wine"]["create"];
const DEFAULT_WINE: WineInput = {
  name: "",
  year: 2023,
  type: "RED",
  varietal: "",
  rating: 0,
  consumed: false,
  dateConsumed: null,
  quantity: 1,
  wineryKey: "",
};

export default function CreateWine() {
  useSession({ required: true });
  const router = useRouter();

  const [wine, setWine] = useState<WineInput>(DEFAULT_WINE);
  const createWine = api.wine.create.useMutation();
  const handleSaveWine = async () => {
    if (wine === null) return;

    await createWine.mutateAsync(wine);
    await router.push("/");
  };

  const [winerySelectorOpen, setWinerySelectorOpen] = useState(false);

  return (
    <>
      <Head>
        <title>Wine Demo App</title>
        <meta name="description" content="Zamaqo wine demo app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="mx-auto my-4 max-w-lg space-y-4 px-8">
        <h1 className="text-center text-3xl font-bold">Create Wine</h1>
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
                {wine.wineryKey
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
                        setWine((prev) => ({
                          ...prev,
                          wineryKey:
                            currentValue === wine.wineryKey ? "" : currentValue,
                        }));
                        setWinerySelectorOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          wine.wineryKey === winery.key
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
            value={wine?.year}
            onChange={(e) =>
              wine && setWine({ ...wine, year: parseInt(e.target.value) })
            }
            disabled={!wine}
          />
        </fieldset>
        <fieldset>
          <Label htmlFor="type">Type</Label>
          <Select.Select
            onValueChange={(value) =>
              wine && setWine({ ...wine, type: value as WineType })
            }
          >
            <Select.SelectTrigger className="w-[180px]">
              <Select.SelectValue id="type" placeholder="Select a type" />
            </Select.SelectTrigger>
            <Select.SelectContent>
              <Select.SelectGroup>
                <Select.SelectLabel>Types</Select.SelectLabel>
                {WINE_TYPES.map((type) => (
                  <Select.SelectItem key={type} value={type}>
                    {type}
                  </Select.SelectItem>
                ))}
              </Select.SelectGroup>
            </Select.SelectContent>
          </Select.Select>
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
            value={wine?.rating}
            onChange={(e) =>
              wine && setWine({ ...wine, rating: parseFloat(e.target.value) })
            }
            disabled={!wine}
          />
        </fieldset>

        <fieldset>
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            value={wine?.quantity}
            onChange={(e) =>
              wine && setWine({ ...wine, quantity: parseFloat(e.target.value) })
            }
            disabled={!wine}
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
