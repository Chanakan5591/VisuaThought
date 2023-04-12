import { clerkClient } from "@clerk/nextjs/server";
import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";

import { z } from 'zod'

const Note = z.object({
  id: z.string(),
  content: z.string(),
  positionX: z.number(),
  positionY: z.number()
})

export const notesRouter = createTRPCRouter({
  getNotes: privateProcedure
    .query(({ ctx }) => {
      const userId = ctx.userId
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
  updateUserInitialized: privateProcedure
    .input(z.object({ initialized: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      await clerkClient.users.updateUser(ctx.userId, { publicMetadata: {
        userInitialized: input.initialized
      }})
    }),
  storeNote: privateProcedure
    .input(z.object({ notes: Note }))
    .mutation(async ({ ctx, input }) => {
      const note = await ctx.prisma.notes.upsert({
        where: {
          id: input.notes.id
        },
        update: {
          id: input.notes.id,
          content: input.notes.content,
          positionX: input.notes.positionX,
          positionY: input.notes.positionY
        },
        create: {
          id: input.notes.id,
          content: input.notes.content,
          positionX: input.notes.positionX,
          positionY: input.notes.positionY,
          authorId: ctx.userId
        }
      })
      return note
    })
});
