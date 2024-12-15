import React from 'react';
import UploadCard from './Uploadcard';


const MainContent = () => {
    return (
        <div className="flex justify-center flex-wrap p-5">
            <div className="flex justify-center items-center w-full">
                <UploadCard />
            </div>
        </div>
    );
};

export default MainContent;
