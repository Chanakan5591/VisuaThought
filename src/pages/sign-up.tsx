import { SignUp } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";

const AuthSignUp: NextPage = () => {
  return (
    <>
      <Head>
        <title>VisuaThought</title>
        <meta name="description" content="A visualized note-taking and mind-mapping tool" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-full min-h-screen flex-col bg justify-center items-center">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <SignUp signInUrl='/sign-in' />
      </main>
    </>
  );
};

export default AuthSignUp;
