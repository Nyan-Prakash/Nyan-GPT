import React from 'react';
import { boolean } from 'zod';


interface MessageProps {
    body: string;
    role: string;

}

const Message: React.FC<MessageProps> = ({ body, role }) => {
    return (
        <div className={`text-black w-90 p-5 rounded-3xl ${role=="user" ? "bg-blue-400 ml-15" : "bg-white mr-15 "} `}>
            <p>{body}</p>
        </div>
    );
};

export default Message;