import Image from "next/image";

interface props{
    accountId : string;
    authuserInfo : string;
    imgUrl : string;
    name: string;
    username : string;
    bio : string;
}
const ProfileHeader = ({
    accountId,
    authuserInfo,
    imgUrl,
    name,
    username,
    bio
    } : props) => {
  return (
    <div className="flex flex-col w-full justify-start">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                    <div className="h-20 w-20 object-cover relative">
                        <Image 
                        src={imgUrl}
                        alt="profile photo"
                        fill
                        className="object-cover rounded-full shadow-2xl"
                        />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-left text-heading3-bold text-light-1">{name}</h2>
                        <p className="text-base-medium text-gray-1">@{username}</p>
                    </div>
            </div>
        </div>
        <p className="mt-6 max-w-lg text-base-regular text-light-2">{bio}</p>
        <div  className="mt-12 h-0.5 w-full bg-dark-3"/>
    </div>
  )
}

export default ProfileHeader
