import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const postsRouter = createTRPCRouter({
  getPosts: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.posts.findMany({
      where: {
        author: { id: ctx.session?.user.id },
      },
      include: {
        author: true,
      },
    });
  }),

  getPost: publicProcedure
    .input(
      z.object({
        id: z.string().uuid().optional(),
      })
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.posts.findUnique({
        where: {
          id: input.id,
        },
        include: {
          author: {
            select: { name: true, id: true, image: true },
          },
        },
      });
    }),

  createPost: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        content: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.prisma.posts.create({
        data: {
          title: input.title,
          content: input.content,
          author: { connect: { email: ctx.session.user.email as string } },
        },
      });

      const user = await ctx.prisma.user.findUnique({
        where: {
          id: result.authorId,
        },
      });

      return {
        ...result,
        author: user,
      };
    }),
});
