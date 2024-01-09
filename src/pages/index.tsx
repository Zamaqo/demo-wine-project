import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import * as Table from "~/components/ui/table";

import { api } from "~/utils/api";

export default function Home() {
  useSession({ required: true });
  const { data: wines } = api.wine.getAll.useQuery();

  return (
    <>
      <Head>
        <title>Wine Demo App</title>
        <meta name="description" content="Zamaqo wine demo app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="mx-auto my-4 max-w-6xl space-y-4 px-8">
        <Button>
          <Link href="/create">Create</Link>
        </Button>
        <Table.Table>
          <Table.TableCaption>A list of your wines</Table.TableCaption>
          <Table.TableHeader>
            <Table.TableRow>
              <Table.TableHead>ID</Table.TableHead>
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
                <Table.TableCell>
                  <Button variant="outline">
                    <Link href={`/${wine.id}/edit`}>Edit</Link>
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
