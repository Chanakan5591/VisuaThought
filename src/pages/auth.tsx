import { SignIn } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";

const Auth: NextPage = () => {
  return (
    <>
      <Head>
        <title>VisuaThought</title>
        <meta name="description" content="A visualized note-taking and mind-mapping tool" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <SignIn />
      </main>
    </>
  );
};

export default Auth;
