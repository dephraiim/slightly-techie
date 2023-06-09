import { type NextPage } from "next";
import Head from "next/head";
import { signIn, signOut, useSession } from "next-auth/react";
import { api } from "~/utils/api";
import React from "react";
import { useRouter } from "next/router";

const Home: NextPage = () => {
  const { data: sessionData } = useSession();

  const router = useRouter();

  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");

  const utils = api.useContext();
  const posts = api.posts.getPosts.useQuery();

  const addPost = api.posts.createPost.useMutation({
    async onSuccess() {
      await utils.posts.getPosts.invalidate();
    },
  });

  const deletePost = api.posts.delete.useMutation({
    async onSuccess() {
      await utils.posts.getPosts.invalidate();
    },
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const input = {
      title,
      content,
    };

    try {
      await addPost.mutateAsync(input);

      setTitle("");
      setContent("");
    } catch (cause) {
      console.error({ cause }, "Failed to add post");
    }
  };

  return (
    <>
      <Head>
        <title>Slightly Techie</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="p-8">
          <h1 className="my-4 text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            Slightly Techie
          </h1>
          <div className="my-4">
            <AuthShowcase />
          </div>

          {sessionData ? (
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
                onChange={(e) => setTitle(e.target.value)}
                disabled={addPost.isLoading}
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
                onChange={(e) => setContent(e.target.value)}
                disabled={addPost.isLoading}
              />
              <br />
              <input
                className="my-2 rounded-full bg-white/10 p-2 px-4 font-semibold text-white no-underline transition hover:bg-white/20"
                type="submit"
                disabled={addPost.isLoading}
              />
              {addPost.error && (
                <p style={{ color: "red" }}>{addPost.error.message}</p>
              )}
            </form>
          ) : (
            <p className="text-2xl text-white">Please sign in to add a post</p>
          )}

          <div className="my-4">
            <h1 className="text-4xl text-white">Posts</h1>
            <pre className="text-2xl text-white">
              {posts.data
                ? posts.data.map((post) => (
                    <div
                      key={post.id}
                      className="my-4 border-2 border-solid p-4"
                    >
                      <h2 className="mb-3 text-3xl font-bold">{post.title}</h2>
                      <p className="text-base italic">{post.content}</p>
                      <div className="flex items-center justify-between">
                        <p className="mt-6 text-base font-semibold">
                          By: {post.author.name}
                        </p>

                        {post.author.id === sessionData?.user?.id && (
                          <div className="mt-4 flex gap-2">
                            <p
                              className="cursor-pointer text-sm underline"
                              onClick={() => {
                                void router.push(`/edit/${post.id}`);
                              }}
                            >
                              Edit
                            </p>
                            <p
                              className="cursor-pointer text-sm underline"
                              onClick={async () => {
                                await deletePost.mutateAsync({ id: post.id });
                              }}
                            >
                              Delete
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                : "Loading tRPC query..."}
            </pre>
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;

const AuthShowcase: React.FC = () => {
  const { data: sessionData } = useSession();

  return (
    <div className="my-4">
      <p className="text-2xl text-white">
        {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
      </p>
      <button
        className="my-4 rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
};
