import type { UserProfileProps } from "@/types";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import UserProfile from "@/app/components/UserProfile";

const UserProfilePage = async ({ params }: UserProfileProps) => {
  const { username } = await params;

  return (
    <>
      <Navbar />
      <UserProfile username={username} />
      <Footer />
    </>
  );
};

export default UserProfilePage;
