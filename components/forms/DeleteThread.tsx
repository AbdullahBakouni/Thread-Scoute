"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

import { deleteThread } from "@/lib/actions/thread.action";

interface Props {
  threadId: string;
  currentUserId: string;
  authorId: string;
  parentId: string | null;
}

function DeleteThread({
  threadId,
  currentUserId,
  authorId,
  parentId,
}: Props) {
  const pathname = usePathname();
  const router = useRouter();

  if (currentUserId !== authorId || pathname === "/") return null;

  return (
    <>
    <Image
      src='/assets/delete.svg'
      alt='delte'
      width={18}
      height={18}
      className='cursor-pointer object-contai'
      onClick={async () => {
        await deleteThread(JSON.parse(threadId), pathname);
        // if (!parentId ) {
        //   router.push("/");
        // }
      }}
    />
    </>
  );
}

export default DeleteThread;