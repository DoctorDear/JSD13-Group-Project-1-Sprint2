import React from 'react';

const Subscribe = () => {
    return (
        <div className="bg-[#262b32] text-white p-6 rounded-3xl mx-4 my-6 text-center">
            <h3 className="text-lg font-bold mb-4 leading-snug">
                STAY UPTO DATE ABOUT<br />OUR LASTEST OFFERS
            </h3>
            <div className="space-y-3">
                <input
                    type="email"
                    placeholder="username@gmail.com"
                    className="w-full h-11 px-4 rounded-full bg-white text-gray-800 text-xs focus:outline-none placeholder-gray-400"
                />
                <button className="w-full h-11 bg-white text-black font-semibold rounded-full hover:bg-gray-100 transition-colors text-sm">
                    Subscribe to Newsletter
                </button>
            </div>
        </div>
    );
};

export default Subscribe;