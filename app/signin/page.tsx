"use client";

import Navbar from "@/app/components/Navbar";
import SignInForm from "@/app/components/SignInForm";
import Footer from "@/app/components/Footer";
import { Suspense } from "react";
import Loading from "../components/Loading";

const SignIn = () => {
  return (
    <>
      <Navbar />
      <Suspense fallback={<Loading />}>
        <SignInForm />
      </Suspense>
      <Footer />
    </>
  );
};

export default SignIn;
