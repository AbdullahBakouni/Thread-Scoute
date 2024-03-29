import Image from "next/image";
import Link from "next/link";

interface props {
    id: string;
    currentuserId: string;
    parentId: string | null;
    content: string;
    author: {
      name: string;
      image: string;
      id: string;
    };
    community: {
      id: string;
      name: string;
      image: string;
    } | null;
    createdAt: string;
    comments: {
      author: {
        image: string;
      };
    }[];
    iscomment?: boolean;
  }

    const ThreadCard = ({
        id,
        currentuserId,
        parentId,
        content,
        author,
        community,
        createdAt,
        comments,
        iscomment
    }:props) => {  

    return (
      <article className={`flex flex-col w-full  rounded-xl  ${iscomment ? 
            "px-0 xs:px-7" : "bg-dark-2 p-7"}`}>
        <div className="flex items-start justify-between">
            <div className="flex flex-1 w-full flex-row gap-4">
                <div className="flex flex-col items-center">
                    <Link href={`/profile/${author.id}`} className="relative h-11 w-11">
                        <Image 
                        src={author.image}
                        alt="profile photo"
                        fill
                        className="cursor-pointer rounded-full"
                        />
                    </Link>
                    <div className="thread-card_bar" />
                </div>

                <div className={`${iscomment && "mb-10"} flex w-full flex-col`}>
                <Link href={`/profile/${author.id}`} className="w-fit ">
                    <h4 className="text-light-1 text-base-semibold cursor-pointer">{author.name}</h4>
                </Link>
                <p className="mt-2 text-small-regular text-light-2">{content}</p>

                <div className="flex flex-col mt-5 gap-3">
                    <div className="flex gap-3.5">
                        <Image 
                        src="/assets/heart-gray.svg"
                        alt="heart"
                        width={24}
                        height={24}
                        className="cursor-pointer object-contain"
                        />
                        <Link href={`/thread/${id}`}>
                        <Image 
                        src="/assets/reply.svg"
                        alt="reply"
                        width={24}
                        height={24}
                        className="cursor-pointer object-contain"
                        />
                        </Link>
                    </div>
                    {iscomment && comments.length > 0 && (
                        <Link href={`/thread/${id}`}>
                            <p className="mt-1 text-subtle-medium text-gray-1">{comments.length} Replies</p>
                        </Link>
                    )}

                </div>
          </div>
     </div>
  </div>
      </article>
    )
    }

export default ThreadCard
