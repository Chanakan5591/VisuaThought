import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const notesRouter = createTRPCRouter({
  getNotes: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(({ ctx, input }) => {
      const userId = input.userId
      const notes = ctx.prisma.notes.findMany(
        {
          where: {
            authorId: userId
          }
        }
      )

      return notes
    }),
  getDefaultNotes: publicProcedure
    .query(({ ctx }) => {
      const defNotes = ctx.prisma.notes.findMany({
        where: {
          authorId: '0'
        }
      })

      return defNotes
    })
});
