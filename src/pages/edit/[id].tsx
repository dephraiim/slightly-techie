import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import {
  type GetServerSidePropsContext,
  type InferGetServerSidePropsType,
} from "next";
import { createTRPCContext } from "~/server/api/trpc";
import { appRouter } from "~/server/api/root";
import superjson from "superjson";
import { api as trpc } from "~/utils/api";

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

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <h1>{data.title}</h1>
      <em>Created {data.createdAt.toLocaleDateString()}</em>
      <p>{data.content}</p>
      <h2>Raw data:</h2>
      <pre>{JSON.stringify(data, null, 4)}</pre>
    </>
  );
}
