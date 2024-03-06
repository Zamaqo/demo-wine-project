import { useSession } from "next-auth/react";
import Head from "next/head";
import { UserNav } from "~/components/UserNav";
import { Button } from "~/components/ui/button";
import * as Table from "~/components/ui/table";

import { api } from "~/utils/api";

import { useRouter } from "next/router";
import { format } from "date-fns";
import Link from "next/link";

export default function Home() {
  const { data: session } = useSession({ required: true });
  const router = useRouter();

  const wineId = router.query.wineId as string;
  const { data: wineBottles } = api.wine.getWineBottles.useQuery(
    { id: wineId ? parseInt(wineId) : 0 },
    { enabled: !!wineId },
  );

  const utils = api.useUtils();
  const deleteWineBottle = api.wine.deleteWineBottle.useMutation();
  const handleDeleteWineBottle = async (id: number) => {
    utils.wine.getWineBottles.setData(
      { id: wineId ? parseInt(wineId) : 0 },
      (prev) => {
        if (!prev) return prev;
        return prev.filter((wine) => wine.id !== id);
      },
    );

    await deleteWineBottle.mutateAsync({ id });
  };

  const addWineBottle = api.wine.addBottle.useMutation();
  const handleAddWineBottle = async () => {
    utils.wine.getWineBottles.setData(
      { id: wineId ? parseInt(wineId) : 0 },
      (prev) => {
        if (!prev) return prev;

        const newEntry = {
          id:
            prev.reduce((acc, curr) => (acc > curr.id ? acc : curr.id), 0) + 1,
          counter:
            prev.reduce(
              (acc, curr) => (acc > curr.counter ? acc : curr.counter),
              0,
            ) + 1,
          consumed: false,
          dateConsumed: null,
          note: "",
          wineId: wineId ? parseInt(wineId) : 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        return [...prev, newEntry];
      },
    );

    await addWineBottle.mutateAsync({ id: wineId ? parseInt(wineId) : 0 });
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
            <Button onClick={() => void handleAddWineBottle()}>
              Add Bottle
            </Button>
          </div>
          <UserNav session={session} />
        </div>

        <Table.Table>
          <Table.TableCaption>A list of your wines</Table.TableCaption>
          <Table.TableHeader>
            <Table.TableRow>
              <Table.TableHead>ID</Table.TableHead>
              <Table.TableHead>Consumed</Table.TableHead>
              <Table.TableHead>Date Consumed</Table.TableHead>
              <Table.TableHead>Actions</Table.TableHead>
            </Table.TableRow>
          </Table.TableHeader>
          <Table.TableBody>
            {wineBottles?.map((bottle, index) => (
              <Table.TableRow key={bottle.counter + index}>
                <Table.TableCell>{bottle.counter}</Table.TableCell>
                <Table.TableCell>
                  {bottle.consumed ? "Yes" : "No"}
                </Table.TableCell>
                <Table.TableCell>
                  {bottle.dateConsumed
                    ? format(bottle.dateConsumed, "PPP")
                    : "N/A"}
                </Table.TableCell>
                <Table.TableCell className="flex gap-2">
                  <Button
                    onClick={() => router.push(`/${wineId}/${bottle.id}/edit`)}
                    variant="outline"
                  >
                    Edit
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
    </>
  );
}
