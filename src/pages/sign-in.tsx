import { SignIn } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";

const AuthSignIn: NextPage = () => {
  return (
    <>
      <Head>
        <title>VisuaThought</title>
        <meta name="description" content="A visualized note-taking and mind-mapping tool" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-full min-h-screen flex-col bg overflow-auto justify-center items-center">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <SignIn signUpUrl='/sign-up' />
      </main>
    </>
  );
};

export default AuthSignIn;
