/* eslint-disable @next/next/no-img-element */
import { useSession } from "next-auth/react";
import Head from "next/head";
import { UserNav } from "~/components/UserNav";
import { Button } from "~/components/ui/button";
import * as Table from "~/components/ui/table";

import { api } from "~/utils/api";

import { useRouter } from "next/router";
import { format } from "date-fns";
import Link from "next/link";
import { useState } from "react";
import type { WineBottle } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogPortal,
  DialogTitle,
} from "~/components/ui/dialog";
import { Popover, PopoverTrigger } from "~/components/ui/popover";
import { cn } from "~/lib/utils";
import { CalendarIcon } from "lucide-react";
import { PopoverContent } from "@radix-ui/react-popover";
import { Calendar } from "~/components/ui/calendar";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { wineries } from "~/lib/data";

export default function Home() {
  const { data: session } = useSession({ required: true });
  const router = useRouter();

  const [showConsumed, setShowConsumed] = useState(true);

  const wineId = router.query.wineId as string;
  const { data: wine } = api.wine.getWine.useQuery(
    { id: wineId ? parseInt(wineId) : 0 },
    { enabled: !!wineId },
  );

  const wineBottles = wine?.wineBottles.filter(
    (w) => showConsumed || !w.consumed,
  );

  const utils = api.useUtils();
  const deleteWineBottle = api.wine.deleteWineBottle.useMutation();
  const handleDeleteWineBottle = async (id: number) => {
    utils.wine.getWine.setData(
      { id: wineId ? parseInt(wineId) : 0 },
      (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          wineBottles: prev.wineBottles.filter((b) => b.id !== id),
        };
      },
    );

    await deleteWineBottle.mutateAsync({ id });
  };

  const [addingWineBottle, setAddingWineBottle] = useState(false);
  const addWineBottle = api.wine.addBottle.useMutation();
  const handleAddWineBottle = async () => {
    setAddingWineBottle(true);
    await addWineBottle.mutateAsync({ id: wineId ? parseInt(wineId) : 0 });
    await utils.wine.getWine.invalidate({
      id: wineId ? parseInt(wineId) : 0,
    });
    setAddingWineBottle(false);
  };

  const [consumingWineBottle, setConsumingWineBottle] =
    useState<WineBottle | null>(null);

  const editBottle = api.wine.editWineBottle.useMutation();
  const handleConsumeWineBottle = async () => {
    if (!consumingWineBottle) return;

    utils.wine.getWine.setData(
      { id: wineId ? parseInt(wineId) : 0 },
      (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          wineBottles: prev.wineBottles.map((wine) => {
            if (wine.id === consumingWineBottle.id) {
              return consumingWineBottle;
            }
            return wine;
          }),
        };
      },
    );

    void editBottle.mutateAsync({ ...consumingWineBottle });
    setConsumingWineBottle(null);
  };

  return (
    <>
      <Head>
        <title>Wine Demo App</title>
        <meta name="description" content="Zamaqo wine demo app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="mx-auto my-4 max-w-6xl space-y-4 px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline">
              <Link href="/">Go Back</Link>
            </Button>
            <Button
              onClick={() => void handleAddWineBottle()}
              disabled={addingWineBottle}
            >
              Add Bottle
            </Button>
          </div>
          <UserNav session={session} />
        </div>

        <hr />

        <div className="flex gap-4">
          {wine?.imageUrl ? (
            <img
              src={wine.imageUrl}
              alt={wine.name}
              className="col-span-1 h-40"
            />
          ) : (
            <div className="h-40 w-40 bg-gray-200" />
          )}
          <div>
            <h1 className="text-3xl font-bold">{wine?.name}</h1>
            <p className="text-lg font-light">
              {wine?.year} {wine?.type} •{" "}
              {wine?.wineryKey
                ? wineries.find((winery) => winery.key === wine?.wineryKey)
                    ?.name ?? ""
                : ""}
            </p>
            <p className="text-lg font-light">{wine?.rating} Rating</p>
            <p className="text-sm font-light">{wine?.note}</p>
          </div>

          <div className="flex w-full justify-end">
            <Button
              onClick={() => router.push(`/${wine?.id}/edit`)}
              variant="outline"
            >
              Edit
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4">
          <Button
            onClick={() => setShowConsumed(!showConsumed)}
            variant="outline"
          >
            {showConsumed ? "Hide Consumed" : "Show Consumed"}
          </Button>
        </div>

        <Table.Table>
          <Table.TableCaption>A list of your wines</Table.TableCaption>
          <Table.TableHeader>
            <Table.TableRow>
              <Table.TableHead>ID</Table.TableHead>
              <Table.TableHead>Date Created</Table.TableHead>
              <Table.TableHead>Consumed</Table.TableHead>
              <Table.TableHead>Date Consumed</Table.TableHead>
              <Table.TableHead>Note</Table.TableHead>
              <Table.TableHead>Actions</Table.TableHead>
            </Table.TableRow>
          </Table.TableHeader>
          <Table.TableBody>
            {wineBottles?.map((bottle, index) => (
              <Table.TableRow key={bottle.counter + index}>
                <Table.TableCell>{bottle.counter}</Table.TableCell>
                <Table.TableCell>
                  {format(bottle.createdAt, "PPP")}
                </Table.TableCell>
                <Table.TableCell>
                  {bottle.consumed ? "Yes" : "No"}
                </Table.TableCell>
                <Table.TableCell>
                  {bottle.dateConsumed
                    ? format(bottle.dateConsumed, "PPP")
                    : "N/A"}
                </Table.TableCell>
                <Table.TableCell>{bottle.note}</Table.TableCell>
                <Table.TableCell className="flex gap-2">
                  <Button
                    onClick={() =>
                      setConsumingWineBottle({
                        ...bottle,
                        consumed: true,
                        dateConsumed: new Date(),
                        note: "",
                      })
                    }
                    variant="outline"
                    disabled={bottle.consumed}
                  >
                    Consume
                  </Button>
                  <Button
                    onClick={() => handleDeleteWineBottle(bottle.id)}
                    variant="outline"
                  >
                    Delete
                  </Button>
                </Table.TableCell>
              </Table.TableRow>
            ))}
          </Table.TableBody>
        </Table.Table>
      </main>
      <Dialog
        open={!!consumingWineBottle}
        onOpenChange={(open) => !open && setConsumingWineBottle(null)}
      >
        <DialogPortal>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Consume Bottle</DialogTitle>
            </DialogHeader>

            <fieldset>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "ml-auto w-[240px] justify-start text-left font-normal",
                      !consumingWineBottle?.dateConsumed &&
                        "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {consumingWineBottle?.dateConsumed ? (
                      format(consumingWineBottle?.dateConsumed, "PPP")
                    ) : (
                      <span>Date Consumed</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto rounded-lg border bg-background p-0"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={consumingWineBottle?.dateConsumed ?? undefined}
                    onSelect={(date) =>
                      consumingWineBottle &&
                      setConsumingWineBottle({
                        ...consumingWineBottle,
                        dateConsumed: date ?? null,
                      })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </fieldset>

            <fieldset>
              <Label htmlFor="note">Note</Label>
              <Textarea
                id="note"
                name="note"
                value={consumingWineBottle?.note ?? ""}
                onChange={(e) =>
                  consumingWineBottle &&
                  setConsumingWineBottle({
                    ...consumingWineBottle,
                    note: e.target.value,
                  })
                }
              />
            </fieldset>

            <DialogFooter>
              <Button onClick={handleConsumeWineBottle}>Consume</Button>
            </DialogFooter>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </>
  );
}
