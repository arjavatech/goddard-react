import React from 'react';
import { useNavigate } from 'react-router-dom';

const DashboardCard = ({ title, href, icon, onClick }) => {
  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };
const navigate=useNavigate()
  return (
    <div className="flex justify-center">
    <a 
      onClick={ () => {
        navigate(href),
        handleClick();
      }
        
      }

     
      className="w-[80%] h-[180px] md:w-[90%] md:h-[200px] lg:w-[90%] lg:h-[225px] min-[450px]:w-[100%] bg-[#D8E9FF] border-2 border-[#0F2D52] rounded-[20px] p-2 lg:p-3 cursor-pointer hover:opacity-70 transition-opacity shadow-[0px_4px_15px_rgba(83,53,73,0.5)]"
    >
      <div className="pt-2 lg:pt-4 h-full flex flex-col items-center justify-center">
        <div className="text-center">
          {icon}
        </div>
        <h5 className="text-center text-[#0F2D52] pt-2 lg:pt-3 text-sm lg:text-2xl font-medium px-1 lg:px-0">
          {title}
        </h5>
      </div>
    </a>
  </div>
  );
};

export default DashboardCard;