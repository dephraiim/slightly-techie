import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import {
  type GetServerSidePropsContext,
  type InferGetServerSidePropsType,
} from "next";
import { createTRPCContext } from "~/server/api/trpc";
import { appRouter } from "~/server/api/root";
import superjson from "superjson";
import { api as trpc } from "~/utils/api";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";

export async function getServerSideProps(
  context: GetServerSidePropsContext<{ id: string }>
) {
  const ssg = createProxySSGHelpers({
    router: appRouter,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    ctx: await createTRPCContext(context as any),
    transformer: superjson,
  });

  const id = context.params?.id as string;

  await ssg.posts.getPost.prefetch({ id });
  // Make sure to return { props: { trpcState: ssg.dehydrate() } }
  return {
    props: {
      trpcState: ssg.dehydrate(),
      id,
    },
  };
}
export default function EditPage(
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  const { id } = props;
  const postQuery = trpc.posts.getPost.useQuery({ id });
  const { data } = postQuery;
  const utils = trpc.useContext();

  const updatePost = trpc.posts.update.useMutation({
    async onSuccess() {
      await utils.posts.getPosts.invalidate();
    },
  });

  const router = useRouter();

  const [title, setTitle] = React.useState(data?.title);
  const [content, setContent] = React.useState(data?.content);

  if (!data) {
    return <div className="p-6">Loading...</div>;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const input = {
      id,
      title,
      content,
    };

    try {
      updatePost.mutate(input);

      await router.push("/");
    } catch (cause) {
      console.error({ cause }, "Failed to add post");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c] p-6 text-white">
      <h1 className="text-4xl">Edit post</h1>

      <form onSubmit={handleSubmit}>
        <label className="text-white" htmlFor="title">
          Title:
        </label>
        <br />
        <input
          id="title"
          name="title"
          type="text"
          value={title}
          className="text-black"
          onChange={(e) => setTitle(e.target.value)}
          disabled={updatePost.isLoading}
        />

        <br />
        <label className="text-white" htmlFor="text">
          Content:
        </label>
        <br />
        <textarea
          id="content"
          name="content"
          value={content}
          className="text-black"
          onChange={(e) => setContent(e.target.value)}
          disabled={updatePost.isLoading}
        />
        <br />
        <input
          className="my-2 mr-2 rounded-full bg-white/10 p-1 px-3 font-semibold text-white no-underline transition hover:bg-white/20"
          type="submit"
          value="Update"
          disabled={updatePost.isLoading}
        />
        {updatePost.error && (
          <p style={{ color: "red" }}>{updatePost.error.message}</p>
        )}
        <Link
          className="text-b my-2 mr-2 rounded-full bg-red-400 p-1 px-3 font-semibold no-underline transition hover:bg-white/20"
          href="/"
        >
          Cancel
        </Link>
      </form>
    </main>
  );
}
