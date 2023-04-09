import { z } from "zod";

import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";

const Note = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  positionX: z.number(),
  positionY: z.number(),
  authorId: z.string()
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
      const note = await ctx.prisma.notes.upsert({
        where: {
          id: input.id
        },
        update: {
          id: input.id,
          title: input.notes.title,
          content: input.notes.content,
          positionX: input.notes.positionX,
          positionY: input.notes.positionY
        },
        create: {
          id: input.id,
          title: input.notes.title,
          content: input.notes.content,
          positionX: input.notes.positionX,
          positionY: input.notes.positionY,
          authorId: input.notes.authorId
        }
      })
      return note
    })
});
