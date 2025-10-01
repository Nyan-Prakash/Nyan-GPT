import React from 'react';
import { boolean } from 'zod';


interface MessageProps {
    body: string;
    role: string;

}

const Message: React.FC<MessageProps> = ({ body, role }) => {
    // Extract the first URL from the body using a regex
    const urlMatch = body.match(/https?:\/\/[^\s)]+/);

    return (
        <div className='flex flex-col gap-1' style={{ overflow: 'hidden' }}>
            <div className={`text-black w-90 p-5 rounded-3xl ${role === "user" ? "bg-blue-400 ml-15" : "bg-white mr-15 "} `}>
            <p>
                {role === "user"
                ? body.split(" ").slice(8).join(" ")
                : body}
            </p>
            </div>
             {urlMatch && (
                <button
                    className=" bg-white text-black flex items- ml-20 items-center gap-2 h-20 w-70 rounded-3xl hover:bg-gray-300 p-2"
                    onClick={() => {
                        window.open(urlMatch[0], "_blank");
                    }}
                >
                    <img src="/GooglecalIcon.svg" alt="Google Calendar Icon" className="w-12 h-12" />
                    {/* Extract the title from the URL's 'text' query parameter */}
                    {(() => {
                        try {
                            const url = new URL(urlMatch[0]);
                            const title = url.searchParams.get("text");
                            return title ? decodeURIComponent(title.replace(/\+/g, " ")) : urlMatch[0];
                        } catch {
                            return urlMatch[0];
                        }
                    })()}
                </button>
            )}
        </div>
    );
};

export default Message;