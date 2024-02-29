import type { Wine } from "@prisma/client";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { UserNav } from "~/components/UserNav";
import { Button } from "~/components/ui/button";
import * as Table from "~/components/ui/table";
import { cn } from "~/lib/utils";

import { api } from "~/utils/api";

import { wineries } from "~/lib/data";

export default function Home() {
  const { data: session } = useSession({ required: true });

  const utils = api.useUtils();
  const { data: wines } = api.wine.getAll.useQuery();

  const deleteWine = api.wine.delete.useMutation();
  const handleDeleteWine = async (id: number) => {
    utils.wine.getAll.setData(undefined, (prev) => {
      if (!prev) return prev;
      return prev.filter((wine) => wine.id !== id);
    });

    await deleteWine.mutateAsync({ id });
  };

  const [aggregate, setAggregate] = useState(true);
  const aggregatedWines = useMemo(() => {
    return (
      wines?.reduce(
        (acc, wine) => {
          const existing = acc.find(
            (w) =>
              w.year === wine.year &&
              w.name === wine.name &&
              w.wineryKey === wine.wineryKey,
          );
          if (existing)
            return acc.map((w) =>
              w === existing ? { ...w, count: w.count + 1 } : w,
            );
          return [...acc, { ...wine, count: 1 }];
        },
        [] as Array<
          Pick<Wine, "name" | "year" | "wineryKey" | "imageUrl"> & {
            count: number;
          }
        >,
      ) ?? []
    );
  }, [wines]);

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
            <Button>
              <Link href="/create">Create</Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => setAggregate(!aggregate)}
              className={cn(aggregate && "bg-muted")}
            >
              Aggregate
            </Button>
          </div>
          <UserNav session={session} />
        </div>
        {!aggregate ? (
          <Table.Table>
            <Table.TableCaption>A list of your wines</Table.TableCaption>
            <Table.TableHeader>
              <Table.TableRow>
                <Table.TableHead>ID</Table.TableHead>
                <Table.TableHead>Image</Table.TableHead>
                <Table.TableHead>Name</Table.TableHead>
                <Table.TableHead>Year</Table.TableHead>
                <Table.TableHead>Type</Table.TableHead>
                <Table.TableHead>Rating</Table.TableHead>
                <Table.TableHead>Consumed</Table.TableHead>
                <Table.TableHead>Date Consumed</Table.TableHead>
                <Table.TableHead>Actions</Table.TableHead>
              </Table.TableRow>
            </Table.TableHeader>
            <Table.TableBody>
              {wines?.map((wine) => (
                <Table.TableRow key={wine.id}>
                  <Table.TableCell>{wine.counter}</Table.TableCell>
                  <Table.TableCell>
                    {wine.imageUrl ? (
                      <Image
                        src={wine.imageUrl}
                        width={50}
                        height={50}
                        alt={wine.name}
                        className="h-[50px] w-[50px] rounded-md object-contain"
                      />
                    ) : (
                      "N/A"
                    )}
                  </Table.TableCell>
                  <Table.TableCell>{wine.name}</Table.TableCell>
                  <Table.TableCell>{wine.year}</Table.TableCell>
                  <Table.TableCell>{wine.type}</Table.TableCell>
                  <Table.TableCell>{wine.rating}</Table.TableCell>
                  <Table.TableCell>
                    {wine.consumed ? "Yes" : "No"}
                  </Table.TableCell>
                  <Table.TableCell>
                    {wine.dateConsumed?.toDateString() ?? "N/A"}
                  </Table.TableCell>
                  <Table.TableCell className="space-x-4">
                    <Button variant="outline">
                      <Link href={`/${wine.id}/edit`}>Edit</Link>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleDeleteWine(wine.id)}
                    >
                      Delete
                    </Button>
                  </Table.TableCell>
                </Table.TableRow>
              ))}
            </Table.TableBody>
          </Table.Table>
        ) : (
          <Table.Table>
            <Table.TableCaption>
              A aggregated list of your wines
            </Table.TableCaption>
            <Table.TableHeader>
              <Table.TableRow>
                <Table.TableHead>Image</Table.TableHead>
                <Table.TableHead>Name</Table.TableHead>
                <Table.TableHead>Year</Table.TableHead>
                <Table.TableHead>Winery</Table.TableHead>
              </Table.TableRow>
            </Table.TableHeader>
            <Table.TableBody>
              {aggregatedWines?.map((wine, index) => (
                <Table.TableRow key={wine.name + index}>
                  <Table.TableCell>
                    {wine.imageUrl ? (
                      <Image
                        src={wine.imageUrl}
                        width={50}
                        height={50}
                        alt={wine.name}
                        className="h-[50px] w-[50px] rounded-md object-contain"
                      />
                    ) : (
                      "N/A"
                    )}
                  </Table.TableCell>
                  <Table.TableCell>{wine.name}</Table.TableCell>
                  <Table.TableCell>{wine.year}</Table.TableCell>
                  <Table.TableCell>
                    {
                      wineries.find((winery) => winery.key === wine.wineryKey)
                        ?.name
                    }
                  </Table.TableCell>
                </Table.TableRow>
              ))}
            </Table.TableBody>
          </Table.Table>
        )}
      </main>
    </>
  );
}
