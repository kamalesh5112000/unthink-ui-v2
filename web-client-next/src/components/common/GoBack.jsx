import React from 'react'
import { ArrowLeftOutlined, HomeOutlined } from "@ant-design/icons";
import { useRouter } from 'next/router';
const GoBack = ({Home,handleGoBack,style}) => {
    const router = useRouter()
  return (
    <div className={`flex items-center gap-3.5 ${style}`}>

     <button
            className="group text-gray-500 flex w-fit   gap-2 rounded-full button-kiosk font-medium   transition "
            onClick={() =>handleGoBack ? handleGoBack() : router.back()}
            >
            <span className="   flex transition group-hover:-translate-x-0.5">
              <ArrowLeftOutlined />
            </span>
            <span className="capitalize">Go back</span>
          </button>
          {Home && 
            <HomeOutlined onClick={()=>router.push('/')} />
          }
            </div>
  )
}

export default GoBack