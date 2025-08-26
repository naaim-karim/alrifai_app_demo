import Footer from "@/app/components/Footer";
import Group from "@/app/components/Group";
import Navbar from "@/app/components/Navbar";

const GroupPage = async ({
  params,
}: {
  params: Promise<{ groupName: string }>;
}) => {
  const { groupName } = await params;
  const groupNameFromURL = decodeURIComponent(groupName);

  return (
    <>
      <Navbar />
      <Group groupName={groupNameFromURL} />
      <Footer />
    </>
  );
};

export default GroupPage;
