import { clerkClient } from "@clerk/nextjs/server";
import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";

import { z } from 'zod'

const Note = z.object({
  id: z.string(),
  content: z.string(),
  positionX: z.number(),
  positionY: z.number()
})

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { TRPCError } from "@trpc/server";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: true
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
      const { success } = await ratelimit.limit(ctx.userId)

      if(!success) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS" })
      }
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
    }),
    deleteNote: privateProcedure
      .input(z.object({ noteId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const { success } = await ratelimit.limit(ctx.userId)

        if(!success) {
          throw new TRPCError({ code: 'TOO_MANY_REQUESTS' })
        }
        const deletion = await ctx.prisma.notes.delete({
          where: {
            id: input.noteId
          }
        })

        return deletion
      })
});
