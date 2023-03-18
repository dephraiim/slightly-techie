import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

import { api } from "~/utils/api";
import React from "react";

const Home: NextPage = () => {
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");

  const hello = api.example.hello.useQuery({ text: "from tRPC" });
  const posts = api.posts.getPosts.useQuery();

  // const addPost = api.posts.createPost.useMutation();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const newPost = {
      title,
      content,
    };

    console.log(newPost);
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
            <p className="text-2xl text-white">
              {hello.data ? hello.data.greeting : "Loading tRPC query..."}
            </p>
            <AuthShowcase />
          </div>

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
              // disabled={addPost.isLoading}
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
              // disabled={addPost.isLoading}
            />
            <br />
            <input
              className="my-2 rounded-full bg-white/10 p-2 px-4 font-semibold text-white no-underline transition hover:bg-white/20"
              type="submit"
              //  disabled={addPost.isLoading}
            />
            {/* {addPost.error && (
              <p style={{ color: "red" }}>{addPost.error.message}</p>
            )} */}
          </form>

          <div className="my-4">
            <pre className="text-2xl text-white">
              {posts.data
                ? JSON.stringify(posts.data, null, 2)
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

  const { data: secretMessage } = api.example.getSecretMessage.useQuery(
    undefined, // no input
    { enabled: sessionData?.user !== undefined }
  );

  return (
    <div className="my-4">
      <p className="text-2xl text-white">
        {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
        {secretMessage && <span> - {secretMessage}</span>}
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
