import { z } from "zod";

import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";

const Note = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  positionX: z.number().optional(),
  positionY: z.number().optional(),
  authorId: z.string().optional()
})

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
    }),

  storeNote: privateProcedure
    .input(z.object({ id: z.string(), notes: Note }))
    .mutation(async ({ ctx, input }) => {
      const note = await ctx.prisma.notes.update({
        where: {
          id: input.id
        },
        data: {
          title: input.notes.title,
          content: input.notes.content,
          positionX: input.notes.positionX,
          positionY: input.notes.positionY
        }
      })
      return note
    })
});
