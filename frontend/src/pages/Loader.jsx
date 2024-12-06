import React from 'react';

const Loader = () => {
    return (
        <div className="flex items-center justify-center h-full">
            <div className="loader border-t-4 border-b-4 border-white h-16 w-16 rounded-full animate-spin"></div>
        </div>
    );
};

export default Loader;
