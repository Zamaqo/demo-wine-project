import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const wineRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const wines = await ctx.db.wine.findMany({
      where: { createdById: ctx.session.user.id },
    });
    return wines;
  }),

  getOne: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const wine = await ctx.db.wine.findUnique({
        where: { id: input.id },
      });
      return wine;
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        type: z.enum(["RED", "WHITE", "ROSE", "WHITE_BLEND", "RED_BLEND"]),
        year: z.number(),
        varietal: z.string(),
        rating: z.number(),
        consumed: z.boolean(),
        dateConsumed: z.date().nullish(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const lastWine = await ctx.db.wine.findFirst({
        where: { createdById: ctx.session.user.id },
        orderBy: { id: "desc" },
        select: { counter: true },
      });

      const wine = await ctx.db.wine.create({
        data: {
          ...input,
          counter: lastWine ? lastWine.counter + 1 : 1,
          createdBy: { connect: { id: ctx.session.user.id } },
        },
      });
      return wine;
    }),

  edit: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string(),
        type: z.enum(["RED", "WHITE", "ROSE", "WHITE_BLEND", "RED_BLEND"]),
        year: z.number(),
        varietal: z.string(),
        rating: z.number(),
        consumed: z.boolean(),
        dateConsumed: z.date().nullish(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const wine = await ctx.db.wine.update({
        where: { id: input.id },
        data: {
          ...input,
          dateConsumed: input.consumed ? input.dateConsumed : null,
        },
      });
      return wine;
    }),
});
