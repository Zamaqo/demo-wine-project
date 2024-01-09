import type { WineType } from "@prisma/client";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
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
import * as Select from "~/components/ui/select";
import { cn } from "~/lib/utils";

import { api, type RouterInputs } from "~/utils/api";

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
                  "w-[240px] justify-start text-left font-normal",
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
