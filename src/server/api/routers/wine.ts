import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const wineRouter = createTRPCRouter({
  getWines: protectedProcedure.query(async ({ ctx }) => {
    const wines = await ctx.db.wine.findMany({
      where: { createdById: ctx.session.user.id },
      include: { _count: { select: { wineBottles: true } } },
    });
    return wines;
  }),

  getWineBottles: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const bottles = await ctx.db.wineBottle.findMany({
        where: { wine: { id: input.id, createdById: ctx.session.user.id } },
        orderBy: { counter: "asc" },
      });
      return bottles;
    }),

  getWine: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const wine = await ctx.db.wine.findUnique({
        where: { id: input.id },
      });
      return wine;
    }),

  getBottle: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const bottle = await ctx.db.wineBottle.findUnique({
        where: { id: input.id },
      });
      return bottle;
    }),

  createWine: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        imageUrl: z.string().nullish(),
        type: z.enum(["RED", "WHITE", "ROSE", "WHITE_BLEND", "RED_BLEND"]),
        year: z.number(),
        varietal: z.string(),
        rating: z.number(),
        quantity: z.number(),
        note: z.string(),
        wineryKey: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const lastWine = await ctx.db.wineBottle.findFirst({
        where: { wine: { createdById: ctx.session.user.id } },
        orderBy: { id: "desc" },
        select: { counter: true },
      });

      const { quantity, ...rest } = input;
      const data = Array.from({ length: quantity }).map((_, idx) => ({
        consumed: false,
        counter: lastWine ? lastWine.counter + 1 + idx : 1 + idx,
        note: "",
      }));

      const wine = await ctx.db.wine.create({
        data: {
          ...rest,
          createdBy: { connect: { id: ctx.session.user.id } },
          wineBottles: {
            createMany: {
              data,
            },
          },
        },
      });
      return wine;
    }),

  editWine: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string(),
        imageUrl: z.string().nullish(),
        type: z.enum(["RED", "WHITE", "ROSE", "WHITE_BLEND", "RED_BLEND"]),
        year: z.number(),
        varietal: z.string(),
        rating: z.number(),
        wineryKey: z.string().min(1),
        note: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const wine = await ctx.db.wine.update({
        where: { id: input.id },
        data: {
          ...input,
          imageUrl: input.imageUrl,
        },
      });
      return wine;
    }),

  deleteWine: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const wine = await ctx.db.wine.delete({
        where: { id: input.id },
      });
      return wine;
    }),

  editWineBottle: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        dateConsumed: z.date().nullish(),
        note: z.string().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const wineBottle = await ctx.db.wineBottle.update({
        where: { id: input.id },
        data: {
          consumed: input.dateConsumed !== null,
          dateConsumed: input.dateConsumed,
          note: input.note ?? "",
        },
      });
      return wineBottle;
    }),

  deleteWineBottle: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const wineBottle = await ctx.db.wineBottle.delete({
        where: { id: input.id },
      });
      return wineBottle;
    }),

  addBottle: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const lastWine = await ctx.db.wineBottle.findFirst({
        where: { wine: { createdById: ctx.session.user.id } },
        orderBy: { id: "desc" },
        select: { counter: true },
      });

      const data = Array.from({ length: 1 }).map((_, idx) => ({
        consumed: false,
        counter: lastWine ? lastWine.counter + 1 + idx : 1 + idx,
        note: "",
      }));

      const wine = await ctx.db.wine.update({
        where: { id: input.id },
        data: {
          wineBottles: {
            createMany: {
              data,
            },
          },
        },
      });
      return wine;
    }),
});
