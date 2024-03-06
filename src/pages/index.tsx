import { useSession } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { UserNav } from "~/components/UserNav";
import { Button } from "~/components/ui/button";
import * as Table from "~/components/ui/table";

import { api } from "~/utils/api";

import { wineries } from "~/lib/data";
import { useRouter } from "next/router";

export default function Home() {
  const { data: session } = useSession({ required: true });

  const utils = api.useUtils();
  const { data: wines } = api.wine.getWines.useQuery();

  const deleteWine = api.wine.deleteWine.useMutation();
  const handleDeleteWine = async (id: number) => {
    utils.wine.getWines.setData(undefined, (prev) => {
      if (!prev) return prev;
      return prev.filter((wine) => wine.id !== id);
    });

    await deleteWine.mutateAsync({ id });
  };

  const router = useRouter();

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
          </div>
          <UserNav session={session} />
        </div>

        <Table.Table>
          <Table.TableCaption>A list of your wines</Table.TableCaption>
          <Table.TableHeader>
            <Table.TableRow>
              <Table.TableHead>Image</Table.TableHead>
              <Table.TableHead>Name</Table.TableHead>
              <Table.TableHead>Quantity</Table.TableHead>
              <Table.TableHead>Year</Table.TableHead>
              <Table.TableHead>Winery</Table.TableHead>
              <Table.TableHead>Actions</Table.TableHead>
            </Table.TableRow>
          </Table.TableHeader>
          <Table.TableBody>
            {wines?.map((wine, index) => (
              <Table.TableRow
                key={wine.name + index}
                onClick={() => {
                  void router.push(`/${wine.id}`);
                }}
                className="cursor-pointer"
              >
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
                <Table.TableCell>{wine._count.wineBottles}</Table.TableCell>
                <Table.TableCell>{wine.year}</Table.TableCell>
                <Table.TableCell>
                  {
                    wineries.find((winery) => winery.key === wine.wineryKey)
                      ?.name
                  }
                </Table.TableCell>
                <Table.TableCell className="flex gap-2">
                  <Button
                    onClick={() => router.push(`/${wine.id}/edit`)}
                    variant="outline"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDeleteWine(wine.id)}
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
    </>
  );
}
