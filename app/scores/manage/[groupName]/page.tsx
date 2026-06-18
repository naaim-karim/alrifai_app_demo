import Footer from "@/app/components/Footer";
import GroupScores from "@/app/components/GroupScores";
import Navbar from "@/app/components/Navbar";

const ManageGroupScoresPage = async ({
  params,
}: {
  params: Promise<{ groupName: string }>;
}) => {
  const { groupName } = await params;
  const groupNameFromURL = decodeURIComponent(groupName);

  return (
    <>
      <Navbar />
      <GroupScores groupName={groupNameFromURL} />
      <Footer />
    </>
  );
};

export default ManageGroupScoresPage;
