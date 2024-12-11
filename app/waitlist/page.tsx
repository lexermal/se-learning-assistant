"use client";

import React, { useState } from 'react';
import { SupabaseClient } from '@/utils/supabase/client';

enum Status {
    Idle,
    Loading,
    Success,
    Error,
}

const WaitlistPage = () => {
    const [email, setEmail] = useState("");
    const [statusMessage, setStatusMessage] = useState({ status: Status.Idle, message: '' });

    const handleClick = async () => {
        if (!email) {
            setStatusMessage({ status: Status.Error, message: 'Please enter a valid email address', });
            return;
        }

        setStatusMessage({ status: Status.Loading, message: '', });

        try {
            const supabase = SupabaseClient.getClient();
            const { error } = await supabase.from('waitlist').insert({ email });

            if (!error) {
                setStatusMessage({
                    status: Status.Success,
                    message: 'You have been added to the waitlist!',
                });
                setEmail('');
            } else {
                let errorMessage = 'Failed to add you to the waitlist. Please try again.';
                if (error.code === '23505') {
                    errorMessage = 'You have already been registered to the waitlist. We will contact you when Rimori is available.';
                }
                setStatusMessage({
                    status: Status.Error,
                    message: errorMessage,
                });
            }
        } catch (error) {
            setStatusMessage({
                status: Status.Error,
                message: 'An error occurred. Please try again later.',
            });
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#0f033b] to-[#44127d] p-6 text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
                Be Part of the Excitement!
            </h1>
            <p className="text-gray-300 mb-8">
                Receive exclusive launch updates and notifications.
            </p>

            <div className="mb-6 max-w-md w-full">
                <input
                    type="email"
                    value={email}
                    placeholder="Email address..."
                    onChange={e => setEmail(e.target.value)}
                    className="w-full p-4 text-gray-900 bg-white border border-gray-200 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {statusMessage.status === Status.Error && (
                <p className="text-red-500 mb-4">{statusMessage.message}</p>
            )}
            {statusMessage.status === Status.Success ? (
                <p className="text-green-500 mb-4">{statusMessage.message}</p>
            ) : (
                <button
                    className="bg-white text-gray-900 font-semibold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out hover:bg-blue-400 hover:text-white"
                    onClick={handleClick}
                    disabled={statusMessage.status === Status.Loading}
                >
                    {statusMessage.status === Status.Loading ? "Signing you up..." : "Notify me"}
                </button>
            )}

            {/* <div className="absolute bottom-6 flex justify-center space-x-4 text-white">
                <a href="https://discord.gg/7ZSAGWSk" className="hover:text-gray-300">
                    <img src="/icons/discord.png" alt="Discord" className="h-10 w-10" />
                </a>
            </div> */}
        </div>
    );
};

export default WaitlistPage;